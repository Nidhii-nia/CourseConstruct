import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//  routes (no auth required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin-login(.*)",
  "/admin-check(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api");

  //  Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  //  Not logged in
  if (!userId) {
    // API should return status, not redirect
    if (isApiRoute) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Pages should redirect
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    try {
      const user = await clerkClient.users.getUser(userId);

      if (user.publicMetadata?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Clerk error:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow request
  return NextResponse.next();
});

// Apply middleware to ALL routes (including API)
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};