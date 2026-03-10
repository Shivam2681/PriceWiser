import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto">
      <div className="flex">
        <DashboardNav userName={session.user.name} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
