#!/bin/bash

set -e  # stop on error

echo "🚀 Step 1: Building Lambda ZIP..."
cd ../../src
./build-lambda.sh

