"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname, redirect } from "next/navigation";

export function ProfileChecker() {
  const pathname = usePathname();
  const user = useQuery(api.users.current);

  // Don't check on complete-profile page to avoid redirect loop
  if (pathname === "/complete-profile") {
    return null;
  }

  // User data is loading or no user found
  if (user === undefined || user === null) {
    return null;
  }

  // Check if profile is incomplete - throw redirect
  if (!user.isProfileComplete) {
    redirect("/complete-profile");
  }

  return null;
}
