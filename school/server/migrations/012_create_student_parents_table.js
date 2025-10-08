exports.up = function(knex) {
  return knex.schema.createTable('student_parents', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.uuid('parent_id').references('id').inTable('parents').onDelete('CASCADE');
    table.string('relationship').notNullable(); // father, mother, guardian
    table.boolean('is_primary').defaultTo(false);
    table.boolean('can_pickup').defaultTo(false);
    table.timestamps(true, true);
    
    table.unique(['student_id', 'parent_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('student_parents');
};
