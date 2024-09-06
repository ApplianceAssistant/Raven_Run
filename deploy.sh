#!/bin/bash

# Ensure we're in the correct directory
if [[ ! "$PWD" == */public_html ]]; then
    echo "This script must be run from the public_html directory."
    exit 1
fi

# Install dependencies
npm install

# Build the React app
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Create a backup of current deployment
echo "Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p "../backups/$timestamp"
cp -R index.html asset-manifest.json static "../backups/$timestamp/" 2>/dev/null

# Move build files to the public_html directory
mv build/* .
mv build/.* . 2>/dev/null
rmdir build

# Clean up
echo "Cleaning up..."
rm -rf src

echo "Deployment completed successfully."