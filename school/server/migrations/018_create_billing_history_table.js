exports.up = function(knex) {
  return knex.schema.createTable('billing_history', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.enum('status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.enum('type', ['subscription', 'upgrade', 'addon', 'overage']).notNullable();
    table.date('billing_date').notNullable();
    table.date('due_date').nullable();
    table.date('paid_date').nullable();
    table.string('stripe_payment_intent_id').nullable();
    table.string('stripe_invoice_id').nullable();
    table.text('description').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['subscription_id']);
    table.index(['status']);
    table.index(['billing_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('billing_history');
};
