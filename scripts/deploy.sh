#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the project (if necessary)
# Uncomment the following line if you have a build command
# npm run build

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."

# Define the directory to deploy
DEPLOY_DIR=public

# Check if the directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
  echo "Deployment directory $DEPLOY_DIR does not exist."
  exit 1
fi

# Navigate to the deployment directory
cd $DEPLOY_DIR

# Add all changes to git
git add .

# Commit changes
git commit -m "Deploying changes to GitHub Pages"

# Push changes to the gh-pages branch
git push origin main:gh-pages

echo "Deployment completed successfully!"