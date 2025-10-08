exports.up = function(knex) {
  return knex.schema.createTable('parents', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('occupation').nullable();
    table.string('workplace').nullable();
    table.string('work_phone').nullable();
    table.string('relationship_to_student').notNullable(); // father, mother, guardian
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('parents');
};
