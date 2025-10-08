exports.up = function(knex) {
  return knex.schema.createTable('staff_salaries', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('teacher_id').unsigned().notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    
    // Salary Details
    table.decimal('basic_salary', 10, 2).notNullable();
    table.decimal('hra', 10, 2).defaultTo(0); // House Rent Allowance
    table.decimal('da', 10, 2).defaultTo(0); // Dearness Allowance
    table.decimal('ta', 10, 2).defaultTo(0); // Travel Allowance
    table.decimal('medical_allowance', 10, 2).defaultTo(0);
    table.decimal('other_allowances', 10, 2).defaultTo(0);
    
    // Deductions
    table.decimal('pf', 10, 2).defaultTo(0); // Provident Fund
    table.decimal('esi', 10, 2).defaultTo(0); // Employee State Insurance
    table.decimal('professional_tax', 10, 2).defaultTo(0);
    table.decimal('tds', 10, 2).defaultTo(0); // Tax Deducted at Source
    table.decimal('other_deductions', 10, 2).defaultTo(0);
    
    // Calculated Fields
    table.decimal('gross_salary', 10, 2).notNullable(); // Total before deductions
    table.decimal('net_salary', 10, 2).notNullable(); // Take-home salary
    
    // Payment Details
    table.string('payment_frequency', 20).defaultTo('monthly'); // 'monthly', 'weekly', 'bi-weekly'
    table.integer('pay_day').defaultTo(1); // Day of month for salary payment
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    
    // Bank Details
    table.string('bank_name', 100).nullable();
    table.string('account_number', 50).nullable();
    table.string('ifsc_code', 20).nullable();
    table.string('account_holder_name', 100).nullable();
    table.string('pan_number', 20).nullable();
    
    // Status
    table.boolean('is_active').defaultTo(true);
    table.text('notes').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('school_id');
    table.index('teacher_id');
    table.index('is_active');
    table.index('effective_from');
    table.unique(['teacher_id', 'effective_from']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('staff_salaries');
};

