import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  "/",
];

// Verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    // Exact match para la ruta principal
    if (route === "/") {
      return pathname === "/";
    }
    // Para otras rutas públicas futuras, permitir que coincidan con el inicio
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublic = isPublicRoute(nextUrl.pathname);

  // Si el usuario está autenticado y está en una ruta pública, redirigir a /dashboard
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Si el usuario NO está autenticado y está en una ruta protegida, redirigir a /
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Permitir el acceso
  return NextResponse.next();
});

export const config = {
  // Match all paths except static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
