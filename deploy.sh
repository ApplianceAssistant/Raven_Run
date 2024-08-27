#!/bin/bash

# Get the current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Set the base directory
BASE_DIR="/home/master/applications/CrowTours/public_html"

# Set deployment directory based on branch
if [ "$BRANCH" = "main" ]; then
    DEPLOY_DIR="$BASE_DIR"
elif [ "$BRANCH" = "master" ]; then
    DEPLOY_DIR="$BASE_DIR/dev"
else
    echo "Unknown branch: $BRANCH"
    exit 1
fi

# Navigate to the project directory
cd $DEPLOY_DIR

# Install dependencies
npm install

# Build the React app
npm run build

# Move build files to the deployment directory
mv build/* .
mv build/.* . 2>/dev/null  # Suppress errors if no hidden files
rmdir build

# Optionally, remove development files to save space
rm -rf src public

echo "Deployed $BRANCH branch to $DEPLOY_DIR"