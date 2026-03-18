#!/bin/bash
# Auto-restarting Next.js dev server.
# Polls localhost:3000 every 15s and restarts on 500 (cache corruption).

start_server() {
  rm -rf .next
  next dev --turbo &
  SERVER_PID=$!
  echo "▲ Dev server started (PID $SERVER_PID)"
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
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi 2>/dev/null)
  if [ "$STATUS" = "500" ] || [ "$STATUS" = "000" ]; then
    echo "⚠ Dev server returned $STATUS — restarting..."
    stop_server
    sleep 1
    start_server
    sleep 5
  fi
done
