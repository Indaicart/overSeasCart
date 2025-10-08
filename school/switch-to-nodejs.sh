#!/bin/bash

echo "Switching to Node.js Backend..."
echo

# Update frontend API URL to Node.js
echo "Updating frontend configuration for Node.js..."
sed -i 's|http://localhost:5000/api|http://localhost:5000|g' client/src/contexts/AuthContext.js

echo
echo "✅ Frontend configured for Node.js backend"
echo
echo "To start the application:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: cd client && npm start"
echo
echo "Node.js Backend: http://localhost:5000"
echo "React Frontend: http://localhost:3000"
echo
