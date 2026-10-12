import { getSession } from "@/app/lib/session";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  console.log("session data: ",session)
  if (!session.userId) {
    redirect("/login");
  }

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("User")
    .select("id, name, cnic, role, verification_status")
    .eq("id", session.userId)
    .single();

  if (!user) {
    
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}