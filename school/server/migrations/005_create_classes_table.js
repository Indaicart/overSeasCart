exports.up = function(knex) {
  return knex.schema.createTable('classes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable(); // e.g., "Grade 1", "Class 10A"
    table.string('code').unique().notNullable(); // e.g., "G1", "10A"
    table.integer('grade_level').notNullable();
    table.string('section').nullable();
    table.uuid('class_teacher_id').references('id').inTable('teachers').nullable();
    table.integer('max_students').defaultTo(30);
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['grade_level']);
    table.index(['code']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('classes');
};
