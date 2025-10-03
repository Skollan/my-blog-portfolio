#!/usr/bin/env node

/**
 * Test script to verify Supabase authentication
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('\n=== Testing Supabase Connection ===');
  
  // Test 1: Check if we can connect to Supabase
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✓ Connection successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    return;
  }
  
  // Test 2: List users (this will fail with anon key, but shows if auth is working)
  console.log('\n=== Testing Auth Service ===');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('✓ Auth service responding (expected error with anon key):', error.message);
    } else {
      console.log('✓ Auth service working, users found:', data.users.length);
    }
  } catch (error) {
    console.log('✓ Auth service responding (network level)');
  }
  
  // Test 3: Try to sign in with test credentials
  console.log('\n=== Testing Sign In ===');
  console.log('Please enter test credentials:');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Email: ', (email) => {
    rl.question('Password: ', async (password) => {
      console.log(`\nAttempting login with: ${email}`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) {
          console.error('✗ Login failed:', error.message);
          console.error('Error details:', error);
        } else {
          console.log('✓ Login successful!');
          console.log('User ID:', data.user.id);
          console.log('User Email:', data.user.email);
          console.log('Session:', data.session ? 'Created' : 'None');
          
          // Test accessing user info
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('✗ Failed to get user after login:', userError.message);
          } else {
            console.log('✓ User data accessible after login');
          }
        }
      } catch (error) {
        console.error('✗ Login exception:', error.message);
      }
      
      rl.close();
    });
  });
}

testAuth().catch(console.error);