# Super Admin Management System

## Overview

The Super Admin Management system allows platform super administrators to manage other super admin accounts. This ensures proper access control and administrative oversight for the platform.

## Features

### 1. **View All Super Admins**
- Display a list of all super admin accounts
- Show account status (Active/Inactive)
- Highlight your own account for easy identification
- View creation dates and basic information

### 2. **Create New Super Admins**
- Create new super admin accounts with:
  - First Name
  - Last Name
  - Email (unique)
  - Password (minimum 6 characters)
- New accounts are active by default
- Email validation ensures no duplicate accounts

### 3. **Edit Super Admin Details**
- Update super admin information:
  - First Name
  - Last Name
  - Email
- Cannot edit your own account through this interface (use Profile page)

### 4. **Password Management**
- Reset passwords for other super admins
- Cannot reset your own password through this interface (use Profile page)
- Passwords must be at least 6 characters

### 5. **Activate/Deactivate Accounts**
- Deactivate super admin accounts to revoke access
- Reactivate previously deactivated accounts
- Cannot deactivate your own account (safety measure)
- Deactivated admins cannot log in

## API Endpoints

All endpoints require `super_admin` role authentication.

### GET `/api/super-admin-management`
Get all super admin accounts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/super-admin-management/:id`
Get a specific super admin by ID.

### POST `/api/super-admin-management`
Create a new super admin account.

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

### PUT `/api/super-admin-management/:id`
Update super admin details.

**Request Body:**
```json
{
  "email": "updated@example.com",
  "first_name": "Updated",
  "last_name": "Name"
}
```

### PUT `/api/super-admin-management/:id/password`
Reset a super admin's password.

**Request Body:**
```json
{
  "new_password": "newsecurepassword"
}
```

### PUT `/api/super-admin-management/:id/activate`
Activate a deactivated super admin account.

### PUT `/api/super-admin-management/:id/deactivate`
Deactivate a super admin account.

### DELETE `/api/super-admin-management/:id`
Delete (soft delete by deactivating) a super admin account.

## Security Features

### 1. **Self-Protection**
- Super admins cannot deactivate or delete their own accounts
- Password resets for own account must be done through the Profile page
- Prevents accidental account lockout

### 2. **Role-Based Access Control**
- All endpoints require `super_admin` role
- Non-super admins cannot access these endpoints
- JWT authentication required for all operations

### 3. **Email Uniqueness**
- System prevents duplicate email addresses
- Validation occurs during creation and updates

### 4. **Password Security**
- Passwords are hashed using bcrypt
- Minimum password length requirement (6 characters)
- No plaintext password storage

### 5. **Soft Delete**
- Deactivation instead of hard deletion
- Accounts can be reactivated if needed
- Maintains audit trail

## User Interface

### Navigation
Access Super Admin Management through:
1. Log in as a Super Admin
2. Navigate to **Platform Management** section in sidebar
3. Click **Super Admin Management**

### Management Dashboard Features

**Table View:**
- Name (First & Last)
- Email
- Status (Active/Inactive badge)
- Created At date
- Actions (Edit, Reset Password, Activate/Deactivate)

**Actions:**
- **Create Super Admin Button**: Opens modal to create new account
- **Edit Button**: Opens modal to update account details
- **Reset Password Button**: Opens modal to change password
- **Activate/Deactivate Button**: Toggles account status

### Visual Indicators
- **Active Status**: Green badge
- **Inactive Status**: Red badge
- **Your Account**: Blue "You" badge
- **Inactive Rows**: Gray background

## Usage Examples

### Creating a Super Admin
1. Click "Create Super Admin" button
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: securepass123
3. Click "Create"
4. New admin appears in the list

### Editing Details
1. Click "Edit" next to the admin
2. Update the information
3. Click "Update"
4. Changes are saved

### Resetting Password
1. Click "Reset Password" next to the admin
2. Enter new password (min 6 characters)
3. Click "Reset Password"
4. Admin can now log in with new password

### Deactivating an Account
1. Click "Deactivate" next to the admin
2. Account status changes to "Inactive"
3. Admin can no longer log in
4. Can be reactivated later if needed

## Best Practices

### 1. **Account Management**
- Create super admins only when necessary
- Use strong passwords (recommend >12 characters)
- Regularly review active super admin accounts
- Deactivate accounts for departed personnel

### 2. **Security**
- Change passwords periodically
- Monitor super admin activity
- Keep the number of super admins minimal
- Document who has super admin access

### 3. **Naming Conventions**
- Use real names for accountability
- Use professional email addresses
- Maintain consistent naming format

### 4. **Access Control**
- Deactivate rather than delete accounts
- Reactivate accounts only when necessary
- Review permissions regularly

## Technical Details

### Database Schema
Super admins are stored in the `users` table with:
- `role`: 'super_admin'
- `is_active`: boolean flag
- Standard user fields (email, password_hash, names, etc.)

### Frontend Components
- **Component**: `client/src/pages/Admin/SuperAdminManagement.js`
- **Route**: `/platform/super-admins`
- **Access**: Super Admin only

### Backend Routes
- **File**: `server/routes/super-admin-management.js`
- **Middleware**: `authenticateToken`, `requireSuperAdmin`
- **Validation**: express-validator for input validation

## Error Handling

### Common Errors
- **Email already exists**: Use a unique email address
- **Cannot deactivate own account**: Another admin must deactivate your account
- **Cannot reset own password**: Use Profile page for own password change
- **Password too short**: Use at least 6 characters
- **Super admin not found**: Admin may have been deleted or ID is incorrect

### Error Messages
All errors include clear, actionable messages displayed in the UI.

## Default Super Admin

The system includes one default super admin account:
- **Email**: `superadmin@schoolms.com`
- **Password**: `SuperAdmin123!`
- **Location**: Created during database seeding

⚠️ **Important**: Change the default password immediately after first login!

## Future Enhancements

Potential improvements:
1. **Audit Logs**: Track all super admin actions
2. **Permissions**: Granular permission system for super admins
3. **2FA**: Two-factor authentication for super admin accounts
4. **Session Management**: View and revoke active sessions
5. **Bulk Operations**: Activate/deactivate multiple accounts
6. **Email Notifications**: Notify admins of password changes
7. **Password Requirements**: Configurable password complexity rules
8. **Activity Dashboard**: View recent super admin activities

## Support

For issues or questions:
1. Check error messages in the UI
2. Review console logs for debugging
3. Verify JWT token is valid
4. Ensure database connection is working
5. Check that migrations are up to date

## Related Documentation

- [Platform Management](./PLATFORM_MANAGEMENT.md)
- [School Management](./SCHOOL_MANAGEMENT.md)
- [Authentication System](./AUTHENTICATION.md)
- [API Documentation](./API_DOCUMENTATION.md)
