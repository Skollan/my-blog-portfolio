#!/usr/bin/env node

/**
 * Simple auth debug script
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = 'https://tqztuvesryhkzmompoda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxenR1dmVzcnloa3ptb21wb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODI2MDQsImV4cCI6MjA3NDk1ODYwNH0.H1VenzLBSEk0LkWy769IltFYsFqC47Wnsy6zkIpXDxw';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickTest() {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('✓ Supabase connection successful');
    
    // Test with a common admin email (you can change this)
    const testEmail = 'admin@test.com';
    const testPassword = 'test';
    
    console.log(`\nTesting login with: ${testEmail}`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (loginError) {
      console.error('Login failed:', loginError.message);
      console.error('Error code:', loginError.status);
      
      // Common error messages and solutions
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Possible causes:');
        console.log('1. User does not exist in auth.users table');
        console.log('2. Password is incorrect');
        console.log('3. Email confirmation required but not completed');
        console.log('4. User account is disabled');
      }
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n📧 Email confirmation required');
        console.log('Check if email confirmation is enabled in Supabase Auth settings');
      }
      
    } else {
      console.log('✓ Login successful!');
      console.log('User:', loginData.user.email);
    }
    
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

quickTest();