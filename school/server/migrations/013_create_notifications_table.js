exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'warning', 'success', 'error']).defaultTo('info');
    table.enum('category', ['attendance', 'grades', 'fees', 'general', 'emergency']).defaultTo('general');
    table.boolean('is_read').defaultTo(false);
    table.json('metadata').nullable(); // Additional data like links, IDs, etc.
    table.timestamps(true, true);
    
    table.index(['user_id', 'is_read']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
