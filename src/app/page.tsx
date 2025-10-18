import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "~/components/landing";

export default async function Home() {
  const session = await auth();

  // Si el usuario está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}

