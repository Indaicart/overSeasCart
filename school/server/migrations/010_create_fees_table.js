exports.up = function(knex) {
  return knex.schema.createTable('fees', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.string('fee_type').notNullable(); // tuition, transport, library, etc.
    table.decimal('amount', 10, 2).notNullable();
    table.date('due_date').notNullable();
    table.enum('status', ['pending', 'paid', 'overdue', 'waived']).defaultTo('pending');
    table.date('paid_date').nullable();
    table.string('payment_method').nullable();
    table.string('transaction_id').nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    table.index(['student_id', 'status']);
    table.index(['due_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('fees');
};
