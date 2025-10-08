@echo off
echo Switching to Spring Boot Backend...
echo.

REM Update frontend API URL to Spring Boot
echo Updating frontend configuration for Spring Boot...
powershell -Command "(Get-Content 'client\src\contexts\AuthContext.js') -replace 'http://localhost:5000', 'http://localhost:5000/api' | Set-Content 'client\src\contexts\AuthContext.js'"

echo.
echo ✅ Frontend configured for Spring Boot backend
echo.
echo To start the application:
echo 1. Terminal 1: cd spring-backend ^&^& mvn spring-boot:run
echo 2. Terminal 2: cd client ^&^& npm start
echo.
echo Spring Boot Backend: http://localhost:5000/api
echo React Frontend: http://localhost:3000
echo.
pause
