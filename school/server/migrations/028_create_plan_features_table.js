exports.up = function(knex) {
  return knex.schema.createTable('plan_features', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('plan_id').references('id').inTable('subscription_plans').onDelete('CASCADE');
    table.uuid('feature_id').references('id').inTable('features').onDelete('CASCADE');
    table.boolean('is_included').defaultTo(true); // Whether feature is included in this plan
    table.json('limitations').nullable(); // Optional: specific limitations per plan (e.g., "max_reports": 10)
    table.timestamps(true, true);
    
    // Unique constraint: each feature can only be assigned once per plan
    table.unique(['plan_id', 'feature_id']);
    
    table.index(['plan_id']);
    table.index(['feature_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('plan_features');
};
