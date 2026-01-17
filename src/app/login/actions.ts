'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

// --- LOGIN ---
export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // --- AGREGA ESTO ---
        console.log("❌ ERROR AL INICIAR SESIÓN:", error.message)
        // -------------------
        return redirect('/login?message=No se pudo iniciar sesión')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

// --- REGISTRO CON FOTO ---
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const file = formData.get('avatar') as File // Capturamos el archivo

    let avatarUrl = ''

    // 1. Subir la imagen si existe
    if (file && file.size > 0) {
        // Generar nombre único limpiando caracteres raros
        const fileExt = file.name.split('.').pop() || 'jpg' // fallback a jpg si no tiene extensión
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // IMPORTANTE: Asegúrate que 'avatars' es el nombre exacto de tu bucket
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file) // Cambié filePath por fileName para ser directo en la raiz del bucket

        if (uploadError) {
            console.error("❌ ERROR SUPABASE STORAGE:", uploadError) // <-- ESTO SALDRÁ EN TU TERMINAL
            return redirect('/register?message=Error subiendo imagen: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        avatarUrl = publicUrl
    }

    // 2. Crear el usuario con la metadata (incluyendo la foto)
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                avatar_url: avatarUrl, // Aquí guardamos la URL de la foto
            },
        },
    })

    if (error) {
        console.error(error)
        return redirect('/register?message=Error al registrarse. Intenta con otro correo.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

// --- RECUPERAR CONTRASEÑA ---
export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Esto enviará un correo real si configuraste SMTP, 
    // o lo verás en los logs de Supabase en desarrollo
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/update-password`,
    })

    if (error) {
        return redirect('/login?message=Error al enviar correo')
    }

    return redirect('/login?message=Revisa tu correo para restablecer')
}