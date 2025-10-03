import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Development mode logging helper
function logDebug(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Auth Middleware] ${message}`, data || '')
  }
}

function logError(message, error = null) {
  console.error(`[Auth Middleware] ${message}`, error || '')
}

export async function updateSession(request) {
  const { pathname } = request.nextUrl
  
  logDebug(`Processing request for: ${pathname}`)

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Handle missing environment variables scenario
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logError('Missing Supabase environment variables', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    
    // Apply default security policy: block admin access, allow public routes
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginRoute = pathname === '/admin/login'
    
    if (isAdminRoute && !isLoginRoute) {
      logDebug('Blocking admin access due to missing environment variables')
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    logDebug('Allowing public route access despite missing environment variables')
    return supabaseResponse
  }

  let supabase
  try {
    supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
          deleteAll() {
            // Optional method for clearing cookies if needed
            const cookieNames = request.cookies.getAll().map(cookie => cookie.name)
            cookieNames.forEach(name => {
              request.cookies.delete(name)
              supabaseResponse.cookies.delete(name)
            })
          },
        },
      }
    )
  } catch (error) {
    logError('Failed to create Supabase client', error)
    
    // Apply default security policy: block admin access, allow public routes
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginRoute = pathname === '/admin/login'
    
    if (isAdminRoute && !isLoginRoute) {
      logDebug('Blocking admin access due to Supabase client creation failure')
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    return supabaseResponse
  }

  let user = null
  let authenticationSuccessful = false
  
  try {
    logDebug('Attempting to verify user authentication')
    
    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { user: authUser },
      error
    } = await supabase.auth.getUser()

    // Handle authentication errors gracefully by treating them as unauthenticated
    if (error) {
      logError('Supabase authentication error', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      user = null
      authenticationSuccessful = false
    } else {
      user = authUser
      authenticationSuccessful = true
      logDebug('User authentication verified', { 
        userId: user?.id, 
        email: user?.email 
      })
    }
  } catch (error) {
    // Handle Supabase connection errors and other unexpected errors
    logError('Supabase connection or unexpected error', {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    user = null
    authenticationSuccessful = false
    
    // For connection errors, we still want to apply security policy
    logDebug('Treating connection error as unauthenticated user')
  }

  // Admin route protection logic
  // Check if this is an admin route (starts with /admin)
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Allow access to /admin/login without authentication
  const isLoginRoute = pathname === '/admin/login'
  
  logDebug('Route analysis', {
    pathname,
    isAdminRoute,
    isLoginRoute,
    hasUser: !!user,
    authenticationSuccessful
  })
  
  // If it's an admin route (but not login) and user is not authenticated, redirect to login
  if (isAdminRoute && !isLoginRoute && !user) {
    logDebug('Redirecting unauthenticated user to login', { 
      originalPath: pathname 
    })
    
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && user) {
    logDebug('Allowing authenticated user access to admin route')
  } else if (!isAdminRoute) {
    logDebug('Allowing access to public route')
  }

  return supabaseResponse
}