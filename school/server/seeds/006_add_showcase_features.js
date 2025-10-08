exports.seed = async function(knex) {
  // Add showcase-related features to the features table
  await knex('features').insert([
    {
      feature_key: 'achievements_showcase',
      feature_name: 'Achievements Showcase',
      description: 'Display school achievements, awards, and recognitions',
      category: 'communication',
      icon: 'TrophyIcon',
      is_core: false,
      is_active: true,
      display_order: 29
    },
    {
      feature_key: 'photo_gallery',
      feature_name: 'Photo Gallery',
      description: 'Create and manage photo galleries for events and activities',
      category: 'communication',
      icon: 'PhotoIcon',
      is_core: false,
      is_active: true,
      display_order: 30
    },
    {
      feature_key: 'events_calendar',
      feature_name: 'Events Calendar',
      description: 'Showcase school events, festivals, and cultural activities',
      category: 'communication',
      icon: 'CalendarDaysIcon',
      is_core: false,
      is_active: true,
      display_order: 31
    },
    {
      feature_key: 'testimonials',
      feature_name: 'Testimonials',
      description: 'Display parent, student, and alumni testimonials',
      category: 'communication',
      icon: 'ChatBubbleLeftEllipsisIcon',
      is_core: false,
      is_active: true,
      display_order: 32
    },
    {
      feature_key: 'public_portal',
      feature_name: 'Public School Portal',
      description: 'Public-facing website to showcase school information',
      category: 'advanced',
      icon: 'GlobeAltIcon',
      is_core: false,
      is_active: true,
      display_order: 33
    }
  ]);

  console.log('✅ Showcase features added successfully!');
  console.log('   • Achievements Showcase');
  console.log('   • Photo Gallery');
  console.log('   • Events Calendar');
  console.log('   • Testimonials');
  console.log('   • Public School Portal');
};
