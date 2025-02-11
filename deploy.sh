#!/bin/bash

# Ensure we're in the correct directory
if [[ ! "$PWD" == */public_html ]]; then
    echo "This script must be run from the public_html directory."
    exit 1
fi

# Remove development-only files
echo "Removing development-only files..."
rm -f start-api.bat

# Install dependencies
# npm install

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
# First, handle the audio directory specially
if [ -d "build/audio" ]; then
    echo "Updating audio directory..."
    rm -rf audio/*
    cp -r build/audio/* audio/
fi

# Move other build files
mv build/* . 2>/dev/null || true
mv build/.* . 2>/dev/null || true

# Ensure .htaccess exists
echo "Checking .htaccess..."
if [ ! -f ".htaccess" ]; then
    echo "Creating .htaccess file..."
    cp .htaccess.example .htaccess || echo "No .htaccess.example found, skipping..."
fi

# Ensure uploads directories exist
echo "Ensuring uploads directories exist..."
mkdir -p server/uploads/profiles
chmod 775 server/uploads
chmod 775 server/uploads/profiles

# Clean up
echo "Cleaning up..."
rm -rf build

echo "Deployment completed successfully."