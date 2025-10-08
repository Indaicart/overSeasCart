/**
 * Seed: Add Survey & Quiz Management feature
 */

exports.seed = async function(knex) {
  // Check if feature already exists
  const existing = await knex('features')
    .where('feature_key', 'surveys_quizzes')
    .first();

  if (!existing) {
    await knex('features').insert({
      feature_key: 'surveys_quizzes',
      name: 'Surveys & Quizzes',
      description: 'Conduct surveys and quizzes for students, teachers, and parents. Includes grading, analytics, and reporting.',
      category: 'Assessment',
      is_active: true
    });

    console.log('✓ Added Surveys & Quizzes feature');
  } else {
    console.log('- Surveys & Quizzes feature already exists');
  }
};
