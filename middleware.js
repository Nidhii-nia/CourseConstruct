import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Add API routes to public routes for debugging (optional)
  // '/api/generate-course-layout',
  // '/api/generate-course-content'
])

export default clerkMiddleware(async (auth, req) => {
  // Log all API route requests for debugging
  if (req.nextUrl.pathname.startsWith('/api/')) {
    console.log('🔗 [Middleware] API Route Hit:', req.nextUrl.pathname);
  }

  // Protect routes that are not public
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
