@echo off
echo Cleaning up Node.js backend to keep only Spring Boot...
echo.

REM Remove Node.js server directory
if exist "server" (
    echo Removing Node.js server directory...
    rmdir /s /q "server"
    echo Node.js server directory removed.
) else (
    echo Node.js server directory not found.
)

REM Remove Node.js package.json from root
if exist "package.json" (
    echo Removing root package.json...
    del "package.json"
    echo Root package.json removed.
)

REM Remove setup.js
if exist "setup.js" (
    echo Removing setup.js...
    del "setup.js"
    echo setup.js removed.
)

echo.
echo Cleanup complete! Now you have:
echo - spring-backend/ (Spring Boot backend)
echo - client/ (React frontend)
echo - ui-demo.html (UI demo)
echo - MIGRATION_GUIDE.md (Migration guide)
echo.
echo To run the Spring Boot version:
echo 1. cd spring-backend
echo 2. run.bat
echo.
pause
