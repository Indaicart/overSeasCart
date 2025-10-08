exports.up = function(knex) {
  return knex.schema.createTable('platform_admins', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['super_admin', 'platform_admin', 'support_admin']).notNullable();
    table.json('permissions').nullable(); // Store specific permissions as JSON
    table.boolean('can_manage_schools').defaultTo(false);
    table.boolean('can_manage_subscriptions').defaultTo(false);
    table.boolean('can_access_analytics').defaultTo(false);
    table.boolean('can_manage_platform').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['role']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('platform_admins');
};
