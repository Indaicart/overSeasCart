exports.up = function(knex) {
  return knex.schema.createTable('subscription_plans', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique(); // Basic, Standard, Premium, Enterprise
    table.text('description').notNullable();
    table.decimal('monthly_price', 10, 2).notNullable();
    table.decimal('annual_price', 10, 2).notNullable();
    table.integer('max_students').notNullable();
    table.integer('max_teachers').notNullable();
    table.integer('storage_gb').notNullable();
    table.boolean('has_advanced_analytics').defaultTo(false);
    table.boolean('has_custom_branding').defaultTo(false);
    table.boolean('has_api_access').defaultTo(false);
    table.boolean('has_priority_support').defaultTo(false);
    table.json('features').notNullable(); // Array of feature strings
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0); // For ordering plans
    table.timestamps(true, true);
    
    table.index(['is_active']);
    table.index(['display_order']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('subscription_plans');
};
