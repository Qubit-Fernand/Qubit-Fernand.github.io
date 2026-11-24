#!/usr/bin/env bash
set -euo pipefail
# Run against the built site on a Linux CI runner, with Lambda detection enabled.
log_path="$(mktemp "${TMPDIR:-/tmp}/social-image-test.XXXXXX")"
AWS_LAMBDA_FUNCTION_NAME=site-ci AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x ./node_modules/.bin/next start -H 127.0.0.1 -p 43219 > "$log_path" 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if curl --noproxy '*' -sS -o /dev/null http://127.0.0.1:43219/api/search-notion 2>/dev/null; then break; fi
  sleep 1
done
if ! curl --noproxy '*' -fsS --max-time 90 'http://127.0.0.1:43219/api/social-image?id=5f6bf54917834c538f8b4c0264582174' | file --mime-type - | grep -q 'image/jpeg'; then
  tail -40 "$log_path" >&2
  exit 1
fi
printf 'Social image returned JPEG successfully.\n'
