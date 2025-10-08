exports.seed = async function(knex) {
  // Delete existing features
  await knex('plan_features').del();
  await knex('features').del();

  // Insert all system features
  const features = await knex('features').insert([
    // CORE FEATURES (Always available in all plans)
    {
      feature_key: 'dashboard',
      feature_name: 'Dashboard',
      description: 'Main dashboard with overview and statistics',
      category: 'core',
      icon: 'HomeIcon',
      is_core: true,
      is_active: true,
      display_order: 1
    },
    {
      feature_key: 'student_management',
      feature_name: 'Student Management',
      description: 'Add, edit, and manage student information',
      category: 'core',
      icon: 'UserGroupIcon',
      is_core: true,
      is_active: true,
      display_order: 2
    },
    {
      feature_key: 'teacher_management',
      feature_name: 'Teacher Management',
      description: 'Manage teacher profiles and assignments',
      category: 'core',
      icon: 'AcademicCapIcon',
      is_core: true,
      is_active: true,
      display_order: 3
    },
    {
      feature_key: 'class_management',
      feature_name: 'Class & Section Management',
      description: 'Create and manage classes and sections',
      category: 'core',
      icon: 'BookOpenIcon',
      is_core: true,
      is_active: true,
      display_order: 4
    },
    {
      feature_key: 'subject_management',
      feature_name: 'Subject Management',
      description: 'Manage subjects and curriculum',
      category: 'core',
      icon: 'ClipboardDocumentListIcon',
      is_core: true,
      is_active: true,
      display_order: 5
    },

    // ACADEMIC FEATURES
    {
      feature_key: 'attendance',
      feature_name: 'Attendance Tracking',
      description: 'Track daily student attendance',
      category: 'academic',
      icon: 'ChartBarIcon',
      is_core: false,
      is_active: true,
      display_order: 6
    },
    {
      feature_key: 'grades',
      feature_name: 'Grade Management',
      description: 'Manage student grades and assessments',
      category: 'academic',
      icon: 'ChartBarIcon',
      is_core: false,
      is_active: true,
      display_order: 7
    },
    {
      feature_key: 'timetable',
      feature_name: 'Timetable Management',
      description: 'Create and manage class schedules',
      category: 'academic',
      icon: 'CalendarIcon',
      is_core: false,
      is_active: true,
      display_order: 8
    },
    {
      feature_key: 'exams',
      feature_name: 'Exam Management',
      description: 'Schedule and manage examinations',
      category: 'academic',
      icon: 'DocumentTextIcon',
      is_core: false,
      is_active: true,
      display_order: 9
    },

    // FINANCIAL FEATURES
    {
      feature_key: 'fee_management',
      feature_name: 'Fee Management',
      description: 'Manage school fees and payments',
      category: 'financial',
      icon: 'CurrencyDollarIcon',
      is_core: false,
      is_active: true,
      display_order: 10
    },
    {
      feature_key: 'invoicing',
      feature_name: 'Invoicing & Billing',
      description: 'Generate invoices and billing reports',
      category: 'financial',
      icon: 'DocumentTextIcon',
      is_core: false,
      is_active: true,
      display_order: 11
    },
    {
      feature_key: 'payment_gateway',
      feature_name: 'Online Payment Gateway',
      description: 'Accept online fee payments',
      category: 'financial',
      icon: 'CreditCardIcon',
      is_core: false,
      is_active: true,
      display_order: 12
    },

    // COMMUNICATION FEATURES
    {
      feature_key: 'notifications',
      feature_name: 'Email Notifications',
      description: 'Send email notifications to parents and staff',
      category: 'communication',
      icon: 'BellIcon',
      is_core: false,
      is_active: true,
      display_order: 13
    },
    {
      feature_key: 'sms_notifications',
      feature_name: 'SMS Notifications',
      description: 'Send SMS alerts to parents and staff',
      category: 'communication',
      icon: 'ChatBubbleLeftIcon',
      is_core: false,
      is_active: true,
      display_order: 14
    },
    {
      feature_key: 'parent_portal',
      feature_name: 'Parent Portal',
      description: 'Portal for parents to track student progress',
      category: 'communication',
      icon: 'UsersIcon',
      is_core: false,
      is_active: true,
      display_order: 15
    },
    {
      feature_key: 'messaging',
      feature_name: 'Internal Messaging',
      description: 'Chat and messaging between users',
      category: 'communication',
      icon: 'ChatBubbleLeftRightIcon',
      is_core: false,
      is_active: true,
      display_order: 16
    },

    // ADVANCED FEATURES
    {
      feature_key: 'reports',
      feature_name: 'Basic Reports',
      description: 'Generate standard reports',
      category: 'advanced',
      icon: 'DocumentTextIcon',
      is_core: false,
      is_active: true,
      display_order: 17
    },
    {
      feature_key: 'advanced_analytics',
      feature_name: 'Advanced Analytics',
      description: 'Detailed analytics and insights',
      category: 'advanced',
      icon: 'ChartBarIcon',
      is_core: false,
      is_active: true,
      display_order: 18
    },
    {
      feature_key: 'custom_reports',
      feature_name: 'Custom Report Builder',
      description: 'Create custom reports with drag-and-drop',
      category: 'advanced',
      icon: 'DocumentChartBarIcon',
      is_core: false,
      is_active: true,
      display_order: 19
    },
    {
      feature_key: 'document_management',
      feature_name: 'Document Management',
      description: 'Store and manage school documents',
      category: 'advanced',
      icon: 'FolderIcon',
      is_core: false,
      is_active: true,
      display_order: 20
    },
    {
      feature_key: 'library_management',
      feature_name: 'Library Management',
      description: 'Manage library books and borrowing',
      category: 'advanced',
      icon: 'BookOpenIcon',
      is_core: false,
      is_active: true,
      display_order: 21
    },
    {
      feature_key: 'transport_management',
      feature_name: 'Transport Management',
      description: 'Manage school buses and routes',
      category: 'advanced',
      icon: 'TruckIcon',
      is_core: false,
      is_active: true,
      display_order: 22
    },
    {
      feature_key: 'hostel_management',
      feature_name: 'Hostel Management',
      description: 'Manage hostel rooms and allocations',
      category: 'advanced',
      icon: 'BuildingOfficeIcon',
      is_core: false,
      is_active: true,
      display_order: 23
    },
    {
      feature_key: 'api_access',
      feature_name: 'API Access',
      description: 'Access to REST API for integrations',
      category: 'advanced',
      icon: 'CodeBracketIcon',
      is_core: false,
      is_active: true,
      display_order: 24
    },
    {
      feature_key: 'custom_branding',
      feature_name: 'Custom Branding',
      description: 'Customize logo and color scheme',
      category: 'advanced',
      icon: 'PaintBrushIcon',
      is_core: false,
      is_active: true,
      display_order: 25
    },
    {
      feature_key: 'multi_campus',
      feature_name: 'Multi-Campus Support',
      description: 'Manage multiple school branches',
      category: 'advanced',
      icon: 'BuildingOffice2Icon',
      is_core: false,
      is_active: true,
      display_order: 26
    },
    {
      feature_key: 'sso_integration',
      feature_name: 'SSO Integration',
      description: 'Single Sign-On with Google/Microsoft',
      category: 'advanced',
      icon: 'KeyIcon',
      is_core: false,
      is_active: true,
      display_order: 27
    },
    {
      feature_key: 'white_label',
      feature_name: 'White Label Solution',
      description: 'Remove all platform branding',
      category: 'advanced',
      icon: 'TagIcon',
      is_core: false,
      is_active: true,
      display_order: 28
    }
  ]).returning('*');

  console.log(`✅ ${features.length} features seeded successfully!`);
  console.log('💡 Super Admin can now assign these features to subscription plans.');
};
