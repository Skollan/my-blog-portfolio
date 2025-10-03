#!/usr/bin/env node

/**
 * Middleware Performance Benchmark Script
 * Measures the actual performance impact of the middleware on different route types
 */

const { performance } = require('perf_hooks');

// Mock Next.js request and response objects for testing
class MockNextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.nextUrl = new URL(url);
    this.cookies = new Map();
    this.headers = new Map();
    
    // Add any cookies from options
    if (options.cookies) {
      Object.entries(options.cookies).forEach(([name, value]) => {
        this.cookies.set(name, { name, value });
      });
    }
    
    // Mock cookies API
    this.cookies.getAll = () => Array.from(this.cookies.values());
    this.cookies.get = (name) => this.cookies.get(name);
    this.cookies.set = (name, value) => this.cookies.set(name, { name, value });
    this.cookies.delete = (name) => this.cookies.delete(name);
  }
}

class MockNextResponse {
  constructor() {
    this.headers = new Map();
    this.cookies = new Map();
    this.statusCode = 200;
    this.redirectUrl = null;
  }
  
  static next(options = {}) {
    return new MockNextResponse();
  }
  
  static redirect(url) {
    const response = new MockNextResponse();
    response.statusCode = 307;
    response.redirectUrl = url.toString();
    return response;
  }
}

// Mock environment variables for testing
const originalEnv = process.env;
process.env = {
  ...originalEnv,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
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

// Mock Supabase client that simulates different scenarios
function createMockSupabaseClient(scenario = 'unauthenticated') {
  return {
    auth: {
      getUser: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        
        switch (scenario) {
          case 'authenticated':
            return {
              data: { user: { id: 'test-user', email: 'test@example.com' } },
              error: null
            };
          case 'unauthenticated':
            return {
              data: { user: null },
              error: null
            };
          case 'error':
            return {
              data: { user: null },
              error: { message: 'Auth error', status: 401 }
            };
          default:
            return {
              data: { user: null },
              error: null
            };
        }
      }
    }
  };
}

// Mock the Supabase SSR module
const mockSupabaseSSR = {
  createServerClient: (url, key, options) => {
    return createMockSupabaseClient('unauthenticated');
  }
};

// Load and patch the middleware
async function loadMiddleware() {
  // Mock the dependencies
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id === '@supabase/ssr') {
      return mockSupabaseSSR;
    }
    if (id === 'next/server') {
      return { NextResponse: MockNextResponse };
    }
    return originalRequire.apply(this, arguments);
  };
  
  try {
    // Clear require cache
    delete require.cache[require.resolve('./middleware.js')];
    delete require.cache[require.resolve('./utils/supabase/middleware.js')];
    
    const middleware = require('./middleware.js');
    return middleware;
  } finally {
    // Restore original require
    Module.prototype.require = originalRequire;
  }
}

// Benchmark functions
async function benchmarkRoute(middleware, route, iterations = 100, scenario = 'unauthenticated') {
  const times = [];
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const request = new MockNextRequest(`http://localhost:3000${route}`);
    
    const startTime = performance.now();
    try {
      const result = await middleware.middleware(request);
      const endTime = performance.now();
      
      times.push(endTime - startTime);
      results.push({
        success: true,
        statusCode: result?.statusCode || 200,
        redirected: !!result?.redirectUrl,
        redirectUrl: result?.redirectUrl
      });
    } catch (error) {
      const endTime = performance.now();
      times.push(endTime - startTime);
      results.push({
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    route,
    scenario,
    iterations,
    times,
    results,
    stats: {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
      p99: times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)]
    }
  };
}

function printBenchmarkResults(results) {
  log(`\n=== Performance Results for ${results.route} ===`, colors.bold);
  log(`Scenario: ${results.scenario}`);
  log(`Iterations: ${results.iterations}`);
  
  const stats = results.stats;
  log(`\nTiming Statistics (ms):`);
  log(`  Min:    ${stats.min.toFixed(2)}ms`);
  log(`  Max:    ${stats.max.toFixed(2)}ms`);
  log(`  Avg:    ${stats.avg.toFixed(2)}ms`);
  log(`  Median: ${stats.median.toFixed(2)}ms`);
  log(`  P95:    ${stats.p95.toFixed(2)}ms`);
  log(`  P99:    ${stats.p99.toFixed(2)}ms`);
  
  // Analyze results
  const successRate = results.results.filter(r => r.success).length / results.results.length * 100;
  const redirectRate = results.results.filter(r => r.redirected).length / results.results.length * 100;
  
  log(`\nBehavior Analysis:`);
  log(`  Success Rate: ${successRate.toFixed(1)}%`);
  log(`  Redirect Rate: ${redirectRate.toFixed(1)}%`);
  
  // Performance assessment
  const isPerformant = stats.avg < 10 && stats.p95 < 50; // Very fast thresholds for middleware
  const performanceColor = isPerformant ? colors.green : colors.yellow;
  log(`  Performance: ${performanceColor}${isPerformant ? 'EXCELLENT' : 'ACCEPTABLE'}${colors.reset}`);
  
  return {
    route: results.route,
    avgTime: stats.avg,
    p95Time: stats.p95,
    successRate,
    redirectRate,
    isPerformant
  };
}

async function runPerformanceBenchmarks() {
  log(`${colors.bold}${colors.blue}Starting Middleware Performance Benchmarks${colors.reset}`);
  
  try {
    const middleware = await loadMiddleware();
    
    if (!middleware || !middleware.middleware) {
      log('Failed to load middleware', colors.red);
      return;
    }
    
    const testRoutes = [
      { route: '/', type: 'public', expectedRedirect: false },
      { route: '/about', type: 'public', expectedRedirect: false },
      { route: '/blog', type: 'public', expectedRedirect: false },
      { route: '/admin', type: 'protected', expectedRedirect: true },
      { route: '/admin/dashboard', type: 'protected', expectedRedirect: true },
      { route: '/admin/login', type: 'admin-public', expectedRedirect: false }
    ];
    
    const benchmarkResults = [];
    
    for (const testRoute of testRoutes) {
      log(`\nBenchmarking ${testRoute.route} (${testRoute.type})...`);
      
      const results = await benchmarkRoute(middleware, testRoute.route, 50);
      const summary = printBenchmarkResults(results);
      
      // Validate expected behavior
      const behaviorCorrect = testRoute.expectedRedirect ? 
        summary.redirectRate > 90 : 
        summary.redirectRate < 10;
      
      if (!behaviorCorrect) {
        log(`  ${colors.red}WARNING: Unexpected redirect behavior${colors.reset}`);
      }
      
      benchmarkResults.push({
        ...summary,
        type: testRoute.type,
        behaviorCorrect
      });
    }
    
    // Overall performance summary
    log(`\n${colors.bold}=== Overall Performance Summary ===${colors.reset}`);
    
    const publicRoutes = benchmarkResults.filter(r => r.type === 'public');
    const protectedRoutes = benchmarkResults.filter(r => r.type === 'protected');
    const adminPublicRoutes = benchmarkResults.filter(r => r.type === 'admin-public');
    
    if (publicRoutes.length > 0) {
      const avgPublicTime = publicRoutes.reduce((sum, r) => sum + r.avgTime, 0) / publicRoutes.length;
      log(`Public Routes Average: ${avgPublicTime.toFixed(2)}ms`);
    }
    
    if (protectedRoutes.length > 0) {
      const avgProtectedTime = protectedRoutes.reduce((sum, r) => sum + r.avgTime, 0) / protectedRoutes.length;
      log(`Protected Routes Average: ${avgProtectedTime.toFixed(2)}ms`);
    }
    
    if (adminPublicRoutes.length > 0) {
      const avgAdminPublicTime = adminPublicRoutes.reduce((sum, r) => sum + r.avgTime, 0) / adminPublicRoutes.length;
      log(`Admin Public Routes Average: ${avgAdminPublicTime.toFixed(2)}ms`);
    }
    
    const allPerformant = benchmarkResults.every(r => r.isPerformant);
    const allBehaviorCorrect = benchmarkResults.every(r => r.behaviorCorrect);
    
    log(`\nOverall Assessment:`);
    log(`  Performance: ${allPerformant ? colors.green + 'EXCELLENT' : colors.yellow + 'ACCEPTABLE'}${colors.reset}`);
    log(`  Behavior: ${allBehaviorCorrect ? colors.green + 'CORRECT' : colors.red + 'ISSUES DETECTED'}${colors.reset}`);
    
    return {
      allPerformant,
      allBehaviorCorrect,
      results: benchmarkResults
    };
    
  } catch (error) {
    log(`Error during benchmarking: ${error.message}`, colors.red);
    console.error(error);
    return null;
  }
}

// Run benchmarks if called directly
if (require.main === module) {
  runPerformanceBenchmarks()
    .then(results => {
      if (results && results.allPerformant && results.allBehaviorCorrect) {
        log(`\n${colors.green}All benchmarks passed!${colors.reset}`);
        process.exit(0);
      } else {
        log(`\n${colors.yellow}Some benchmarks had issues. Review the results above.${colors.reset}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceBenchmarks };