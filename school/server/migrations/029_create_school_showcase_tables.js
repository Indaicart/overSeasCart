exports.up = async function(knex) {
  // Create achievements table
  await knex.schema.createTable('achievements', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('category').notNullable(); // 'academic', 'sports', 'cultural', 'other'
    table.date('achievement_date');
    table.string('award_by').nullable(); // Organization/authority that gave award
    table.string('image_url').nullable();
    table.json('participants').nullable(); // Students/teachers involved
    table.boolean('is_featured').defaultTo(false); // Show on homepage
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['category']);
    table.index(['is_featured']);
  });

  // Create gallery table
  await knex.schema.createTable('gallery', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.string('album_name').notNullable();
    table.text('description').nullable();
    table.string('category').notNullable(); // 'sports', 'cultural', 'academic', 'festival', 'excursion', 'other'
    table.date('event_date');
    table.string('image_url').notNullable(); // Main album cover
    table.json('images').nullable(); // Array of image URLs
    table.json('tags').nullable(); // Tags for searching
    table.integer('view_count').defaultTo(0);
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['category']);
    table.index(['is_featured']);
  });

  // Create events table
  await knex.schema.createTable('school_events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.string('event_name').notNullable();
    table.text('description');
    table.string('event_type').notNullable(); // 'sports', 'cultural', 'festival', 'academic', 'competition', 'other'
    table.timestamp('event_date').notNullable();
    table.timestamp('end_date').nullable();
    table.string('venue').nullable();
    table.string('organizer').nullable();
    table.string('image_url').nullable();
    table.json('highlights').nullable(); // Key highlights/results
    table.enum('status', ['upcoming', 'ongoing', 'completed']).defaultTo('upcoming');
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['event_type']);
    table.index(['status']);
    table.index(['event_date']);
  });

  // Create testimonials table (Optional - for parent/student testimonials)
  await knex.schema.createTable('testimonials', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.string('author_name').notNullable();
    table.string('author_role').notNullable(); // 'parent', 'student', 'alumni', 'teacher'
    table.text('testimonial_text').notNullable();
    table.string('author_image').nullable();
    table.integer('rating').defaultTo(5); // 1-5 stars
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_approved').defaultTo(false); // Admin approval required
    table.timestamps(true, true);
    
    table.index(['school_id']);
    table.index(['is_approved']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('testimonials');
  await knex.schema.dropTableIfExists('school_events');
  await knex.schema.dropTableIfExists('gallery');
  await knex.schema.dropTableIfExists('achievements');
};
