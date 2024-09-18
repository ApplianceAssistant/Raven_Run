#!/bin/bash

# Clean existing files and folders from /server/
rm -rf private_html/server/*

# Move all files and folders from public_html/private_html to private_html
mv public_html/private_html/* public_html/private_html/.* private_html/ 2>/dev/null || true

# Delete the now empty private_html folder in public_html
rmdir public_html/private_html 2>/dev/null || true

# Move to the public_html directory
cd public_html || exit

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

# Copy server files to private_html
echo "Copying server files..."
cp -r ../server ../private_html/

echo "Deployment completed successfully."