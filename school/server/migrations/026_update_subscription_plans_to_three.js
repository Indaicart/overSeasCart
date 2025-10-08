exports.up = async function(knex) {
  // First, delete the Enterprise plan if it exists (keeping only 3 plans)
  await knex('subscription_plans')
    .where('name', 'Enterprise')
    .del();
  
  // Update display order for remaining 3 plans
  await knex('subscription_plans')
    .where('name', 'Basic')
    .update({ display_order: 1 });
    
  await knex('subscription_plans')
    .where('name', 'Standard')
    .update({ display_order: 2 });
    
  await knex('subscription_plans')
    .where('name', 'Premium')
    .update({ display_order: 3 });
};

exports.down = function(knex) {
  // Re-insert Enterprise plan if needed
  return knex('subscription_plans').insert({
    name: 'Enterprise',
    description: 'For large institutions with unlimited requirements',
    monthly_price: 999.00,
    annual_price: 8000.00,
    max_students: 999999,
    max_teachers: 999999,
    storage_gb: 1000,
    has_advanced_analytics: true,
    has_custom_branding: true,
    has_api_access: true,
    has_priority_support: true,
    features: JSON.stringify([]),
    is_active: true,
    display_order: 4
  });
};
