/**
 * Seed: Add school codes to existing schools
 */

exports.seed = async function(knex) {
  // Get all schools without school codes
  const schools = await knex('schools').whereNull('school_code').select('*');

  for (const school of schools) {
    // Generate school code from school name
    const schoolCode = generateSchoolCode(school.name);
    
    // Update school with code
    await knex('schools')
      .where('id', school.id)
      .update({
        school_code: schoolCode,
        updated_at: knex.fn.now()
      });
  }

  console.log(`✓ Generated school codes for ${schools.length} schools`);
};

// Helper function to generate school code
function generateSchoolCode(schoolName) {
  // Take first 3 letters of each word, convert to uppercase
  const words = schoolName.trim().split(' ');
  let code = '';
  
  for (const word of words) {
    if (code.length < 6) {
      code += word.substring(0, 3).toUpperCase();
    }
  }
  
  // Add random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900);
  code += randomNum;
  
  return code;
}

// Example outputs:
// "Green Valley High School" -> "GREVALHI784"
// "St. Mary's School" -> "STMARSCH456"
// "ABC Public School" -> "ABCPUBSCH123"
