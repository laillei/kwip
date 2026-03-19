#!/bin/bash
# Auto-restarting Next.js dev server.
# Main repo: always port 3001 (vertical-list worktree uses 3000).
# Polls localhost:3001 every 15s and restarts on 500 (cache corruption).

PORT=3001

start_server() {
  rm -rf .next
  next dev --turbo -p $PORT &
  SERVER_PID=$!
  echo "▲ Dev server started (PID $SERVER_PID) — http://localhost:$PORT/vi"
}

stop_server() {
  pkill -f "next dev" 2>/dev/null
  wait $SERVER_PID 2>/dev/null
}

trap 'stop_server; exit 0' INT TERM

start_server

# Wait for initial startup
sleep 5

while true; do
  sleep 15
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/vi 2>/dev/null)
  if [ "$STATUS" = "500" ] || [ "$STATUS" = "000" ]; then
    echo "⚠ Dev server returned $STATUS — restarting..."
    stop_server
    sleep 1
    start_server
    sleep 5
  fi
done
