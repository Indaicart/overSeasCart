#!/bin/bash

echo "Starting School Management System - Spring Boot Backend"
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    echo "Please install Java 17 or higher"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed or not in PATH"
    echo "Please install Maven 3.6 or higher"
    exit 1
fi

echo "Java and Maven are available"
echo

# Install dependencies
echo "Installing dependencies..."
mvn clean install -DskipTests

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "Dependencies installed successfully"
echo

# Start the application
echo "Starting Spring Boot application..."
echo "Application will be available at: http://localhost:5000/api"
echo "Health check: http://localhost:5000/api/health"
echo

mvn spring-boot:run
