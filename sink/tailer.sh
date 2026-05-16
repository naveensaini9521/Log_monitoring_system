#!/bin/bash
LOG_FILE="/var/www/node_application/logs/app.log"
API_URL="http://localhost:8000/api/ingest"
API_KEY="test-key"
SERVICE="my-node-app"

tail -n0 -F "$LOG_FILE" | while read line; do
  if [ -n "$line" ]; then   # skip empty lines
    curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "{\"service\":\"$SERVICE\",\"logs\":[\"$line\"]}"
  fi
done