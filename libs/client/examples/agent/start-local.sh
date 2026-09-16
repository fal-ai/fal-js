#!/usr/bin/env bash
set -euo pipefail

cd "${1:?Usage: bash start-local.sh /path/to/web-app-checkout}"
test -f apps/web/package.json
test -f apps/api/package.json
test -f apps/web/.env.local || { echo 'Configure apps/web/.env.local first.' >&2; exit 1; }
test -f apps/api/.env.local || { echo 'Configure apps/api/.env.local first.' >&2; exit 1; }

if command -v lsof >/dev/null; then
  for port in 3020 3021; do
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Port $port is occupied. Stop that server or use your normal worktree launcher." >&2
      exit 1
    fi
  done
fi

export AGENT_SDK_ENABLED=1
export NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3020
export AUTH0_BASE_URL=http://127.0.0.1:3020
export WORKOS_REDIRECT_URI=http://127.0.0.1:3020/api/auth/v2/callback
export NEXT_PUBLIC_WORKOS_REDIRECT_URI="$WORKOS_REDIRECT_URI"
export NEXT_PUBLIC_LOCAL_REST_API_BASE_URL=http://127.0.0.1:3021

PORT=3021 pnpm --dir apps/api run dev &
api_pid=$!
PORT=3020 pnpm --dir apps/web run dev &
web_pid=$!
cleanup() { kill "$api_pid" "$web_pid" 2>/dev/null || true; }
trap cleanup EXIT
trap 'exit 130' INT TERM
echo 'Sign in: http://127.0.0.1:3020/agent'
echo 'Playground: http://127.0.0.1:3020/agent-sdk-demo/index.html'
wait
