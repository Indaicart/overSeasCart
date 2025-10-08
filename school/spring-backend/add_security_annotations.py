#!/usr/bin/env python3
"""
Script to add @PreAuthorize security annotations to all Spring Boot controllers
Run this from the spring-backend directory
"""

import os
import re

# Controller security rules mapping
SECURITY_RULES = {
    "GradeController": {
        "POST /grades": "CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN",
        "POST /grades/bulk": "CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN",
        "GET /grades": "CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN",
        "PUT /grades": "CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN",
        "DELETE /grades": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "SubjectController": {
        "POST": "SCHOOL_ADMIN, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN",
        "PUT": "SCHOOL_ADMIN, SUPER_ADMIN",
        "DELETE": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "FeeController": {
        "POST": "SCHOOL_ADMIN, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN",
        "PUT": "SCHOOL_ADMIN, SUPER_ADMIN",
        "DELETE": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "PaymentController": {
        "POST /payments": "SCHOOL_ADMIN, PARENT, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, PARENT, SUPER_ADMIN"
    },
    "SchoolController": {
        "POST": "SUPER_ADMIN",
        "GET /schools/{id}": "SCHOOL_ADMIN, SUPER_ADMIN",
        "GET /schools": "SUPER_ADMIN",
        "PUT": "SCHOOL_ADMIN, SUPER_ADMIN",
        "DELETE": "SUPER_ADMIN"
    },
    "ParentController": {
        "POST": "SCHOOL_ADMIN, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, PARENT, SUPER_ADMIN",
        "PUT": "SCHOOL_ADMIN, PARENT, SUPER_ADMIN",
        "DELETE": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "TimetableController": {
        "POST": "SCHOOL_ADMIN, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, CLASS_TEACHER, STUDENT, PARENT, SUPER_ADMIN",
        "DELETE": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "NotificationController": {
        "POST": "SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN",
        "GET": "authenticated()",
        "PUT": "authenticated()"
    },
    "DocumentController": {
        "POST": "SCHOOL_ADMIN, CLASS_TEACHER, SUPER_ADMIN",
        "GET": "SCHOOL_ADMIN, CLASS_TEACHER, STUDENT, PARENT, SUPER_ADMIN",
        "DELETE": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "StudentPortalController": {
        "*": "STUDENT"
    },
    "ParentPortalController": {
        "*": "PARENT"
    },
    "ClassTeacherPortalController": {
        "*": "CLASS_TEACHER"
    },
    "SubjectTeacherPortalController": {
        "*": "SUBJECT_TEACHER"
    },
    "PlatformAdminController": {
        "*": "SUPER_ADMIN"
    },
    "FeatureManagementController": {
        "*": "SUPER_ADMIN"
    },
    "SubscriptionController": {
        "POST": "SUPER_ADMIN",
        "GET /subscriptions/school/{schoolId}": "SCHOOL_ADMIN, SUPER_ADMIN",
        "PUT": "SUPER_ADMIN"
    },
    "PayrollController": {
        "*": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "LeaveManagementController": {
        "POST /leave/types": "SCHOOL_ADMIN, SUPER_ADMIN",
        "POST /leave/applications": "authenticated()",
        "GET": "SCHOOL_ADMIN, SUPER_ADMIN",
        "PUT": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "ActivityLogController": {
        "*": "SCHOOL_ADMIN, SUPER_ADMIN"
    },
    "UserController": {
        "GET": "authenticated()",
        "PUT": "authenticated()",
        "PUT /users/{id}/activate": "SCHOOL_ADMIN, SUPER_ADMIN",
        "PUT /users/{id}/deactivate": "SCHOOL_ADMIN, SUPER_ADMIN"
    }
}

def add_import_if_needed(content):
    """Add PreAuthorize import if not present"""
    if "import org.springframework.security.access.prepost.PreAuthorize;" in content:
        return content
    
    # Find the last import statement
    import_pattern = r'(import.*?;)\n\n'
    match = re.search(import_pattern, content, re.MULTILINE)
    
    if match:
        # Add the import before the blank line
        new_import = "import org.springframework.security.access.prepost.PreAuthorize;\n"
        content = content.replace(match.group(0), match.group(1) + "\n" + new_import + "\n")
    
    return content

def add_annotation_to_method(content, method_pattern, roles):
    """Add @PreAuthorize annotation to a method"""
    if "authenticated()" in roles:
        annotation = "    @PreAuthorize(\"isAuthenticated()\")\n"
    else:
        annotation = f"    @PreAuthorize(\"hasAnyRole('{roles}')\")\n"
    
    # Find the method and add annotation if not already present
    regex = rf'(\n    @(?:Get|Post|Put|Delete|Patch)Mapping.*?\n)(    public )'
    
    def replacer(match):
        before_method = match.group(1)
        method_def = match.group(2)
        
        # Check if @PreAuthorize already exists
        if "@PreAuthorize" in before_method:
            return match.group(0)
        
        return before_method + annotation + method_def
    
    content = re.sub(regex, replacer, content)
    return content

def process_controller(file_path, controller_name):
    """Process a single controller file"""
    if controller_name not in SECURITY_RULES:
        print(f"⚠️  No security rules defined for {controller_name}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Add import
    content = add_import_if_needed(content)
    
    # Get security rules
    rules = SECURITY_RULES[controller_name]
    
    # Apply general rule if "*" is present
    if "*" in rules:
        roles = rules["*"]
        content = add_annotation_to_method(content, ".*", roles)
    else:
        # Apply specific rules
        for method_pattern, roles in rules.items():
            content = add_annotation_to_method(content, method_pattern, roles)
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated {controller_name}")
    return True

def main():
    controller_dir = "src/main/java/com/schoolms/controller"
    
    if not os.path.exists(controller_dir):
        print(f"❌ Controller directory not found: {controller_dir}")
        print("Please run this script from the spring-backend directory")
        return
    
    # Get all controller files
    controller_files = [f for f in os.listdir(controller_dir) if f.endswith("Controller.java")]
    
    # Skip certain controllers
    skip_controllers = ["AuthController", "HealthController", "PasswordResetController", "SecureStudentController"]
    
    updated_count = 0
    skipped_count = 0
    
    for controller_file in controller_files:
        controller_name = controller_file.replace(".java", "")
        
        if controller_name in skip_controllers:
            print(f"⏭️  Skipping {controller_name} (public/example controller)")
            skipped_count += 1
            continue
        
        file_path = os.path.join(controller_dir, controller_file)
        
        if process_controller(file_path, controller_name):
            updated_count += 1
    
    print(f"\n✨ Done! Updated {updated_count} controllers, skipped {skipped_count}")

if __name__ == "__main__":
    main()

