exports.up = function(knex) {
  return knex.schema.createTable('grades', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.string('assessment_type').notNullable(); // exam, quiz, assignment, project
    table.string('assessment_name').notNullable();
    table.decimal('marks_obtained', 5, 2).notNullable();
    table.decimal('total_marks', 5, 2).notNullable();
    table.decimal('percentage', 5, 2).notNullable();
    table.string('grade_letter').nullable(); // A+, A, B+, etc.
    table.decimal('gpa', 3, 2).nullable();
    table.date('assessment_date').notNullable();
    table.text('comments').nullable();
    table.uuid('graded_by').references('id').inTable('users').nullable();
    table.timestamps(true, true);
    
    table.index(['student_id', 'subject_id']);
    table.index(['class_id', 'assessment_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('grades');
};
