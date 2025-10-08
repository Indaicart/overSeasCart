exports.up = function(knex) {
  return knex.schema.createTable('subjects', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').unique().notNullable();
    table.text('description').nullable();
    table.string('department').nullable();
    table.integer('credits').defaultTo(1);
    table.boolean('is_core').defaultTo(true);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['department']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subjects');
};
