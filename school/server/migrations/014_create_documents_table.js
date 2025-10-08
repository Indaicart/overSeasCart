exports.up = function(knex) {
  return knex.schema.createTable('documents', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description').nullable();
    table.string('file_name').notNullable();
    table.string('file_path').notNullable();
    table.string('file_type').notNullable();
    table.integer('file_size').notNullable();
    table.enum('category', ['academic', 'administrative', 'student_record', 'teacher_record', 'general']).notNullable();
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('student_id').references('id').inTable('students').onDelete('CASCADE').nullable();
    table.uuid('teacher_id').references('id').inTable('teachers').onDelete('CASCADE').nullable();
    table.boolean('is_public').defaultTo(false);
    table.timestamps(true, true);
    
    table.index(['category']);
    table.index(['uploaded_by']);
    table.index(['student_id']);
    table.index(['teacher_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('documents');
};
