'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Definimos el tipo de dato para el carrito
type CartItem = {
    planId: string
    quantity: number
}

export async function assignBatchPlans(userId: string, cartItems: CartItem[]) {
    const supabase = await createClient()

    if (!cartItems || cartItems.length === 0) return { error: 'El carrito está vacío' }

    // Iteramos sobre cada item del carrito y lo procesamos
    for (const item of cartItems) {
        // 1. Obtener info del plan
        const { data: plan } = await supabase.from('meal_plans').select('id, total_credits').eq('id', item.planId).single()

        if (!plan) continue // Si falla uno, saltamos al siguiente

        // 2. Buscar si ya tiene suscripción de este tipo
        const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('id, remaining_credits')
            .eq('user_id', userId)
            .eq('plan_id', item.planId)
            .maybeSingle()

        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30) // 30 días de vigencia

        if (existingSub) {
            // ACTUALIZAR
            await supabase.from('user_subscriptions').update({
                remaining_credits: existingSub.remaining_credits + item.quantity,
                is_active: true,
                end_date: endDate.toISOString()
            }).eq('id', existingSub.id)
        } else {
            // CREAR NUEVO
            await supabase.from('user_subscriptions').insert({
                user_id: userId,
                plan_id: item.planId,
                remaining_credits: item.quantity,
                is_active: true,
                start_date: new Date().toISOString(),
                end_date: endDate.toISOString()
            })
        }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function toggleSubscriptionStatus(subscriptionId: string, currentStatus: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('user_subscriptions')
        .update({ is_active: !currentStatus }) // Invierte el valor (true -> false, false -> true)
        .eq('id', subscriptionId)

    if (error) return { error: 'Error al cambiar estado' }

    revalidatePath('/dashboard/clients')
    return { success: true, message: currentStatus ? 'Plan pausado correctamente' : 'Plan reactivado exitosamente' }
}