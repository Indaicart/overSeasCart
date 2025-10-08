exports.up = function(knex) {
  return knex.schema.createTable('schools', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('address').notNullable();
    table.string('phone').nullable();
    table.string('email').nullable();
    table.string('website').nullable();
    table.string('logo').nullable();
    table.string('principal_name').nullable();
    table.text('description').nullable();
    table.string('academic_year').notNullable();
    table.date('academic_year_start').notNullable();
    table.date('academic_year_end').notNullable();
    table.json('settings').nullable(); // Store school-specific settings
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('schools');
};
