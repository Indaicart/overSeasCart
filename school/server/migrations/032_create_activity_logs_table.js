/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('activity_logs', (table) => {
    table.increments('id').primary();
    table.integer('school_id').unsigned().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('action', 100).notNullable(); // 'create', 'update', 'delete', 'login', 'logout', etc.
    table.string('resource_type', 50).notNullable(); // 'student', 'teacher', 'attendance', 'grade', etc.
    table.integer('resource_id').unsigned(); // ID of the affected resource
    table.text('description').notNullable(); // Human-readable description
    table.json('metadata'); // Additional data (old values, new values, etc.)
    table.string('ip_address', 45); // IPv4 or IPv6
    table.string('user_agent', 255); // Browser/device info
    table.timestamps(true, true);
    
    // Indexes for better query performance
    table.index('school_id');
    table.index('user_id');
    table.index('action');
    table.index('resource_type');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('activity_logs');
};
