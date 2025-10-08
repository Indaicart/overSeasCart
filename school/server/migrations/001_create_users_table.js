exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.enum('role', ['admin', 'teacher', 'student', 'parent', 'staff']).notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').nullable();
    table.string('address').nullable();
    table.date('date_of_birth').nullable();
    table.enum('gender', ['male', 'female', 'other']).nullable();
    table.string('profile_image').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['role']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
