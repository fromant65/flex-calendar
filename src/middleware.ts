import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = [
    "/",
];

// Rutas que permiten acceso tanto autenticado como no autenticado
const optionalAuthRoutes = [
    "/install-app",
];

// Verificar si una ruta es pública (solo sin autenticación)
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

// Verificar si una ruta permite acceso opcional
function isOptionalAuthRoute(pathname: string): boolean {
    return optionalAuthRoutes.some(route => {
        return pathname === route || pathname.startsWith(`${route}/`);
    });
}

export default auth((req) => {
    //console.log(req.auth);
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isPublic = isPublicRoute(nextUrl.pathname);
    const isOptional = isOptionalAuthRoute(nextUrl.pathname);

    // Si está autenticado y es una ruta pública (no opcional), redirigir a dashboard
    if (isLoggedIn && isPublic && !isOptional) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Si no está autenticado y no es pública ni opcional, redirigir a home
    if (!isLoggedIn && !isPublic && !isOptional) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    // Permitir el acceso (rutas opcionales, públicas, o privadas con auth)
    return NextResponse.next();
});

export const config = {
    // Match all paths except static files and API routes
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)"],
};
