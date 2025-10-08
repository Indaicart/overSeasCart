#!/bin/bash

echo "Switching to Spring Boot Backend..."
echo

# Update frontend API URL to Spring Boot
echo "Updating frontend configuration for Spring Boot..."
sed -i 's|http://localhost:5000|http://localhost:5000/api|g' client/src/contexts/AuthContext.js

echo
echo "✅ Frontend configured for Spring Boot backend"
echo
echo "To start the application:"
echo "1. Terminal 1: cd spring-backend && mvn spring-boot:run"
echo "2. Terminal 2: cd client && npm start"
echo
echo "Spring Boot Backend: http://localhost:5000/api"
echo "React Frontend: http://localhost:3000"
echo
