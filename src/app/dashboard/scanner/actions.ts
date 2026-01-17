'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processConsumption(qrRawValue: string) {
    const supabase = await createClient()

    try {
        // 1. PARSEO DEL QR (Protección contra QRs basura)
        let subscriptionId: string
        try {
            const data = JSON.parse(qrRawValue)
            subscriptionId = data.subId
        } catch (e) {
            return { success: false, message: 'QR Inválido: No es un código del sistema.' }
        }

        if (!subscriptionId) {
            return { success: false, message: 'QR Inválido: Datos incompletos.' }
        }

        // 2. BUSCAR SUSCRIPCIÓN Y VALIDAR
        // Traemos también el nombre del plan y del cliente para el mensaje final
        const { data: sub, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('*, meal_plans(name), profiles(full_name)')
            .eq('id', subscriptionId)
            .single()

        if (fetchError || !sub) {
            return { success: false, message: 'Tiquete no encontrado en el sistema.' }
        }

        // 3. REGLAS DE NEGOCIO (Validaciones)
        if (!sub.is_active) {
            return { success: false, message: `PLAN INACTIVO.\nEl usuario debe reactivarlo.` }
        }

        if (sub.remaining_credits <= 0) {
            return { success: false, message: `SALDO INSUFICIENTE.\nCréditos actuales: 0` }
        }

        // 4. EJECUTAR EL DESCUENTO
        const newBalance = sub.remaining_credits - 1

        const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ remaining_credits: newBalance })
            .eq('id', subscriptionId)

        if (updateError) {
            return { success: false, message: 'Error de conexión al actualizar saldo.' }
        }

        // 5. REGISTRAR EN EL HISTORIAL (LOG)
        await supabase.from('consumptions').insert({
            subscription_id: subscriptionId,
            user_id: sub.user_id,
            plan_name: sub.meal_plans?.name || 'Desconocido',
            check_in_time: new Date().toISOString()
        })

        // 6. ACTUALIZAR CACHÉ
        revalidatePath('/dashboard')

        // 7. RETORNO EXITOSO (Mensaje formateado para el Alert del Escáner)
        return {
            success: true,
            message: `¡CONSUMO APROBADO!\n\nCliente: ${sub.profiles?.full_name}\nPlan: ${sub.meal_plans?.name}\n\nNuevo Saldo: ${newBalance}`
        }

    } catch (error) {
        console.error("Error crítico en escaneo:", error)
        return { success: false, message: 'Error interno del servidor.' }
    }
}