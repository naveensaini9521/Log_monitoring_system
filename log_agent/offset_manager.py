import json
import os

OFFSET_FILE = "offset.json"


def load_offsets():

    if not os.path.exists(OFFSET_FILE):
        return {}

    with open(OFFSET_FILE) as f:
        return json.load(f)

def save_offsets(offsets):

    with open(OFFSET_FILE, "w") as f:
        json.dump(offsets, f)