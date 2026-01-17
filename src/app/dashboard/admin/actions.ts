'use server'
import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processConsumption(qrContent: string) {
    const supabase = await createClient()

    // 1. Verificar que quien escanea sea ADMIN
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) return { success: false, message: 'No autenticado' }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single()

    if (adminProfile?.role !== 'admin') {
        return { success: false, message: 'No tienes permisos de administrador.' }
    }

    // 2. Parsear el QR (que viene como string JSON)
    let targetUserId = ''
    try {
        const data = JSON.parse(qrContent)
        targetUserId = data.uid
        if (!targetUserId) throw new Error()
    } catch (e) {
        return { success: false, message: 'Código QR inválido o corrupto.' }
    }

    // 3. Buscar suscripción activa y con saldo
    const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .gt('remaining_credits', 0) // Que tenga más de 0 créditos
        .single()

    if (subError || !subscription) {
        return { success: false, message: 'El cliente NO tiene saldo o plan activo.' }
    }

    // 4. DESCONTAR 1 CRÉDITO
    const newBalance = subscription.remaining_credits - 1

    const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ remaining_credits: newBalance })
        .eq('id', subscription.id)

    if (updateError) {
        return { success: false, message: 'Error al actualizar saldo.' }
    }

    // 5. REGISTRAR EN EL HISTORIAL (Consumptions)
    await supabase.from('consumptions').insert({
        subscription_id: subscription.id,
        user_id: targetUserId,
        processed_by: adminUser.id
    })

    revalidatePath('/dashboard') // Actualizar datos
    return {
        success: true,
        message: `Consumo exitoso. Le quedan: ${newBalance}`,
        remaining: newBalance
    }
}