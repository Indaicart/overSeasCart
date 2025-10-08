exports.up = function(knex) {
  return knex.schema.createTable('features', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('feature_key').notNullable().unique(); // e.g., 'student_management', 'fee_management'
    table.string('feature_name').notNullable(); // e.g., 'Student Management'
    table.text('description').nullable();
    table.string('category').notNullable(); // 'core', 'academic', 'financial', 'communication', 'advanced'
    table.string('icon').nullable(); // Icon name for UI
    table.boolean('is_core').defaultTo(false); // Core features that should always be included
    table.boolean('is_active').defaultTo(true); // Super admin can disable features
    table.integer('display_order').defaultTo(0);
    table.json('metadata').nullable(); // For extensibility
    table.timestamps(true, true);
    
    table.index(['is_active']);
    table.index(['category']);
    table.index(['feature_key']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('features');
};
