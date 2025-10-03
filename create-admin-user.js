#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 * This requires the service role key, not the anon key
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqztuvesryhkzmompoda.supabase.co';

// Note: This would need the service role key, not the anon key
// For security, we'll show how to do it manually instead

console.log('🔧 Admin User Creation Guide');
console.log('==========================\n');

console.log('To create an admin user, you have several options:\n');

console.log('1. 📱 Via Supabase Dashboard (Recommended):');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Select your project');
console.log('   - Go to Authentication > Users');
console.log('   - Click "Add user"');
console.log('   - Enter email and password');
console.log('   - Make sure "Auto Confirm User" is checked\n');

console.log('2. 🔗 Via Sign Up (if enabled):');
console.log('   - Create a signup page');
console.log('   - Use supabase.auth.signUp()');
console.log('   - Confirm email if required\n');

console.log('3. 📧 Check Email Confirmation Settings:');
console.log('   - Go to Authentication > Settings');
console.log('   - Check "Enable email confirmations"');
console.log('   - If enabled, users must confirm email before login\n');

console.log('4. 🛠️ Quick Test Setup:');
console.log('   - Disable email confirmation temporarily');
console.log('   - Create user via dashboard');
console.log('   - Test login');
console.log('   - Re-enable email confirmation\n');

// Let's also create a simple signup function for testing
console.log('5. 🧪 Test Signup Function:');
console.log('   Run: node signup-test.js');

// Create a signup test file
const signupCode = `#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqztuvesryhkzmompoda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxenR1dmVzcnloa3ptb21wb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODI2MDQsImV4cCI6MjA3NDk1ODYwNH0.H1VenzLBSEk0LkWy769IltFYsFqC47Wnsy6zkIpXDxw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const email = 'admin@test.com';
  const password = 'admin123456';
  
  console.log('Creating test user:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Signup failed:', error.message);
    
    if (error.message.includes('User already registered')) {
      console.log('✓ User already exists, trying to sign in...');
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (loginError) {
        console.error('Login failed:', loginError.message);
        if (loginError.message.includes('Email not confirmed')) {
          console.log('📧 Email confirmation required. Check Supabase Auth settings.');
        }
      } else {
        console.log('✓ Login successful!');
        console.log('User ID:', loginData.user.id);
      }
    }
  } else {
    console.log('✓ User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    
    if (!data.user.email_confirmed_at) {
      console.log('📧 Email confirmation may be required');
    }
  }
}

createTestUser().catch(console.error);
`;

require('fs').writeFileSync('signup-test.js', signupCode);
console.log('✓ Created signup-test.js');

console.log('\n🎯 Next Steps:');
console.log('1. Run: node signup-test.js');
console.log('2. Or create user via Supabase Dashboard');
console.log('3. Test login with your credentials');