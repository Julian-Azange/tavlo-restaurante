'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPlan(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const description = formData.get('description') as string
    const mealType = formData.get('mealType') as string // <--- NUEVO CAMPO

    if (!name || !price || !mealType) {
        return { error: 'Nombre, Precio y Tipo son obligatorios' }
    }

    const { error } = await supabase.from('meal_plans').insert({
        name,
        price,
        meal_type: mealType, // Guardamos el tipo
        total_credits: 1,
        description
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/plans')
    revalidatePath('/dashboard/clients')
    return { success: true, message: '¡Plan creado exitosamente!' }
}

export async function deletePlan(planId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('meal_plans')
            .delete()
            .eq('id', planId)

        // Postgres Error 23503 es "Foreign Key Violation" (por si no hiciste el Paso 1)
        if (error) {
            console.error("Error eliminando:", error)
            if (error.code === '23503') {
                return { error: 'No se puede eliminar: Hay clientes usando este plan. (Ejecuta el script SQL de "ON DELETE SET NULL" para arreglarlo)' }
            }
            return { error: 'Error al eliminar el plan.' }
        }

        revalidatePath('/dashboard/plans')
        return { success: true, message: 'Plan eliminado correctamente.' }

    } catch (e) {
        return { error: 'Ocurrió un error inesperado.' }
    }
}