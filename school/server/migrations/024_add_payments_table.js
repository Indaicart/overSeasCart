exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('SET NULL').nullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('payment_method').notNullable(); // credit_card, bank_transfer, etc.
    table.enum('payment_status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('pending');
    table.string('transaction_id').nullable();
    table.text('payment_details').nullable(); // JSON string for additional details
    table.timestamp('payment_date').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('payments');
};
