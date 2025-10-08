/**
 * Migration: Create surveys and quizzes tables
 * Supports surveys (feedback) and quizzes (graded assessments)
 */

exports.up = function(knex) {
  return knex.schema
    // Main surveys/quizzes table
    .createTable('surveys', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE').notNullable();
      table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      
      table.string('title').notNullable();
      table.text('description').nullable();
      table.enum('type', ['survey', 'quiz']).notNullable(); // survey = feedback, quiz = graded
      table.enum('target_audience', ['students', 'teachers', 'both', 'parents', 'all']).notNullable();
      table.enum('status', ['draft', 'published', 'closed', 'archived']).defaultTo('draft');
      
      // Quiz specific fields
      table.integer('total_marks').nullable(); // For quizzes
      table.integer('passing_marks').nullable(); // For quizzes
      table.integer('duration_minutes').nullable(); // Time limit in minutes
      table.boolean('shuffle_questions').defaultTo(false);
      table.boolean('show_results_immediately').defaultTo(true);
      table.boolean('allow_retake').defaultTo(false);
      
      // Targeting
      table.specificType('target_classes', 'uuid[]').nullable(); // Array of class IDs
      table.specificType('target_students', 'uuid[]').nullable(); // Array of student IDs
      
      // Scheduling
      table.timestamp('start_date').nullable();
      table.timestamp('end_date').nullable();
      
      table.boolean('is_anonymous').defaultTo(false);
      table.boolean('is_mandatory').defaultTo(false);
      
      table.timestamps(true, true);
    })
    
    // Questions table
    .createTable('survey_questions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('survey_id').references('id').inTable('surveys').onDelete('CASCADE').notNullable();
      
      table.integer('order').notNullable(); // Question order
      table.text('question_text').notNullable();
      table.enum('question_type', [
        'multiple_choice',
        'checkbox',
        'short_answer',
        'long_answer',
        'rating',
        'true_false',
        'dropdown'
      ]).notNullable();
      
      table.jsonb('options').nullable(); // For multiple choice, checkbox, dropdown
      table.integer('marks').nullable(); // Marks for this question (quiz only)
      table.string('correct_answer').nullable(); // For quizzes
      table.jsonb('correct_answers').nullable(); // For checkbox type (multiple correct)
      
      table.boolean('is_required').defaultTo(true);
      table.text('help_text').nullable();
      
      table.timestamps(true, true);
    })
    
    // Responses table
    .createTable('survey_responses', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('survey_id').references('id').inTable('surveys').onDelete('CASCADE').notNullable();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('submitted_at').nullable();
      table.enum('status', ['in_progress', 'submitted', 'graded']).defaultTo('in_progress');
      
      // Quiz specific
      table.integer('score').nullable(); // Calculated score
      table.integer('total_marks').nullable();
      table.decimal('percentage', 5, 2).nullable();
      table.boolean('passed').nullable();
      
      // Grading
      table.uuid('graded_by').references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('graded_at').nullable();
      table.text('feedback').nullable(); // Overall feedback from grader
      
      table.timestamps(true, true);
      
      // Unique constraint: one response per user per survey (unless retakes allowed)
      table.unique(['survey_id', 'user_id']);
    })
    
    // Individual answers table
    .createTable('survey_answers', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('response_id').references('id').inTable('survey_responses').onDelete('CASCADE').notNullable();
      table.uuid('question_id').references('id').inTable('survey_questions').onDelete('CASCADE').notNullable();
      
      table.text('answer_text').nullable(); // For text answers
      table.jsonb('answer_data').nullable(); // For multiple selections, structured data
      
      // Grading
      table.integer('marks_obtained').nullable();
      table.integer('marks_total').nullable();
      table.boolean('is_correct').nullable(); // For auto-graded questions
      table.text('feedback').nullable(); // Question-specific feedback
      
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('survey_answers')
    .dropTableIfExists('survey_responses')
    .dropTableIfExists('survey_questions')
    .dropTableIfExists('surveys');
};
