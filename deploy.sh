#!/bin/bash

# Ensure we're in the correct directory
if [[ ! "$PWD" == */public_html ]]; then
    echo "This script must be run from the public_html directory."
    exit 1
fi

# Create permanent uploads directory if it doesn't exist
echo "Setting up permanent uploads directory..."
mkdir -p permanent_uploads/profiles
mkdir -p permanent_uploads/games
mkdir -p permanent_uploads/challenges
chmod 775 permanent_uploads
chmod 775 permanent_uploads/profiles
chmod 775 permanent_uploads/games
chmod 775 permanent_uploads/challenges

# Remove development-only files
echo "Removing development-only files..."
rm -f start-api.bat

# Install dependencies
#echo "Installing Node.js dependencies..."
#npm install

#echo "Installing PHP dependencies..."
#composer install --no-dev --optimize-autoloader

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

# Set up symbolic link for uploads
echo "Setting up uploads symbolic link..."
rm -rf uploads  # Remove existing uploads directory or link
ln -s permanent_uploads uploads

# Ensure .htaccess exists
echo "Checking .htaccess..."
if [ ! -f ".htaccess" ]; then
    echo "Creating .htaccess file..."
    cp .htaccess.example .htaccess || echo "No .htaccess.example found, skipping..."
fi

# Clean up
echo "Cleaning up..."
rm -rf build

# Set proper permissions (not permited on cloudways)
#echo "Setting permissions..."
#find . -type f -exec chmod 644 {} \;
#find . -type d -exec chmod 755 {} \;

# Restart Apache to reload environment variables
#echo "Restarting Apache..."
#if command -v systemctl &> /dev/null; then
#    sudo systemctl restart apache2 || sudo service apache2 restart
#else
#    sudo service apache2 restart
#fi

echo "Deployment completed successfully."