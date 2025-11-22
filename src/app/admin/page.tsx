"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminClient } from "~/components/admin/admin-client";
import { LoadingPage } from "~/components/ui/loading-spinner";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingPage text="Cargando panel de administración..." />;
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return <AdminClient />;
}
