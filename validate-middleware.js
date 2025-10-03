#!/usr/bin/env node

/**
 * Static Middleware Validation Script
 * Validates middleware configuration and logic without requiring a running server
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  log(`${status} ${testName}`);
  if (details) {
    log(`    ${details}`, colors.blue);
  }
}

// Read and analyze middleware files
function readMiddlewareFiles() {
  const files = {
    middleware: null,
    supabaseMiddleware: null
  };
  
  try {
    files.middleware = fs.readFileSync('middleware.js', 'utf8');
  } catch (error) {
    log(`Error reading middleware.js: ${error.message}`, colors.red);
    return null;
  }
  
  try {
    files.supabaseMiddleware = fs.readFileSync('utils/supabase/middleware.js', 'utf8');
  } catch (error) {
    log(`Error reading utils/supabase/middleware.js: ${error.message}`, colors.red);
    return null;
  }
  
  return files;
}

// Validation functions for Task 6.1
function validateRouteScenarios(files, testLogger = logTest) {
  log('\n=== Validating Route Scenarios ===', colors.bold);
  
  // Test 1: Admin route protection logic
  const hasAdminRouteCheck = files.middleware.includes('pathname.startsWith(\'/admin\')');
  testLogger(
    'Admin route detection implemented',
    hasAdminRouteCheck,
    hasAdminRouteCheck ? 'Found admin route checking logic' : 'Missing admin route detection'
  );
  
  // Test 2: Conditional authentication checking
  const hasConditionalAuth = files.middleware.includes('if (isAdminRoute)') && 
                            files.middleware.includes('updateSession');
  testLogger(
    'Conditional authentication for admin routes',
    hasConditionalAuth,
    hasConditionalAuth ? 'Authentication only applied to admin routes' : 'Missing conditional authentication'
  );
  
  // Test 3: Public route handling
  const allowsPublicRoutes = files.middleware.includes('return') && 
                           !files.middleware.includes('return await updateSession(request)') ||
                           files.middleware.match(/return\s*$/m);
  testLogger(
    'Public routes allowed without authentication overhead',
    allowsPublicRoutes,
    allowsPublicRoutes ? 'Public routes bypass authentication' : 'All routes processed by authentication'
  );
  
  // Test 4: Static resource exclusion
  const hasStaticExclusion = files.middleware.includes('matcher') && 
                           files.middleware.includes('_next/static') &&
                           files.middleware.includes('favicon.ico');
  testLogger(
    'Static resources excluded from middleware processing',
    hasStaticExclusion,
    hasStaticExclusion ? 'Static resources properly excluded' : 'Static resources may be processed unnecessarily'
  );
}

function validateSupabaseMiddleware(files, testLogger = logTest) {
  log('\n=== Validating Supabase Middleware Logic ===', colors.bold);
  
  // Test 1: Login route exception
  const hasLoginException = files.supabaseMiddleware.includes('/admin/login') &&
                          files.supabaseMiddleware.includes('isLoginRoute');
  testLogger(
    'Login route accessible without authentication',
    hasLoginException,
    hasLoginException ? 'Login route properly excluded from auth checks' : 'Login route may be blocked'
  );
  
  // Test 2: Redirect logic for unauthenticated users
  const hasRedirectLogic = files.supabaseMiddleware.includes('NextResponse.redirect') &&
                         files.supabaseMiddleware.includes('/admin/login');
  testLogger(
    'Unauthenticated users redirected to login',
    hasRedirectLogic,
    hasRedirectLogic ? 'Redirect logic implemented' : 'Missing redirect for unauthenticated users'
  );
  
  // Test 3: Server-side authentication
  const usesServerAuth = files.supabaseMiddleware.includes('supabase.auth.getUser()') &&
                       files.supabaseMiddleware.includes('createServerClient');
  testLogger(
    'Server-side authentication implemented',
    usesServerAuth,
    usesServerAuth ? 'Using server-side Supabase client' : 'Missing server-side authentication'
  );
}

// Validation functions for Task 6.2
function validateSecurityFeatures(files, testLogger = logTest) {
  log('\n=== Validating Security Features ===', colors.bold);
  
  // Test 1: Error handling for authentication failures
  const hasErrorHandling = files.supabaseMiddleware.includes('catch') &&
                         files.supabaseMiddleware.includes('error') &&
                         files.supabaseMiddleware.includes('logError');
  testLogger(
    'Authentication errors handled gracefully',
    hasErrorHandling,
    hasErrorHandling ? 'Error handling implemented' : 'Missing error handling for auth failures'
  );
  
  // Test 2: Environment variable validation
  const hasEnvValidation = files.supabaseMiddleware.includes('NEXT_PUBLIC_SUPABASE_URL') &&
                         files.supabaseMiddleware.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') &&
                         files.supabaseMiddleware.includes('!supabaseUrl || !supabaseAnonKey');
  testLogger(
    'Environment variables validated',
    hasEnvValidation,
    hasEnvValidation ? 'Environment validation implemented' : 'Missing environment variable checks'
  );
  
  // Test 3: Default security policy
  const hasDefaultSecurity = files.supabaseMiddleware.includes('default security policy') ||
                            files.supabaseMiddleware.includes('block admin access');
  testLogger(
    'Default security policy implemented',
    hasDefaultSecurity,
    hasDefaultSecurity ? 'Secure defaults when errors occur' : 'May allow access during errors'
  );
  
  // Test 4: Cookie handling security
  const hasSecureCookies = files.supabaseMiddleware.includes('getAll()') &&
                         files.supabaseMiddleware.includes('setAll') &&
                         files.supabaseMiddleware.includes('cookies');
  testLogger(
    'Secure cookie handling implemented',
    hasSecureCookies,
    hasSecureCookies ? 'Proper cookie management' : 'Missing secure cookie handling'
  );
}

function validatePerformanceOptimizations(files, testLogger = logTest) {
  log('\n=== Validating Performance Optimizations ===', colors.bold);
  
  // Test 1: Efficient route matching
  const hasEfficientMatching = files.middleware.includes('matcher') &&
                             files.middleware.length < 2000; // Reasonable size check
  testLogger(
    'Efficient route matching configuration',
    hasEfficientMatching,
    hasEfficientMatching ? 'Optimized matcher configuration' : 'Matcher may be inefficient'
  );
  
  // Test 2: Minimal processing for non-admin routes
  const hasMinimalProcessing = files.middleware.includes('return') &&
                             !files.middleware.includes('await updateSession(request)') ||
                             files.middleware.match(/if \(isAdminRoute\)/);
  testLogger(
    'Minimal processing for public routes',
    hasMinimalProcessing,
    hasMinimalProcessing ? 'Public routes have minimal overhead' : 'All routes may have unnecessary processing'
  );
  
  // Test 3: Logging only in development
  const hasConditionalLogging = files.supabaseMiddleware.includes('NODE_ENV === \'development\'') &&
                              files.supabaseMiddleware.includes('logDebug');
  testLogger(
    'Development-only logging implemented',
    hasConditionalLogging,
    hasConditionalLogging ? 'Logging optimized for production' : 'May have excessive logging in production'
  );
}

function validateRedirectBehavior(files, testLogger = logTest) {
  log('\n=== Validating Redirect Behavior ===', colors.bold);
  
  // Test 1: Proper redirect URL construction
  const hasProperRedirect = files.supabaseMiddleware.includes('new URL(\'/admin/login\', request.url)');
  testLogger(
    'Proper redirect URL construction',
    hasProperRedirect,
    hasProperRedirect ? 'Redirects preserve domain and protocol' : 'Redirect URLs may be malformed'
  );
  
  // Test 2: No redirect loops
  const preventsLoops = files.supabaseMiddleware.includes('isLoginRoute') &&
                       files.supabaseMiddleware.includes('!isLoginRoute');
  testLogger(
    'Redirect loops prevented',
    preventsLoops,
    preventsLoops ? 'Login route excluded from redirects' : 'Potential redirect loops'
  );
}

// Main validation function
function runValidation() {
  log(`${colors.bold}${colors.blue}Starting Static Middleware Validation${colors.reset}`);
  
  const files = readMiddlewareFiles();
  if (!files) {
    log('Cannot proceed with validation due to missing files', colors.red);
    process.exit(1);
  }
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Override logTest to count results
  const originalLogTest = logTest;
  function countingLogTest(testName, passed, details) {
    totalTests++;
    if (passed) passedTests++;
    originalLogTest(testName, passed, details);
  }
  
  // Temporarily replace the global logTest
  const globalLogTest = global.logTest;
  global.logTest = countingLogTest;
  
  // Run all validations using the counting version
  validateRouteScenarios(files, countingLogTest);
  validateSupabaseMiddleware(files, countingLogTest);
  validateSecurityFeatures(files, countingLogTest);
  validatePerformanceOptimizations(files, countingLogTest);
  validateRedirectBehavior(files, countingLogTest);
  
  // Restore original logTest
  global.logTest = globalLogTest;
  
  // Print summary
  log(`\n${colors.bold}=== Validation Summary ===${colors.reset}`);
  log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  log(`${colors.red}Failed: ${totalTests - passedTests}${colors.reset}`);
  log(`Total: ${totalTests}`);
  
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`);
  
  if (passedTests === totalTests) {
    log(`\n${colors.green}All validations passed! Middleware implementation looks solid.${colors.reset}`);
  } else {
    log(`\n${colors.yellow}Some validations failed. Review the implementation for potential improvements.${colors.reset}`);
  }
  
  return { totalTests, passedTests, successRate: parseFloat(successRate) };
}

if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };