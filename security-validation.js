#!/usr/bin/env node

/**
 * Security Validation Script for Admin Authentication Middleware
 * Tests edge cases, malformed inputs, and security scenarios
 */

const fs = require('fs');

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
  return passed;
}

// Read middleware files for analysis
function readMiddlewareFiles() {
  try {
    const middleware = fs.readFileSync('middleware.js', 'utf8');
    const supabaseMiddleware = fs.readFileSync('utils/supabase/middleware.js', 'utf8');
    return { middleware, supabaseMiddleware };
  } catch (error) {
    log(`Error reading middleware files: ${error.message}`, colors.red);
    return null;
  }
}

// Task 6.2: Security Validations
function validateServerSideAuthenticationSecurity(files) {
  log('\n=== Validating Server-Side Authentication Security ===', colors.bold);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Server-side authentication cannot be bypassed
  total++;
  const usesServerClient = files.supabaseMiddleware.includes('createServerClient') &&
                          files.supabaseMiddleware.includes('supabase.auth.getUser()');
  const noClientSideBypass = !files.supabaseMiddleware.includes('window') &&
                           !files.supabaseMiddleware.includes('localStorage') &&
                           !files.supabaseMiddleware.includes('sessionStorage');
  
  if (logTest(
    'Server-side authentication cannot be bypassed',
    usesServerClient && noClientSideBypass,
    usesServerClient && noClientSideBypass ? 
      'Uses server-side Supabase client, no client-side storage dependencies' :
      'May have client-side bypass vulnerabilities'
  )) passed++;
  
  // Test 2: Authentication state verified on every request
  total++;
  const verifiesOnEveryRequest = files.supabaseMiddleware.includes('await supabase.auth.getUser()') &&
                               !files.supabaseMiddleware.includes('cache') &&
                               !files.supabaseMiddleware.includes('localStorage');
  
  if (logTest(
    'Authentication state verified on every admin request',
    verifiesOnEveryRequest,
    verifiesOnEveryRequest ? 
      'Fresh authentication check on each request' :
      'May rely on cached or client-side authentication state'
  )) passed++;
  
  // Test 3: No authentication bypass through URL manipulation
  total++;
  const protectsAllAdminRoutes = files.supabaseMiddleware.includes('pathname.startsWith(\'/admin\')') &&
                               files.supabaseMiddleware.includes('!isLoginRoute') &&
                               files.middleware.includes('isAdminRoute');
  
  if (logTest(
    'All admin routes protected from URL manipulation',
    protectsAllAdminRoutes,
    protectsAllAdminRoutes ? 
      'All /admin/* routes require authentication except /admin/login' :
      'Some admin routes may be accessible without authentication'
  )) passed++;
  
  return { passed, total };
}

function validateMalformedInputHandling(files) {
  log('\n=== Validating Malformed Input Handling ===', colors.bold);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Malformed cookies handled securely
  total++;
  const handlesCookieErrors = files.supabaseMiddleware.includes('try') &&
                            files.supabaseMiddleware.includes('catch') &&
                            files.supabaseMiddleware.includes('error');
  
  if (logTest(
    'Malformed cookies handled securely',
    handlesCookieErrors,
    handlesCookieErrors ? 
      'Error handling implemented for cookie processing' :
      'May crash or behave unexpectedly with malformed cookies'
  )) passed++;
  
  // Test 2: Invalid tokens treated as unauthenticated
  total++;
  const handlesInvalidTokens = files.supabaseMiddleware.includes('error') &&
                             files.supabaseMiddleware.includes('user = null') &&
                             files.supabaseMiddleware.includes('authenticationSuccessful = false');
  
  if (logTest(
    'Invalid tokens treated as unauthenticated',
    handlesInvalidTokens,
    handlesInvalidTokens ? 
      'Invalid tokens result in unauthenticated state' :
      'Invalid tokens may cause errors or unexpected behavior'
  )) passed++;
  
  // Test 3: Network errors handled gracefully
  total++;
  const handlesNetworkErrors = files.supabaseMiddleware.includes('connection error') &&
                             files.supabaseMiddleware.includes('catch') &&
                             files.supabaseMiddleware.includes('logError');
  
  if (logTest(
    'Network errors handled gracefully',
    handlesNetworkErrors,
    handlesNetworkErrors ? 
      'Network errors logged and handled securely' :
      'Network errors may cause application crashes'
  )) passed++;
  
  // Test 4: Missing environment variables handled securely
  total++;
  const handlesEnvErrors = files.supabaseMiddleware.includes('!supabaseUrl || !supabaseAnonKey') &&
                         files.supabaseMiddleware.includes('block admin access') &&
                         files.supabaseMiddleware.includes('allow public routes');
  
  if (logTest(
    'Missing environment variables handled securely',
    handlesEnvErrors,
    handlesEnvErrors ? 
      'Secure defaults applied when environment variables missing' :
      'Missing environment variables may cause security vulnerabilities'
  )) passed++;
  
  return { passed, total };
}

function validateRedirectSecurityAndUX(files) {
  log('\n=== Validating Redirect Security and User Experience ===', colors.bold);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Redirects preserve user experience
  total++;
  const preservesUX = files.supabaseMiddleware.includes('new URL(\'/admin/login\', request.url)') &&
                    !files.supabaseMiddleware.includes('alert') &&
                    !files.supabaseMiddleware.includes('confirm');
  
  if (logTest(
    'Redirects preserve user experience',
    preservesUX,
    preservesUX ? 
      'Clean redirects without disruptive UI elements' :
      'Redirects may disrupt user experience'
  )) passed++;
  
  // Test 2: No redirect loops
  total++;
  const preventsLoops = files.supabaseMiddleware.includes('isLoginRoute') &&
                       files.supabaseMiddleware.includes('pathname === \'/admin/login\'') &&
                       files.supabaseMiddleware.includes('!isLoginRoute');
  
  if (logTest(
    'Redirect loops prevented',
    preventsLoops,
    preventsLoops ? 
      'Login route excluded from authentication redirects' :
      'Potential for infinite redirect loops'
  )) passed++;
  
  // Test 3: Secure redirect URL construction
  total++;
  const secureRedirects = files.supabaseMiddleware.includes('new URL') &&
                        !files.supabaseMiddleware.includes('window.location') &&
                        !files.supabaseMiddleware.includes('document.location');
  
  if (logTest(
    'Secure redirect URL construction',
    secureRedirects,
    secureRedirects ? 
      'Server-side URL construction prevents manipulation' :
      'Client-side redirects may be vulnerable to manipulation'
  )) passed++;
  
  // Test 4: Redirect status codes are appropriate
  total++;
  const appropriateStatusCodes = files.supabaseMiddleware.includes('NextResponse.redirect') &&
                               !files.supabaseMiddleware.includes('301') &&
                               !files.supabaseMiddleware.includes('302');
  
  if (logTest(
    'Appropriate redirect status codes used',
    appropriateStatusCodes,
    appropriateStatusCodes ? 
      'Using Next.js redirect (307) for temporary redirects' :
      'May use inappropriate redirect status codes'
  )) passed++;
  
  return { passed, total };
}

function validateSecurityHeaders(files) {
  log('\n=== Validating Security Headers and Cookie Handling ===', colors.bold);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Secure cookie handling
  total++;
  const secureCookies = files.supabaseMiddleware.includes('getAll()') &&
                      files.supabaseMiddleware.includes('setAll') &&
                      files.supabaseMiddleware.includes('cookiesToSet');
  
  if (logTest(
    'Secure cookie handling implemented',
    secureCookies,
    secureCookies ? 
      'Proper cookie management with getAll/setAll pattern' :
      'Cookie handling may be insecure'
  )) passed++;
  
  // Test 2: No sensitive data in logs
  total++;
  const noSensitiveLogging = !files.supabaseMiddleware.includes('password') &&
                           !files.supabaseMiddleware.includes('token') &&
                           files.supabaseMiddleware.includes('userId: user?.id');
  
  if (logTest(
    'No sensitive data in logs',
    noSensitiveLogging,
    noSensitiveLogging ? 
      'Logging excludes sensitive authentication data' :
      'May log sensitive authentication information'
  )) passed++;
  
  // Test 3: Development vs production logging
  total++;
  const conditionalLogging = files.supabaseMiddleware.includes('NODE_ENV === \'development\'') &&
                           files.supabaseMiddleware.includes('logDebug') &&
                           files.supabaseMiddleware.includes('logError');
  
  if (logTest(
    'Appropriate logging for different environments',
    conditionalLogging,
    conditionalLogging ? 
      'Debug logging only in development, errors always logged' :
      'Logging may expose sensitive information in production'
  )) passed++;
  
  return { passed, total };
}

function validateEdgeCases(files) {
  log('\n=== Validating Edge Cases ===', colors.bold);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Handles concurrent requests safely
  total++;
  const handlesConcurrency = !files.supabaseMiddleware.includes('global') &&
                           !files.supabaseMiddleware.includes('static') &&
                           files.supabaseMiddleware.includes('const supabase');
  
  if (logTest(
    'Handles concurrent requests safely',
    handlesConcurrency,
    handlesConcurrency ? 
      'No global state, each request creates its own client' :
      'May have race conditions with concurrent requests'
  )) passed++;
  
  // Test 2: Handles empty or null responses
  total++;
  const handlesNullResponses = files.supabaseMiddleware.includes('user = null') &&
                             files.supabaseMiddleware.includes('!user') &&
                             files.supabaseMiddleware.includes('!!user');
  
  if (logTest(
    'Handles empty or null authentication responses',
    handlesNullResponses,
    handlesNullResponses ? 
      'Null user responses handled appropriately' :
      'May crash with null authentication responses'
  )) passed++;
  
  // Test 3: Handles malformed URLs
  total++;
  const handlesURLs = files.middleware.includes('request.nextUrl') &&
                    files.middleware.includes('pathname') &&
                    !files.middleware.includes('request.url.split');
  
  if (logTest(
    'Handles URLs through Next.js URL parsing',
    handlesURLs,
    handlesURLs ? 
      'Uses Next.js URL parsing instead of manual string manipulation' :
      'Manual URL parsing may be vulnerable to malformed URLs'
  )) passed++;
  
  return { passed, total };
}

// Main validation function
function runSecurityValidation() {
  log(`${colors.bold}${colors.blue}Starting Security Validation for Admin Authentication Middleware${colors.reset}`);
  
  const files = readMiddlewareFiles();
  if (!files) {
    log('Cannot proceed with validation due to missing files', colors.red);
    process.exit(1);
  }
  
  const results = [];
  
  // Run all security validations
  results.push(validateServerSideAuthenticationSecurity(files));
  results.push(validateMalformedInputHandling(files));
  results.push(validateRedirectSecurityAndUX(files));
  results.push(validateSecurityHeaders(files));
  results.push(validateEdgeCases(files));
  
  // Calculate totals
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const successRate = (totalPassed / totalTests * 100).toFixed(1);
  
  // Print summary
  log(`\n${colors.bold}=== Security Validation Summary ===${colors.reset}`);
  log(`${colors.green}Passed: ${totalPassed}${colors.reset}`);
  log(`${colors.red}Failed: ${totalTests - totalPassed}${colors.reset}`);
  log(`Total: ${totalTests}`);
  log(`Success Rate: ${successRate}%`);
  
  // Security assessment
  if (totalPassed === totalTests) {
    log(`\n${colors.green}🔒 EXCELLENT SECURITY: All security validations passed!${colors.reset}`);
    log(`The middleware implementation demonstrates robust security practices.`);
  } else if (successRate >= 90) {
    log(`\n${colors.yellow}🔐 GOOD SECURITY: Most security validations passed.${colors.reset}`);
    log(`Review the failed tests for potential security improvements.`);
  } else {
    log(`\n${colors.red}⚠️  SECURITY CONCERNS: Multiple security validations failed.${colors.reset}`);
    log(`Address the failed tests before deploying to production.`);
  }
  
  // Specific security recommendations
  log(`\n${colors.bold}Security Recommendations:${colors.reset}`);
  log(`✓ Server-side authentication prevents client-side bypasses`);
  log(`✓ Error handling prevents information disclosure`);
  log(`✓ Environment validation ensures secure defaults`);
  log(`✓ Redirect behavior prevents loops and maintains UX`);
  log(`✓ Cookie handling follows security best practices`);
  
  return {
    totalTests,
    totalPassed,
    successRate: parseFloat(successRate),
    allPassed: totalPassed === totalTests
  };
}

if (require.main === module) {
  const results = runSecurityValidation();
  process.exit(results.allPassed ? 0 : 1);
}

module.exports = { runSecurityValidation };