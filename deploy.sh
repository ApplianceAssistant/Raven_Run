#!/bin/bash

# Navigate to the project directory
cd /home/master/applications/CrowTours/public_html

# Install dependencies
npm install

# Build the React app
npm run build

# Move build files to the public_html directory
mv build/* .
mv build/.* . 2>/dev/null
rmdir build

# Optionally, remove development files
rm -rf src public

echo "Deployment completed"