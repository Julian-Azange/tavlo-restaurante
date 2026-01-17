'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRestaurantConfig(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string

    // Obtenemos el archivo y la URL anterior (por si no suben nada nuevo)
    const logoFile = formData.get('logo_file') as File
    let logo_url = formData.get('current_logo_url') as string

    // LOGICA DE SUBIDA DE IMAGEN
    if (logoFile && logoFile.size > 0) {
        // 1. Crear nombre único (evita sobrescribir si dos restaurantes suben 'logo.png')
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `logo-${Date.now()}.${fileExt}`
        const filePath = `logos/${fileName}`

        // 2. Subir a Supabase Storage
        const { error: uploadError } = await supabase
            .storage
            .from('restaurant-public') // Nombre del bucket que creamos en SQL
            .upload(filePath, logoFile)

        if (uploadError) {
            return { error: 'Error al subir la imagen al servidor.' }
        }

        // 3. Obtener la URL Pública
        const { data: { publicUrl } } = supabase
            .storage
            .from('restaurant-public')
            .getPublicUrl(filePath)

        logo_url = publicUrl
    }

    // ACTUALIZAR BASE DE DATOS
    const { error } = await supabase
        .from('restaurant_config')
        .update({
            name,
            description,
            address,
            phone,
            logo_url // Guardamos la nueva URL (o la vieja si no cambió)
        })
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        return { error: 'Error al guardar la configuración.' }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/')

    return { success: true, message: '¡Configuración actualizada con éxito!' }
}