// src/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session & get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // -------------------------------------------------------
  // 1. AUTH ROUTES — redirect logged-in users away
  // -------------------------------------------------------
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // -------------------------------------------------------
  // 2. PUBLIC ROUTES — no auth needed, skip all checks
  // -------------------------------------------------------
  const publicPrefixes = [
    '/search',
    '/jobs',
    '/pianist/', // public pianist profiles are viewable
  ];

  const isPublicRoute = publicPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // -------------------------------------------------------
  // 3. PROTECTED ROUTES — require login
  // -------------------------------------------------------
  const protectedPrefixes = [
    '/pianist/dashboard',
    '/pianist/profile',
    '/pianist/availability',
    '/pianist/bookings',
    '/pianist/earnings',
    '/pianist/applications',
    '/pianist/jobs',   // ← was missing before!
    '/client/dashboard',
    '/client/profile',
    '/client/post-job',
    '/client/jobs',
    '/client/bookings',
    '/client/book',
    '/admin',
    '/dashboard',
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Not logged in — redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // -------------------------------------------------------
  // 4. ROLE GUARD — check user has the right role
  // -------------------------------------------------------
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_pianist, is_client, role')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      // --- Pianist routes ---
      const isPianistRoute = pathname.startsWith('/pianist/');
      // Exclude public pianist profile pages e.g. /pianist/[id]
      // Pianist-only protected routes all have a second segment
      const isPianistProtectedRoute =
        isPianistRoute &&
        [
          '/pianist/dashboard',
          '/pianist/profile',
          '/pianist/availability',
          '/pianist/bookings',
          '/pianist/earnings',
          '/pianist/applications',
          '/pianist/jobs',
        ].some((p) => pathname.startsWith(p));

      if (isPianistProtectedRoute && !profile.is_pianist) {
        // User doesn't have pianist role — redirect to their dashboard
        const url = request.nextUrl.clone();
        url.pathname = profile.is_client
          ? '/client/dashboard'
          : '/';
        url.searchParams.set('error', 'wrong_role');
        return NextResponse.redirect(url);
      }

      // --- Client routes ---
      const isClientRoute = pathname.startsWith('/client/');
      if (isClientRoute && !profile.is_client) {
        const url = request.nextUrl.clone();
        url.pathname = profile.is_pianist
          ? '/pianist/dashboard'
          : '/';
        url.searchParams.set('error', 'wrong_role');
        return NextResponse.redirect(url);
      }

      // --- Admin routes ---
      const isAdminRoute = pathname.startsWith('/admin');
      if (isAdminRoute && profile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};