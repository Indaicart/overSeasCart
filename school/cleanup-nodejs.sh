#!/bin/bash

echo "Cleaning up Node.js backend to keep only Spring Boot..."
echo

# Remove Node.js server directory
if [ -d "server" ]; then
    echo "Removing Node.js server directory..."
    rm -rf server
    echo "Node.js server directory removed."
else
    echo "Node.js server directory not found."
fi

# Remove Node.js package.json from root
if [ -f "package.json" ]; then
    echo "Removing root package.json..."
    rm package.json
    echo "Root package.json removed."
fi

# Remove setup.js
if [ -f "setup.js" ]; then
    echo "Removing setup.js..."
    rm setup.js
    echo "setup.js removed."
fi

echo
echo "Cleanup complete! Now you have:"
echo "- spring-backend/ (Spring Boot backend)"
echo "- client/ (React frontend)"
echo "- ui-demo.html (UI demo)"
echo "- MIGRATION_GUIDE.md (Migration guide)"
echo
echo "To run the Spring Boot version:"
echo "1. cd spring-backend"
echo "2. ./run.sh"
echo
