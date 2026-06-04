#!/bin/bash
cd /var/www/AI-Assisted-Distributed-Log-Monitoring-System/backend
export PYTHONPATH=$(pwd)
# Use the FULL path to your venv's python (example below – change it!)
/var/www/AI-Assisted-Distributed-Log-Monitoring-System/venv/bin/python3 -c "from processors.anomaly_detector import check_resources; check_resources()" >> /home/naveen-saini/anomaly_detector.log 2>&1
