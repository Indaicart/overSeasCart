const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Create subjects
  const subjects = await knex('subjects').insert([
    { name: 'Mathematics', code: 'MATH', description: 'Core mathematics curriculum', department: 'Mathematics', credits: 4, is_core: true },
    { name: 'English Language', code: 'ENG', description: 'English language and literature', department: 'Languages', credits: 4, is_core: true },
    { name: 'Science', code: 'SCI', description: 'General science curriculum', department: 'Science', credits: 4, is_core: true },
    { name: 'Social Studies', code: 'SOC', description: 'History, geography, and civics', department: 'Social Sciences', credits: 3, is_core: true },
    { name: 'Physical Education', code: 'PE', description: 'Physical education and sports', department: 'Physical Education', credits: 2, is_core: false },
    { name: 'Art', code: 'ART', description: 'Visual arts and creativity', department: 'Arts', credits: 2, is_core: false },
    { name: 'Music', code: 'MUS', description: 'Music theory and practice', department: 'Arts', credits: 2, is_core: false },
    { name: 'Computer Science', code: 'CS', description: 'Computer programming and technology', department: 'Technology', credits: 3, is_core: false }
  ]).returning('*');

  // Create classes
  const classes = await knex('classes').insert([
    { name: 'Grade 1A', code: 'G1A', grade_level: 1, section: 'A', max_students: 25, description: 'First grade section A' },
    { name: 'Grade 1B', code: 'G1B', grade_level: 1, section: 'B', max_students: 25, description: 'First grade section B' },
    { name: 'Grade 2A', code: 'G2A', grade_level: 2, section: 'A', max_students: 25, description: 'Second grade section A' },
    { name: 'Grade 2B', code: 'G2B', grade_level: 2, section: 'B', max_students: 25, description: 'Second grade section B' },
    { name: 'Grade 3A', code: 'G3A', grade_level: 3, section: 'A', max_students: 30, description: 'Third grade section A' },
    { name: 'Grade 3B', code: 'G3B', grade_level: 3, section: 'B', max_students: 30, description: 'Third grade section B' },
    { name: 'Grade 4A', code: 'G4A', grade_level: 4, section: 'A', max_students: 30, description: 'Fourth grade section A' },
    { name: 'Grade 4B', code: 'G4B', grade_level: 4, section: 'B', max_students: 30, description: 'Fourth grade section B' },
    { name: 'Grade 5A', code: 'G5A', grade_level: 5, section: 'A', max_students: 30, description: 'Fifth grade section A' },
    { name: 'Grade 5B', code: 'G5B', grade_level: 5, section: 'B', max_students: 30, description: 'Fifth grade section B' }
  ]).returning('*');

  // Get teacher user
  const teacherUser = await knex('users').where('email', 'teacher@school.com').first();
  
  // Create teacher record
  const [teacher] = await knex('teachers').insert({
    user_id: teacherUser.id,
    employee_id: 'T001',
    department: 'Mathematics',
    qualification: 'M.Sc Mathematics',
    specialization: 'Algebra and Geometry',
    joining_date: '2020-08-15',
    employment_type: 'full_time',
    salary: 50000,
    status: 'active',
    bio: 'Experienced mathematics teacher with 5+ years of teaching experience.'
  }).returning('*');

  // Update class with class teacher
  await knex('classes').where('id', classes[0].id).update({ class_teacher_id: teacher.id });

  // Create additional teachers
  const additionalTeachers = [];
  const teacherData = [
    { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@school.com', department: 'Languages', employeeId: 'T002' },
    { firstName: 'David', lastName: 'Brown', email: 'david.brown@school.com', department: 'Science', employeeId: 'T003' },
    { firstName: 'Lisa', lastName: 'Davis', email: 'lisa.davis@school.com', department: 'Social Sciences', employeeId: 'T004' },
    { firstName: 'Robert', lastName: 'Miller', email: 'robert.miller@school.com', department: 'Physical Education', employeeId: 'T005' }
  ];

  for (const tData of teacherData) {
    const passwordHash = await bcrypt.hash('password123', 12);
    const [user] = await knex('users').insert({
      email: tData.email,
      password_hash: passwordHash,
      first_name: tData.firstName,
      last_name: tData.lastName,
      role: 'teacher',
      phone: '+1 (555) 000-0000',
      date_of_birth: '1985-01-01',
      gender: 'other',
      is_active: true
    }).returning('*');

    const [teacherRecord] = await knex('teachers').insert({
      user_id: user.id,
      employee_id: tData.employeeId,
      department: tData.department,
      qualification: 'B.Ed',
      joining_date: '2020-08-15',
      employment_type: 'full_time',
      salary: 45000,
      status: 'active'
    }).returning('*');

    additionalTeachers.push(teacherRecord);
  }

  // Create students
  const studentData = [
    { firstName: 'Emily', lastName: 'Johnson', email: 'emily.johnson@school.com', studentId: 'S001', classId: classes[0].id },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@school.com', studentId: 'S002', classId: classes[0].id },
    { firstName: 'Sophia', lastName: 'Brown', email: 'sophia.brown@school.com', studentId: 'S003', classId: classes[1].id },
    { firstName: 'Michael', lastName: 'Davis', email: 'michael.davis@school.com', studentId: 'S004', classId: classes[1].id },
    { firstName: 'Emma', lastName: 'Miller', email: 'emma.miller@school.com', studentId: 'S005', classId: classes[2].id },
    { firstName: 'William', lastName: 'Garcia', email: 'william.garcia@school.com', studentId: 'S006', classId: classes[2].id },
    { firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.martinez@school.com', studentId: 'S007', classId: classes[3].id },
    { firstName: 'Benjamin', lastName: 'Anderson', email: 'benjamin.anderson@school.com', studentId: 'S008', classId: classes[3].id }
  ];

  const students = [];
  for (const sData of studentData) {
    const passwordHash = await bcrypt.hash('password123', 12);
    const [user] = await knex('users').insert({
      email: sData.email,
      password_hash: passwordHash,
      first_name: sData.firstName,
      last_name: sData.lastName,
      role: 'student',
      phone: '+1 (555) 000-0000',
      date_of_birth: '2015-01-01',
      gender: 'other',
      is_active: true
    }).returning('*');

    const [student] = await knex('students').insert({
      user_id: user.id,
      student_id: sData.studentId,
      admission_number: `ADM${sData.studentId}`,
      admission_date: '2024-08-15',
      class_id: sData.classId,
      section: 'A',
      roll_number: parseInt(sData.studentId.slice(-1)),
      status: 'active'
    }).returning('*');

    students.push(student);
  }

  // Create parent records
  const parentData = [
    { firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@school.com' },
    { firstName: 'Jennifer', lastName: 'Wilson', email: 'jennifer.wilson@school.com' },
    { firstName: 'Christopher', lastName: 'Brown', email: 'christopher.brown@school.com' },
    { firstName: 'Amanda', lastName: 'Davis', email: 'amanda.davis@school.com' }
  ];

  const parents = [];
  for (const pData of parentData) {
    const passwordHash = await bcrypt.hash('password123', 12);
    const [user] = await knex('users').insert({
      email: pData.email,
      password_hash: passwordHash,
      first_name: pData.firstName,
      last_name: pData.lastName,
      role: 'parent',
      phone: '+1 (555) 000-0000',
      date_of_birth: '1980-01-01',
      gender: 'other',
      is_active: true
    }).returning('*');

    const [parent] = await knex('parents').insert({
      user_id: user.id,
      occupation: 'Professional',
      workplace: 'Various Companies',
      relationship_to_student: 'parent'
    }).returning('*');

    parents.push(parent);
  }

  // Link parents to students
  for (let i = 0; i < Math.min(parents.length, students.length); i++) {
    await knex('student_parents').insert({
      student_id: students[i].id,
      parent_id: parents[i].id,
      relationship: 'parent',
      is_primary: true,
      can_pickup: true
    });
  }

  // Create timetable entries
  const timetableEntries = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' }
  ];

  for (const cls of classes.slice(0, 4)) { // First 4 classes
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
        const subjectIndex = (dayIndex + timeIndex) % subjects.length;
        const teacherIndex = subjectIndex % (additionalTeachers.length + 1);
        const teacher = teacherIndex === 0 ? teacher : additionalTeachers[teacherIndex - 1];

        timetableEntries.push({
          class_id: cls.id,
          subject_id: subjects[subjectIndex].id,
          teacher_id: teacher.id,
          day_of_week: days[dayIndex],
          start_time: timeSlots[timeIndex].start,
          end_time: timeSlots[timeIndex].end,
          room: `Room ${Math.floor(Math.random() * 20) + 1}`,
          is_active: true
        });
      }
    }
  }

  await knex('timetable').insert(timetableEntries);

  // Create sample fees
  const feeTypes = ['Tuition', 'Transport', 'Library', 'Sports', 'Technology'];
  for (const student of students) {
    for (const feeType of feeTypes) {
      await knex('fees').insert({
        student_id: student.id,
        fee_type: feeType,
        amount: Math.floor(Math.random() * 500) + 100,
        due_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
        status: Math.random() > 0.7 ? 'paid' : 'pending'
      });
    }
  }

  // Create sample attendance records
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    for (const student of students) {
      const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      await knex('attendance').insert({
        student_id: student.id,
        class_id: student.class_id,
        date: date.toISOString().split('T')[0],
        status: status,
        marked_by: teacherUser.id
      });
    }
  }

  // Create sample grades
  for (const student of students) {
    for (const subject of subjects.slice(0, 4)) { // Core subjects only
      const marksObtained = Math.floor(Math.random() * 40) + 60; // 60-100
      const totalMarks = 100;
      const percentage = (marksObtained / totalMarks) * 100;
      
      await knex('grades').insert({
        student_id: student.id,
        subject_id: subject.id,
        class_id: student.class_id,
        assessment_type: 'exam',
        assessment_name: 'Mid-term Exam',
        marks_obtained: marksObtained,
        total_marks: totalMarks,
        percentage: percentage,
        grade_letter: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D',
        gpa: percentage >= 90 ? 4.0 : percentage >= 80 ? 3.0 : percentage >= 70 ? 2.0 : 1.0,
        assessment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        graded_by: teacherUser.id
      });
    }
  }

  console.log('✅ Sample data created successfully');
};
