const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('schools').del();

  // Create school
  const [school] = await knex('schools').insert({
    name: 'Greenwood High School',
    address: '123 Education Street, Learning City, LC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@greenwood.edu',
    website: 'https://greenwood.edu',
    principal_name: 'Dr. Sarah Johnson',
    description: 'A leading educational institution committed to excellence in learning and character development.',
    academic_year: '2024-2025',
    academic_year_start: '2024-08-15',
    academic_year_end: '2025-06-15',
    settings: JSON.stringify({
      grading_scale: 'A+ to F',
      attendance_threshold: 75,
      max_students_per_class: 30
    })
  }).returning('*');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('password123', 12);
  const [adminUser] = await knex('users').insert({
    email: 'admin@school.com',
    password_hash: adminPasswordHash,
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    address: '123 Admin Street, Admin City, AC 12345',
    date_of_birth: '1980-01-01',
    gender: 'other',
    is_active: true
  }).returning('*');

  // Create teacher user
  const teacherPasswordHash = await bcrypt.hash('password123', 12);
  const [teacherUser] = await knex('users').insert({
    email: 'teacher@school.com',
    password_hash: teacherPasswordHash,
    first_name: 'John',
    last_name: 'Smith',
    role: 'teacher',
    phone: '+1 (555) 234-5678',
    address: '456 Teacher Lane, Teacher City, TC 23456',
    date_of_birth: '1985-05-15',
    gender: 'male',
    is_active: true
  }).returning('*');

  // Create student user
  const studentPasswordHash = await bcrypt.hash('password123', 12);
  const [studentUser] = await knex('users').insert({
    email: 'student@school.com',
    password_hash: studentPasswordHash,
    first_name: 'Emily',
    last_name: 'Johnson',
    role: 'student',
    phone: '+1 (555) 345-6789',
    address: '789 Student Avenue, Student City, SC 34567',
    date_of_birth: '2010-03-20',
    gender: 'female',
    is_active: true
  }).returning('*');

  // Create parent user
  const parentPasswordHash = await bcrypt.hash('password123', 12);
  const [parentUser] = await knex('users').insert({
    email: 'parent@school.com',
    password_hash: parentPasswordHash,
    first_name: 'Michael',
    last_name: 'Johnson',
    role: 'parent',
    phone: '+1 (555) 456-7890',
    address: '789 Student Avenue, Student City, SC 34567',
    date_of_birth: '1982-07-10',
    gender: 'male',
    is_active: true
  }).returning('*');

  console.log('✅ Admin, teacher, student, and parent users created successfully');
};
