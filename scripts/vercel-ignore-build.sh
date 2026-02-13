#!/bin/bash

# Vercel Ignored Build Step
# https://vercel.com/docs/projects/overview#ignored-build-step
#
# Exit 1 = proceed with build
# Exit 0 = skip build

echo "Checking if build is needed..."

# Always build on main branch
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  echo "✓ Main branch - proceeding with build"
  exit 1
fi

# Get changed files between this branch and main
# First try comparing against origin/main (for PRs), fall back to last commit
CHANGED_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD^ HEAD 2>/dev/null || git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo "✓ Could not determine changed files - proceeding with build"
  exit 1
fi

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# Patterns that should trigger a build
CODE_PATTERNS=(
  "^apps/"
  "^packages/"
  "^e2e/"
  "^scripts/"
  "^.github/"
  "^pnpm-lock.yaml"
  "^package.json"
  "^turbo.json"
  "^tsconfig"
)

# Check if any changed file matches code patterns
for file in $CHANGED_FILES; do
  for pattern in "${CODE_PATTERNS[@]}"; do
    if echo "$file" | grep -qE "$pattern"; then
      echo "✓ Code change detected: $file"
      echo "Proceeding with build"
      exit 1
    fi
  done
done

echo "✓ No code changes detected - skipping build"
echo "Only docs/config files changed"
exit 0
