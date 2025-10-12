import { auth } from "~/server/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Rutas públicas (solo la raíz)
  const isPublicRoute = nextUrl.pathname === "/";

  // Si no está loggeado y NO es ruta pública, redirigir a login
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    return Response.redirect(
      new URL(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  // Si está loggeado y está en la raíz, redirigir a dashboard
  if (isLoggedIn && isPublicRoute) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return;
});

export const config = {
  // Todas las rutas excepto las que empiezan con:
  // - api (API routes)
  // - _next/static (archivos estáticos)
  // - _next/image (optimización de imágenes)
  // - favicon.ico (icono)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
