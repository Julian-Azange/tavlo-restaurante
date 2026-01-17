
import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // El enlace de correo envía un 'code' en la URL
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Si hay un parámetro 'next', lo usamos para redirigir después
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Si el intercambio fue exitoso, redirigimos al usuario
            const forwardedHost = request.headers.get('x-forwarded-host') // Para setups más complejos
            const isLocalEnv = origin.includes('localhost')

            if (isLocalEnv) {
                // En local usamos el origen tal cual
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Si algo falla, lo mandamos al login con error
    return NextResponse.redirect(`${origin}/login?message=Enlace inválido o expirado`)
}