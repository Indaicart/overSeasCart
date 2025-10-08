#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up School Management System...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
  
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating environment file...');
  const envExample = fs.readFileSync(path.join(__dirname, 'server', 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Environment file created at server/.env');
  console.log('⚠️  Please update server/.env with your database credentials');
} else {
  console.log('✅ Environment file already exists');
}

// Check if PostgreSQL is available
console.log('\n🗄️  Checking database connection...');
try {
  execSync('psql --version', { stdio: 'pipe' });
  console.log('✅ PostgreSQL is installed');
} catch (error) {
  console.log('⚠️  PostgreSQL not found. Please install PostgreSQL and create a database named "school_management"');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Install PostgreSQL if not already installed');
console.log('2. Create a database named "school_management"');
console.log('3. Update server/.env with your database credentials');
console.log('4. Run database migrations: cd server && npm run migrate');
console.log('5. Seed the database: cd server && npm run seed');
console.log('6. Start the application: npm run dev');
console.log('\n🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');
console.log('\n👤 Default login credentials:');
console.log('   Admin: admin@school.com / password123');
console.log('   Teacher: teacher@school.com / password123');
console.log('   Student: student@school.com / password123');
console.log('   Parent: parent@school.com / password123');
