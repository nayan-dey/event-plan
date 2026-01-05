import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isClientRoute = createRouteMatcher([
  "/events(.*)",
  "/profile(.*)",
  "/my-registrations(.*)",
  "/complete-profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as CustomJwtSessionClaims;

  // Allow public routes
  if (isPublicRoute(req)) {
    // If user is signed in and on home page, redirect appropriately
    if (userId && req.nextUrl.pathname === "/") {
      const role = claims?.metadata?.role;

      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/events", req.url));
    }
    return NextResponse.next();
  }

  // Protect all non-public routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  if (isAdminRoute(req)) {
    const role = claims?.metadata?.role;

    if (role !== "admin") {
      // Non-admin trying to access admin routes
      return NextResponse.redirect(new URL("/events", req.url));
    }
  }

  // For client routes, check profile completion
  // This will be handled by the page itself using Convex query
  // to avoid blocking middleware

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};