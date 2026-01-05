import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check admin role
  const role = (sessionClaims as CustomJwtSessionClaims)?.metadata?.role;
  if (role !== "admin") {
    redirect("/events");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}