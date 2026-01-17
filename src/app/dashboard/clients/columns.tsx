'use client'

import { ColumnDef } from '@tanstack/react-table'
import { AssignPlanModal } from './assign-plan-modal'
import { SubscriptionBadge } from './subscription-badge'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

// Ajustamos el tipo para reflejar que subscriptions es un ARRAY
export type ClientData = {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    role: string
    user_subscriptions: {
        id: string
        remaining_credits: number
        is_active: boolean
        meal_plans: {
            name: string
            meal_type: string
            price: number
        } | null
    }[]
}

type Plan = {
    id: string
    name: string
    price: number
    total_credits: number
}

export const getColumns = (plans: Plan[]): ColumnDef<ClientData>[] => [
    {
        accessorKey: 'full_name',
        header: 'Cliente',
        cell: ({ row }) => {
            const client = row.original
            return (
                <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border overflow-hidden shrink-0">
                        {client.avatar_url ? (
                            <img src={client.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4 text-slate-500" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[140px]">
                            {client.full_name || 'Sin nombre'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {client.email}
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        id: 'active_plans',
        header: 'Planes (Clic para gestionar)',
        cell: ({ row }) => {
            const subs = row.original.user_subscriptions || []

            // Filtramos solo los que tienen créditos (o historial, como prefieras)
            const visibleSubs = subs.filter(s => s.remaining_credits > 0 || s.is_active)

            if (visibleSubs.length === 0) {
                return <span className="text-muted-foreground text-xs italic">Sin planes</span>
            }

            return (
                <div className="flex flex-col gap-2 py-1">
                    {visibleSubs.map((sub) => (
                        // USAMOS EL COMPONENTE INTELIGENTE AQUÍ
                        <SubscriptionBadge
                            key={sub.id}
                            id={sub.id}
                            name={sub.meal_plans?.name || 'Plan'}
                            type={sub.meal_plans?.meal_type || 'General'}
                            credits={sub.remaining_credits}
                            isActive={sub.is_active}
                        />
                    ))}
                </div>
            )
        },
    },

    // 2. (Opcional) COLUMNA DE VALOR TOTAL (La que hicimos antes)
    {
        id: 'total_value',
        header: 'Valor Total',
        cell: ({ row }) => {
            const subs = row.original.user_subscriptions || []
            const total = subs.reduce((acc, sub) => {
                if (!sub.is_active || !sub.meal_plans) return acc
                return acc + (sub.remaining_credits * sub.meal_plans.price)
            }, 0)

            if (total === 0) return <span className="text-muted-foreground">-</span>
            return <span className="font-bold text-slate-700 text-xs">${total.toLocaleString()}</span>
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Cargar Saldo</div>,
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    <AssignPlanModal
                        userId={row.original.id}
                        userName={row.original.full_name || 'Cliente'}
                        plans={plans as any}
                    />
                </div>
            )
        },
    },
]