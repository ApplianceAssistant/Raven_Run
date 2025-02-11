#!/bin/bash

# Ensure we're in the correct directory
if [[ ! "$PWD" == */public_html ]]; then
    echo "This script must be run from the public_html directory."
    exit 1
fi

# Install dependencies
#npm install

# Build the React app
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Remove existing files that will be replaced
echo "Removing existing files..."
rm -rf static index.html asset-manifest.json

# Move build files to the current directory
echo "Moving new files..."
mv build/* .
mv build/.* . 2>/dev/null || true  # Don't error if no hidden files

# Clean up
echo "Cleaning up..."
rm -rf build

echo "Deployment completed successfully."