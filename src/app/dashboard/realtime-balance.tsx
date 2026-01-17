'use client'

import { useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'

export function RealtimeBalance({ userId }: { userId: string }) {
    const router = useRouter()

    // Al usar el cliente de navegador, NO usamos 'await' aquí
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('realtime-balance')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    router.refresh()
                    const audio = new Audio('/success.mp3')
                    audio.play().catch(() => { })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router, userId])

    return null
}