// app/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // OBTENER USUARIO
    const { data: { user } } = await supabase.auth.getUser()

    // --- DEBUGGING (MIRA ESTO EN TU TERMINAL) ---
    console.log("---------------------------------")
    console.log("Ruta solicitada:", request.nextUrl.pathname)
    console.log("¿Hay usuario?:", user ? `SÍ (${user.email})` : "NO")
    // ---------------------------------------------

    // PROTECCIÓN DE RUTAS
    // Si NO hay usuario y quiere ir al dashboard
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        console.log("⛔ Acceso denegado: Redirigiendo a login")
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Si SÍ hay usuario y está en login/register, mándalo al dashboard
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        console.log("✅ Usuario logueado: Redirigiendo a dashboard")
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return response
}