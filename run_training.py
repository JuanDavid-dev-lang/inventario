#!/usr/bin/env python3
"""
Inventory ML Training Script
Usage: python run_training.py
This trains the ML model using historical data and saves it for predictions
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from pyml.trainer import main

if __name__ == "__main__":
    main()
