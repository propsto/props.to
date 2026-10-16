#!/usr/bin/env bash
# Give the app Vercel project the same per-branch Neon database as auth.
#
# The Neon integration can only be linked to one Vercel project per Neon project, and
# it is linked to auth. Copy the branch-scoped DATABASE_URL(_UNPOOLED) it created for
# auth into app, so both previews share one preview/<branch> database.
#
# Usage: VERCEL_TOKEN=... VERCEL_TEAM_ID=... BRANCH=... [REPO_ID=...] sync-app-preview-db.sh
# With REPO_ID set, app is redeployed when its vars were missing (the build that raced
# this script had no preview DATABASE_URL and failed).
set -euo pipefail

: "${VERCEL_TOKEN:?}" "${VERCEL_TEAM_ID:?}" "${BRANCH:?}"
API="https://api.vercel.com"
AUTH_HDR="Authorization: Bearer $VERCEL_TOKEN"
KEYS=(DATABASE_URL DATABASE_URL_UNPOOLED)

env_id() { # project key -> id of its preview env var scoped to $BRANCH
  curl -sf -H "$AUTH_HDR" "$API/v10/projects/$1/env?teamId=$VERCEL_TEAM_ID&gitBranch=$(jq -rn --arg b "$BRANCH" '$b|@uri')" |
    jq -r --arg k "$2" --arg b "$BRANCH" '[.envs[]|select(.key==$k and .gitBranch==$b)][0].id // empty'
}

# The integration creates auth's vars when auth's deployment starts; wait for them.
for i in $(seq 1 40); do
  [ -n "$(env_id auth DATABASE_URL_UNPOOLED)" ] && break
  [ "$i" = 40 ] && { echo "::error::auth has no Neon vars for $BRANCH after 10 min"; exit 1; }
  echo "Waiting for the Neon integration to provision $BRANCH on auth ($i/40)..."
  sleep 15
done

created=false
for key in "${KEYS[@]}"; do
  value=$(curl -sf -H "$AUTH_HDR" "$API/v1/projects/auth/env/$(env_id auth "$key")?teamId=$VERCEL_TEAM_ID" | jq -r .value)
  [ -z "$(env_id app "$key")" ] && created=true
  jq -n --arg k "$key" --arg v "$value" --arg b "$BRANCH" \
    '{key:$k, value:$v, type:"encrypted", target:["preview"], gitBranch:$b}' |
    curl -sf -X POST -H "$AUTH_HDR" -H "Content-Type: application/json" -d @- \
      "$API/v10/projects/app/env?teamId=$VERCEL_TEAM_ID&upsert=true" >/dev/null
  echo "app $key for $BRANCH synced from auth"
done

if [ "$created" = true ] && [ -n "${REPO_ID:-}" ]; then
  jq -n --arg b "$BRANCH" --arg r "$REPO_ID" \
    '{name:"app", project:"app", gitSource:{type:"github", ref:$b, repoId:$r}}' |
    curl -sf -X POST -H "$AUTH_HDR" -H "Content-Type: application/json" -d @- \
      "$API/v13/deployments?teamId=$VERCEL_TEAM_ID" | jq -r '"Redeployed app: \(.url)"'
fi
