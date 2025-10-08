exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE').nullable();
    table.index(['school_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropIndex(['school_id']);
    table.dropColumn('school_id');
  });
};
