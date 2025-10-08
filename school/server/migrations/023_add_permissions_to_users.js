exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Check if permissions column doesn't exist and add it
    table.text('permissions').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('permissions');
  });
};
