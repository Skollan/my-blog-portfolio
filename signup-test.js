#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqztuvesryhkzmompoda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxenR1dmVzcnloa3ptb21wb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODI2MDQsImV4cCI6MjA3NDk1ODYwNH0.H1VenzLBSEk0LkWy769IltFYsFqC47Wnsy6zkIpXDxw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const email = 'admin@gmail.com';
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
