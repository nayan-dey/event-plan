import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MobileNav } from "@/components/client/mobile-nav";
import { ProfileChecker } from "@/components/client/profile-checker";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile completion checker */}
      <ProfileChecker />
      
      {/* Main content */}
      <main className="safe-top">{children}</main>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
