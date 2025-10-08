exports.up = function(knex) {
  return knex.schema.createTable('teachers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('employee_id').unique().notNullable();
    table.string('department').nullable();
    table.string('qualification').nullable();
    table.string('specialization').nullable();
    table.date('joining_date').notNullable();
    table.enum('employment_type', ['full_time', 'part_time', 'contract', 'substitute']).defaultTo('full_time');
    table.decimal('salary', 10, 2).nullable();
    table.string('bank_account').nullable();
    table.string('tax_id').nullable();
    table.enum('status', ['active', 'inactive', 'terminated', 'on_leave']).defaultTo('active');
    table.text('bio').nullable();
    table.timestamps(true, true);
    
    table.index(['employee_id']);
    table.index(['department']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('teachers');
};
