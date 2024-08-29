#!/bin/bash

# Navigate to the project directory
cd /home/master/applications/CrowTours/public_html

# Install dependencies
npm install

# Build the React app
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Move build files to the public_html directory
mv build/* .
mv build/.* . 2>/dev/null
rmdir build

# Optionally, remove source files to save space
rm -rf src

echo "Deployment completed"