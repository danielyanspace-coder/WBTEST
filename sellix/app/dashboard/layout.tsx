import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-dots flex min-h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
