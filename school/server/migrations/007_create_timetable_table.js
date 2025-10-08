exports.up = function(knex) {
  return knex.schema.createTable('timetable', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    table.uuid('teacher_id').references('id').inTable('teachers').onDelete('CASCADE');
    table.enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('room').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['class_id', 'day_of_week']);
    table.index(['teacher_id', 'day_of_week']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('timetable');
};
