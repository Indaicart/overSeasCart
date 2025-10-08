exports.up = function(knex) {
  return knex.schema.createTable('leave_balances', function(table) {
    table.increments('id').primary();
    table.integer('school_id').unsigned().notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.integer('teacher_id').unsigned().notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    table.integer('leave_type_id').unsigned().notNullable().references('id').inTable('leave_types').onDelete('CASCADE');
    
    table.integer('year').notNullable(); // Academic/Calendar year
    table.decimal('allocated', 5, 1).notNullable(); // Total allocated for the year
    table.decimal('used', 5, 1).defaultTo(0); // Days used
    table.decimal('pending', 5, 1).defaultTo(0); // Days in pending applications
    table.decimal('available', 5, 1).notNullable(); // Remaining balance
    table.decimal('carried_forward', 5, 1).defaultTo(0); // Carried from previous year
    
    table.timestamps(true, true);
    
    table.unique(['teacher_id', 'leave_type_id', 'year']);
    table.index(['school_id', 'teacher_id', 'year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('leave_balances');
};

