exports.up = function(knex) {
  return knex.schema.createTable('usage_analytics', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.date('date').notNullable();
    table.integer('active_users').defaultTo(0);
    table.integer('total_students').defaultTo(0);
    table.integer('total_teachers').defaultTo(0);
    table.integer('total_classes').defaultTo(0);
    table.integer('storage_used_mb').defaultTo(0);
    table.integer('api_calls').defaultTo(0);
    table.integer('attendance_records').defaultTo(0);
    table.integer('grade_records').defaultTo(0);
    table.integer('fee_transactions').defaultTo(0);
    table.integer('documents_uploaded').defaultTo(0);
    table.integer('notifications_sent').defaultTo(0);
    table.timestamps(true, true);
    
    table.unique(['school_id', 'date']);
    table.index(['school_id', 'date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usage_analytics');
};
