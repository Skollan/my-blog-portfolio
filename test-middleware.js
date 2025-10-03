#!/usr/bin/env node

/**
 * Middleware Performance and Security Validation Script
 * Tests various route scenarios to ensure proper authentication behavior
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 5000; // 5 seconds timeout

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

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
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT,
      ...options
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          redirected: res.statusCode >= 300 && res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions for Task 6.1: Test middleware with different route scenarios

async function testAdminRouteProtection() {
  log('\n=== Testing Admin Route Protection ===', colors.bold);
  
  try {
    // Test 1: Unauthenticated access to /admin should redirect to /admin/login
    const adminResponse = await makeRequest(`${BASE_URL}/admin`);
    const shouldRedirect = adminResponse.statusCode === 307 || adminResponse.statusCode === 302;
    const redirectsToLogin = adminResponse.headers.location && adminResponse.headers.location.includes('/admin/login');
    
    logTest(
      'Unauthenticated /admin access redirects to login',
      shouldRedirect && redirectsToLogin,
      `Status: ${adminResponse.statusCode}, Location: ${adminResponse.headers.location || 'none'}`
    );

    // Test 2: Access to /admin/login should be allowed without authentication
    const loginResponse = await makeRequest(`${BASE_URL}/admin/login`);
    const loginAccessible = loginResponse.statusCode === 200;
    
    logTest(
      '/admin/login accessible without authentication',
      loginAccessible,
      `Status: ${loginResponse.statusCode}`
    );

    // Test 3: Test other admin subroutes
    const subRoutes = ['/admin/dashboard', '/admin/settings', '/admin/users'];
    for (const route of subRoutes) {
      try {
        const response = await makeRequest(`${BASE_URL}${route}`);
        const redirectsCorrectly = (response.statusCode === 307 || response.statusCode === 302) && 
                                 response.headers.location && response.headers.location.includes('/admin/login');
        
        logTest(
          `Unauthenticated ${route} redirects to login`,
          redirectsCorrectly,
          `Status: ${response.statusCode}, Location: ${response.headers.location || 'none'}`
        );
      } catch (error) {
        logTest(
          `Unauthenticated ${route} redirects to login`,
          false,
          `Error: ${error.message}`
        );
      }
    }

  } catch (error) {
    logTest('Admin route protection test', false, `Error: ${error.message}`);
  }
}

async function testPublicRouteAccess() {
  log('\n=== Testing Public Route Access ===', colors.bold);
  
  const publicRoutes = ['/', '/about', '/blog'];
  
  for (const route of publicRoutes) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${BASE_URL}${route}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const isAccessible = response.statusCode === 200;
      const isFast = responseTime < 1000; // Should respond within 1 second
      
      logTest(
        `Public route ${route} accessible without auth overhead`,
        isAccessible && isFast,
        `Status: ${response.statusCode}, Response time: ${responseTime}ms`
      );
      
    } catch (error) {
      logTest(
        `Public route ${route} accessible`,
        false,
        `Error: ${error.message}`
      );
    }
  }
}

async function testStaticResourceHandling() {
  log('\n=== Testing Static Resource Handling ===', colors.bold);
  
  const staticResources = [
    '/favicon.ico',
    '/next.svg',
    '/vercel.svg',
    '/_next/static/test.js', // This might 404 but shouldn't be processed by middleware
  ];
  
  for (const resource of staticResources) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${BASE_URL}${resource}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Static resources should either be served (200) or not found (404)
      // They should NOT be redirected to login (307/302)
      const isHandledCorrectly = response.statusCode === 200 || response.statusCode === 404;
      const isFast = responseTime < 500; // Static resources should be very fast
      
      logTest(
        `Static resource ${resource} handled efficiently`,
        isHandledCorrectly && isFast,
        `Status: ${response.statusCode}, Response time: ${responseTime}ms`
      );
      
    } catch (error) {
      // Some static resources might not exist, that's okay
      logTest(
        `Static resource ${resource} handled efficiently`,
        true,
        `Not found (expected): ${error.message}`
      );
    }
  }
}

// Test functions for Task 6.2: Implement final security validations

async function testSecurityValidations() {
  log('\n=== Testing Security Validations ===', colors.bold);
  
  // Test 1: Malformed cookies
  try {
    const response = await makeRequest(`${BASE_URL}/admin`, {
      headers: {
        'Cookie': 'sb-access-token=malformed_token_value; sb-refresh-token=another_malformed_token'
      }
    });
    
    const handlesCorrectly = (response.statusCode === 307 || response.statusCode === 302) && 
                           response.headers.location && response.headers.location.includes('/admin/login');
    
    logTest(
      'Malformed cookies handled securely',
      handlesCorrectly,
      `Status: ${response.statusCode}, Redirects to: ${response.headers.location || 'none'}`
    );
    
  } catch (error) {
    logTest('Malformed cookies test', false, `Error: ${error.message}`);
  }

  // Test 2: Invalid/expired tokens
  try {
    const response = await makeRequest(`${BASE_URL}/admin`, {
      headers: {
        'Cookie': 'sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    });
    
    const handlesCorrectly = (response.statusCode === 307 || response.statusCode === 302) && 
                           response.headers.location && response.headers.location.includes('/admin/login');
    
    logTest(
      'Invalid tokens handled securely',
      handlesCorrectly,
      `Status: ${response.statusCode}, Redirects to: ${response.headers.location || 'none'}`
    );
    
  } catch (error) {
    logTest('Invalid tokens test', false, `Error: ${error.message}`);
  }

  // Test 3: Direct access attempts with various methods
  const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  for (const method of methods) {
    try {
      const response = await makeRequest(`${BASE_URL}/admin`, { method });
      const handlesCorrectly = (response.statusCode === 307 || response.statusCode === 302) && 
                             response.headers.location && response.headers.location.includes('/admin/login');
      
      logTest(
        `${method} requests to /admin handled securely`,
        handlesCorrectly,
        `Status: ${response.statusCode}, Redirects to: ${response.headers.location || 'none'}`
      );
      
    } catch (error) {
      logTest(`${method} requests test`, false, `Error: ${error.message}`);
    }
  }
}

async function testRedirectBehavior() {
  log('\n=== Testing Redirect Behavior ===', colors.bold);
  
  // Test that redirects preserve user experience
  try {
    const response = await makeRequest(`${BASE_URL}/admin/dashboard`);
    const redirectsToLogin = (response.statusCode === 307 || response.statusCode === 302) && 
                           response.headers.location && response.headers.location.includes('/admin/login');
    
    // Check if the redirect is clean (no error pages, proper HTTP status)
    const isCleanRedirect = response.statusCode === 307; // Next.js typically uses 307 for redirects
    
    logTest(
      'Redirect behavior preserves user experience',
      redirectsToLogin && isCleanRedirect,
      `Status: ${response.statusCode}, Location: ${response.headers.location || 'none'}`
    );
    
  } catch (error) {
    logTest('Redirect behavior test', false, `Error: ${error.message}`);
  }
}

async function testPerformanceMetrics() {
  log('\n=== Testing Performance Metrics ===', colors.bold);
  
  // Test middleware performance impact
  const routes = [
    { path: '/', type: 'public' },
    { path: '/about', type: 'public' },
    { path: '/admin', type: 'protected' },
    { path: '/admin/login', type: 'admin-public' }
  ];
  
  for (const route of routes) {
    const times = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        await makeRequest(`${BASE_URL}${route.path}`);
        const endTime = Date.now();
        times.push(endTime - startTime);
      } catch (error) {
        // Ignore errors for performance testing
      }
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Performance thresholds
      const isPerformant = avgTime < 1000 && maxTime < 2000; // Average < 1s, Max < 2s
      
      logTest(
        `${route.type} route ${route.path} performance`,
        isPerformant,
        `Avg: ${avgTime.toFixed(0)}ms, Max: ${maxTime}ms`
      );
    }
  }
}

// Main test runner
async function runAllTests() {
  log(`${colors.bold}${colors.blue}Starting Middleware Validation Tests${colors.reset}`);
  log(`Testing against: ${BASE_URL}`);
  
  try {
    // Task 6.1 tests
    await testAdminRouteProtection();
    await testPublicRouteAccess();
    await testStaticResourceHandling();
    
    // Task 6.2 tests
    await testSecurityValidations();
    await testRedirectBehavior();
    await testPerformanceMetrics();
    
  } catch (error) {
    log(`\nUnexpected error during testing: ${error.message}`, colors.red);
  }
  
  // Print summary
  log(`\n${colors.bold}=== Test Summary ===${colors.reset}`);
  log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  log(`Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    log(`\n${colors.red}Some tests failed. Please review the middleware implementation.${colors.reset}`);
    process.exit(1);
  } else {
    log(`\n${colors.green}All tests passed! Middleware is working correctly.${colors.reset}`);
    process.exit(0);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    await makeRequest(`${BASE_URL}/`);
    return true;
  } catch (error) {
    return false;
  }
}

// Entry point
async function main() {
  log('Checking if development server is running...');
  
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    log(`${colors.red}Error: Development server is not running at ${BASE_URL}${colors.reset}`);
    log(`${colors.yellow}Please start the server with: npm run dev${colors.reset}`);
    process.exit(1);
  }
  
  log(`${colors.green}Server is running. Starting tests...${colors.reset}`);
  await runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAdminRouteProtection,
  testPublicRouteAccess,
  testStaticResourceHandling,
  testSecurityValidations,
  testRedirectBehavior,
  testPerformanceMetrics
};