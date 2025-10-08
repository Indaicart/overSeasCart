/**
 * Migration: Add school_code column to schools table
 * This unique code will be used for school identification during login
 */

exports.up = function(knex) {
  return knex.schema.table('schools', function(table) {
    table.string('school_code', 20).unique();
    table.string('logo_url').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('schools', function(table) {
    table.dropColumn('school_code');
    table.dropColumn('logo_url');
  });
};
