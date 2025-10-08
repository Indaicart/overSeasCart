exports.up = function(knex) {
  return knex.schema.createTable('salary_payments', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('teacher_id').unsigned().notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    table.integer('staff_salary_id').unsigned().notNullable().references('id').inTable('staff_salaries').onDelete('CASCADE');
    
    // Payment Period
    table.integer('payment_month').notNullable(); // 1-12
    table.integer('payment_year').notNullable();
    
    // Amount Details
    table.decimal('gross_amount', 10, 2).notNullable();
    table.decimal('deductions', 10, 2).defaultTo(0);
    table.decimal('net_amount', 10, 2).notNullable();
    table.decimal('paid_amount', 10, 2).defaultTo(0);
    table.decimal('pending_amount', 10, 2).notNullable();
    
    // Payment Details
    table.string('payment_method', 20).notNullable(); // 'offline_cash', 'online_transfer'
    table.string('payment_status', 20).defaultTo('pending'); // 'pending', 'partial', 'paid', 'failed'
    table.date('payment_date').nullable();
    table.integer('paid_by').unsigned().nullable().references('id').inTable('users'); // Admin who processed payment
    
    // Offline Cash Payment
    table.text('offline_notes').nullable();
    table.string('receipt_number', 100).nullable();
    
    // Online Payment (Razorpay)
    table.integer('payment_id').unsigned().nullable().references('id').inTable('payments').onDelete('SET NULL');
    table.string('razorpay_order_id', 100).nullable();
    table.string('razorpay_payment_id', 100).nullable();
    
    // Salary Slip
    table.jsonb('salary_breakdown').nullable(); // Detailed breakdown of salary components
    table.string('slip_number', 100).nullable();
    table.boolean('slip_generated').defaultTo(false);
    
    // Additional Details
    table.integer('working_days').nullable();
    table.integer('present_days').nullable();
    table.integer('leave_days').nullable();
    table.decimal('bonus', 10, 2).defaultTo(0);
    table.decimal('penalty', 10, 2).defaultTo(0);
    table.text('notes').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('school_id');
    table.index('teacher_id');
    table.index('staff_salary_id');
    table.index('payment_status');
    table.index(['payment_month', 'payment_year']);
    table.index('payment_date');
    table.unique(['teacher_id', 'payment_month', 'payment_year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('salary_payments');
};

