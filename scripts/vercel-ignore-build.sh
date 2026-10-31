#!/usr/bin/env bash
# Vercel "Ignored Build Step": exit 0 skips the build, exit 1 builds.
# Production always builds. A preview builds only when its PR carries the
# "preview" label, so PRs that don't need a live preview cost no build or CPU.
# Adding the label pushes an empty commit (.github/workflows/preview_label.yaml)
# so the build starts at once. Any lookup failure builds: never block by accident.

[ "$VERCEL_ENV" = "production" ] && exit 1

PR="$VERCEL_GIT_PULL_REQUEST_ID"
if [ -z "$PR" ]; then
  echo "No pull request for this push: skipping the preview"
  exit 0
fi

# Public repo: no token needed
LABELS=$(curl -fsS "https://api.github.com/repos/propsto/props.to/issues/$PR/labels") || {
  echo "Could not read labels for PR #$PR: building anyway"
  exit 1
}

if echo "$LABELS" | grep -q '"name": *"preview"'; then
  echo "PR #$PR has the preview label: building"
  exit 1
fi

echo "PR #$PR has no preview label: skipping (add the label to build a preview)"
exit 0
