import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from processors.anomaly_detector import check_resources

if __name__ == "__main__":
    check_resources()