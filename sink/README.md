For true live logs (what you really need)
Use a continuous tailer – this script runs forever and sends each new line instantly.

Create /var/www/AI-Assisted-Distributed-Log-Monitoring-System/sink/tailer.sh

bash
#!/bin/bash
LOG_FILE="/var/www/node_application/logs/app.log"
API_URL="http://localhost:8000/api/ingest"
API_KEY="test-key"
SERVICE="my-node-app"

tail -n0 -F "$LOG_FILE" | while read line; do
  if [ -n "$line" ]; then # skip empty lines
curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "{\"service\":\"$SERVICE\",\"logs\":[\"$line\"]}"
fi

Make it executable:

bash
chmod +x /var/www/AI-Assisted-Distributed-Log-Monitoring-System/sink/tailer.sh
Run it in the background (and survive terminal close):

bash
cd /var/www/AI-Assisted-Distributed-Log-Monitoring-System/sink
nohup ./tailer.sh > tailer.log 2>&1 &
Check it’s running:

bash
ps aux | grep tailer.sh
