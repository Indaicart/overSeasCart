exports.up = function(knex) {
  return knex.schema.createTable('students', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('student_id').unique().notNullable(); // School-specific student ID
    table.string('admission_number').unique().nullable();
    table.date('admission_date').notNullable();
    table.enum('status', ['active', 'inactive', 'graduated', 'transferred', 'suspended']).defaultTo('active');
    table.string('class_id').nullable(); // Will reference classes table
    table.string('section').nullable();
    table.string('roll_number').nullable();
    table.string('blood_group').nullable();
    table.string('medical_conditions').nullable();
    table.string('emergency_contact_name').nullable();
    table.string('emergency_contact_phone').nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    table.index(['student_id']);
    table.index(['admission_number']);
    table.index(['class_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('students');
};
