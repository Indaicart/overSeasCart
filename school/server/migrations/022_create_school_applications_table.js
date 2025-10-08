exports.up = function(knex) {
  return knex.schema.createTable('school_applications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('school_name').notNullable();
    table.string('contact_email').notNullable();
    table.string('contact_phone');
    table.text('school_address');
    table.string('website');
    table.string('contact_person');
    table.string('contact_position');
    table.integer('estimated_students');
    table.integer('estimated_teachers');
    table.integer('estimated_classes');
    table.json('needed_features');
    table.string('budget_range');
    table.string('preferred_plan');
    table.integer('trial_period_days').defaultTo(30);
    table.enum('status', ['pending', 'approved', 'rejected', 'onboarded']).defaultTo('pending');
    table.string('requested_plan');
    table.string('assigned_plan');
    table.text('super_admin_notes');
    table.timestamps(true, true);
    
    table.index(['status']);
    table.index(['contact_email']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('school_applications');
};
