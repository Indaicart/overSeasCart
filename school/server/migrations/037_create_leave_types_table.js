exports.up = function(knex) {
  return knex.schema.createTable('leave_types', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    
    table.string('name', 100).notNullable(); // e.g., "Casual Leave", "Sick Leave"
    table.string('code', 20).notNullable(); // e.g., "CL", "SL", "EL"
    table.text('description').nullable();
    
    table.integer('annual_quota').notNullable(); // Days per year
    table.boolean('is_paid').defaultTo(true); // Paid or unpaid leave
    table.boolean('requires_approval').defaultTo(true);
    table.boolean('allow_half_day').defaultTo(true);
    table.boolean('can_carry_forward').defaultTo(false);
    table.integer('max_carry_forward_days').defaultTo(0);
    table.integer('min_days_notice').defaultTo(0); // Minimum notice required
    table.integer('max_consecutive_days').nullable(); // Max consecutive days allowed
    
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    
    table.timestamps(true, true);
    
    table.unique(['school_id', 'code']);
    table.index(['school_id', 'is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('leave_types');
};

