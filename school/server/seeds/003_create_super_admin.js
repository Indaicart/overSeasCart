const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Create super admin user
  const superAdminPasswordHash = await bcrypt.hash('superadmin123', 12);
  const [superAdminUser] = await knex('users').insert({
    email: 'superadmin@schoolms.com',
    password_hash: superAdminPasswordHash,
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super_admin',
    phone: '+1 (555) 000-0000',
    address: 'Platform Headquarters',
    date_of_birth: '1980-01-01',
    gender: 'other',
    is_active: true
  }).returning('*');

  // Create platform admin record
  await knex('platform_admins').insert({
    user_id: superAdminUser.id,
    role: 'super_admin',
    can_manage_schools: true,
    can_manage_subscriptions: true,
    can_access_analytics: true,
    can_manage_platform: true,
    permissions: JSON.stringify({
      create_schools: true,
      delete_schools: true,
      manage_subscriptions: true,
      view_all_analytics: true,
      manage_platform_settings: true,
      access_support_tools: true
    })
  });

  console.log('✅ Super admin created successfully');
  console.log('📧 Email: superadmin@schoolms.com');
  console.log('🔑 Password: superadmin123');
};
