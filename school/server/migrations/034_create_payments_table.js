exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('student_id').unsigned().nullable().references('id').inTable('students').onDelete('CASCADE');
    table.integer('fee_id').unsigned().nullable().references('id').inTable('fees').onDelete('SET NULL');
    
    // Payment details
    table.string('payment_type', 50).notNullable(); // 'school_subscription', 'student_fee', 'admission_fee', etc.
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('INR');
    table.string('status', 50).defaultTo('pending'); // 'pending', 'success', 'failed', 'refunded'
    
    // Razorpay details
    table.string('razorpay_order_id', 100).nullable();
    table.string('razorpay_payment_id', 100).nullable();
    table.string('razorpay_signature', 255).nullable();
    
    // Transaction details
    table.string('payment_method', 50).nullable(); // 'card', 'netbanking', 'upi', 'wallet'
    table.text('description').nullable();
    table.jsonb('metadata').nullable(); // Additional data (receipt details, etc.)
    table.string('receipt_number', 100).nullable();
    
    // Refund details
    table.string('refund_id', 100).nullable();
    table.decimal('refund_amount', 10, 2).nullable();
    table.timestamp('refund_date').nullable();
    table.text('refund_reason').nullable();
    
    // Error tracking
    table.text('error_message').nullable();
    table.string('error_code', 50).nullable();
    
    // Timestamps
    table.timestamp('payment_date').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('school_id');
    table.index('user_id');
    table.index('student_id');
    table.index('fee_id');
    table.index('razorpay_order_id');
    table.index('razorpay_payment_id');
    table.index('status');
    table.index('payment_type');
    table.index('receipt_number');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('payments');
};

