exports.up = function(knex) {
  return knex.schema.createTable('leave_applications', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('teacher_id').unsigned().notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    table.integer('leave_type_id').unsigned().notNullable().references('id').inTable('leave_types').onDelete('CASCADE');
    
    // Application Details
    table.string('application_number', 50).notNullable().unique();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_days', 5, 1).notNullable(); // Can be 0.5 for half day
    table.enum('day_type', ['full_day', 'first_half', 'second_half']).defaultTo('full_day');
    
    table.text('reason').notNullable();
    table.string('contact_during_leave', 15).nullable(); // Phone number
    table.text('attachment_url').nullable(); // Medical certificate, etc.
    
    // Approval Workflow
    table.enum('status', ['pending', 'approved', 'rejected', 'cancelled']).defaultTo('pending');
    table.integer('reviewed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at').nullable();
    table.text('review_comments').nullable();
    
    // Flags
    table.boolean('is_emergency').defaultTo(false);
    table.boolean('affects_salary').defaultTo(false); // True if unpaid leave
    table.decimal('salary_deduction_days', 5, 1).defaultTo(0);
    
    table.timestamps(true, true);
    
    table.index(['school_id', 'teacher_id', 'status']);
    table.index(['start_date', 'end_date']);
    table.index(['application_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('leave_applications');
};

