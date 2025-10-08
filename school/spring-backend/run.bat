@echo off
echo Starting School Management System - Spring Boot Backend
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo Java and Maven are available
echo.

REM Install dependencies
echo Installing dependencies...
call mvn clean install -DskipTests

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully
echo.

REM Start the application
echo Starting Spring Boot application...
echo Application will be available at: http://localhost:5000/api
echo Health check: http://localhost:5000/api/health
echo.

call mvn spring-boot:run

pause
