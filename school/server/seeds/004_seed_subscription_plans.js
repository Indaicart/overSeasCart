exports.seed = async function(knex) {
  // Delete existing plans
  await knex('subscription_plans').del();

  // Insert subscription plans
  await knex('subscription_plans').insert([
    {
      name: 'Basic',
      description: 'Perfect for small schools and educational centers',
      monthly_price: 99.00,
      annual_price: 950.00, // ~20% discount
      max_students: 200,
      max_teachers: 20,
      storage_gb: 10,
      has_advanced_analytics: false,
      has_custom_branding: false,
      has_api_access: false,
      has_priority_support: false,
      features: JSON.stringify([
        'Student Management',
        'Teacher Management',
        'Class & Subject Management',
        'Attendance Tracking',
        'Grade Management',
        'Basic Reports',
        'Parent Portal Access',
        'Email Notifications',
        'Document Storage (10GB)',
        'Email Support'
      ]),
      is_active: true,
      display_order: 1
    },
    {
      name: 'Standard',
      description: 'Ideal for growing schools with expanding needs',
      monthly_price: 299.00,
      annual_price: 2400.00, // ~33% discount
      max_students: 500,
      max_teachers: 50,
      storage_gb: 50,
      has_advanced_analytics: true,
      has_custom_branding: false,
      has_api_access: false,
      has_priority_support: true,
      features: JSON.stringify([
        'Everything in Basic',
        'Advanced Analytics & Reports',
        'Fee Management & Billing',
        'Timetable Management',
        'Exam & Assessment Tools',
        'Parent-Teacher Communication',
        'SMS Notifications',
        'Document Storage (50GB)',
        'Priority Email Support',
        'Mobile App Access'
      ]),
      is_active: true,
      display_order: 2
    },
    {
      name: 'Premium',
      description: 'For established schools seeking comprehensive solutions',
      monthly_price: 599.00,
      annual_price: 4800.00, // ~33% discount
      max_students: 1000,
      max_teachers: 100,
      storage_gb: 200,
      has_advanced_analytics: true,
      has_custom_branding: true,
      has_api_access: true,
      has_priority_support: true,
      features: JSON.stringify([
        'Everything in Standard',
        'Custom Branding & Logo',
        'API Access for Integrations',
        'Multi-Campus Support',
        'Advanced Role Management',
        'Custom Reports Builder',
        'Library Management',
        'Transport Management',
        'Hostel Management',
        'Document Storage (200GB)',
        'Phone Support',
        'Dedicated Account Manager'
      ]),
      is_active: true,
      display_order: 3
    },
    {
      name: 'Enterprise',
      description: 'For large institutions with unlimited requirements',
      monthly_price: 999.00,
      annual_price: 8000.00, // ~33% discount
      max_students: 999999, // Unlimited (using large number)
      max_teachers: 999999, // Unlimited
      storage_gb: 1000, // 1TB
      has_advanced_analytics: true,
      has_custom_branding: true,
      has_api_access: true,
      has_priority_support: true,
      features: JSON.stringify([
        'Everything in Premium',
        'Unlimited Students & Teachers',
        'Unlimited Storage (1TB+)',
        'Custom Feature Development',
        'White-Label Solution',
        'Advanced Security & Compliance',
        'SSO Integration',
        'Custom Integrations',
        'Dedicated Server Option',
        'On-Premise Deployment',
        '24/7 Priority Support',
        'Dedicated Technical Team',
        'Quarterly Business Reviews',
        'Training & Onboarding'
      ]),
      is_active: true,
      display_order: 4
    }
  ]);

  console.log('✅ Subscription plans seeded successfully!');
};
