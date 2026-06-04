import requests

def send_slack_alert(message):

    webhook = "SLACK_WEBHOOK_URL"

    requests.post(webhook, json={"text": message})