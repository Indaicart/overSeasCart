exports.up = function(knex) {
  return knex.schema.createTable('attendance', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.date('date').notNullable();
    table.enum('status', ['present', 'absent', 'late', 'excused']).notNullable();
    table.string('remarks').nullable();
    table.uuid('marked_by').references('id').inTable('users').nullable();
    table.timestamps(true, true);
    
    table.unique(['student_id', 'date']);
    table.index(['class_id', 'date']);
    table.index(['date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('attendance');
};
