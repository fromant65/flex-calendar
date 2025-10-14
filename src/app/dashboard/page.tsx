import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "~/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <DashboardClient 
      userName={session.user.name ?? "Usuario"} 
      userEmail={session.user.email ?? ""} 
    />
  );
}
