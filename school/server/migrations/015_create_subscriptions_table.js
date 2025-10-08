exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.enum('plan_type', ['basic', 'standard', 'premium', 'enterprise']).notNullable();
    table.enum('status', ['active', 'inactive', 'suspended', 'cancelled', 'trial']).defaultTo('trial');
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.date('trial_end_date').nullable();
    table.decimal('monthly_price', 10, 2).notNullable();
    table.decimal('annual_price', 10, 2).nullable();
    table.enum('billing_cycle', ['monthly', 'annual']).defaultTo('monthly');
    table.integer('max_students').defaultTo(100);
    table.integer('max_teachers').defaultTo(20);
    table.integer('max_storage_gb').defaultTo(5);
    table.boolean('has_advanced_analytics').defaultTo(false);
    table.boolean('has_custom_branding').defaultTo(false);
    table.boolean('has_api_access').defaultTo(false);
    table.boolean('has_priority_support').defaultTo(false);
    table.json('features').nullable(); // Store additional features as JSON
    table.string('stripe_subscription_id').nullable();
    table.string('stripe_customer_id').nullable();
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['status']);
    table.index(['plan_type']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};
