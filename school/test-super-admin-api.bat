@echo off
echo ====================================
echo Testing Super Admin Management API
echo ====================================
echo.

echo Note: Make sure the Node.js server is running on port 5000
echo.
echo This script will test the Super Admin Management endpoints.
echo You need to have a valid Super Admin token.
echo.
echo Default Super Admin credentials:
echo Email: superadmin@schoolms.com
echo Password: SuperAdmin123!
echo.
echo To get a token, login first using the /api/auth/login endpoint
echo.
pause

echo.
echo ====================================
echo API Endpoints Available:
echo ====================================
echo.
echo GET    /api/super-admin-management          - Get all super admins
echo GET    /api/super-admin-management/:id      - Get specific super admin
echo POST   /api/super-admin-management          - Create new super admin
echo PUT    /api/super-admin-management/:id      - Update super admin
echo PUT    /api/super-admin-management/:id/password - Reset password
echo PUT    /api/super-admin-management/:id/activate - Activate account
echo PUT    /api/super-admin-management/:id/deactivate - Deactivate account
echo DELETE /api/super-admin-management/:id      - Delete super admin
echo.
echo ====================================
echo UI Access:
echo ====================================
echo.
echo 1. Login as super admin at http://localhost:3000/login
echo 2. Navigate to Platform Management section
echo 3. Click on "Super Admin Management"
echo.
echo ====================================
echo Security Features:
echo ====================================
echo.
echo - Cannot deactivate or delete your own account
echo - Cannot reset your own password through this interface
echo - All endpoints require super_admin role
echo - JWT authentication required
echo - Email uniqueness validation
echo - Password hashing with bcrypt
echo.
pause
