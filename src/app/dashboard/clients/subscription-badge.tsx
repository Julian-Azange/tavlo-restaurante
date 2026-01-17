'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PauseCircle, PlayCircle, MoreHorizontal } from 'lucide-react'
import { toggleSubscriptionStatus } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps {
    id: string
    name: string
    type: string
    credits: number
    isActive: boolean
}

export function SubscriptionBadge({ id, name, type, credits, isActive }: SubscriptionBadgeProps) {
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        const res = await toggleSubscriptionStatus(id, isActive)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            // El mensaje cambia según si lo pausaste o activaste
            toast.success(res.message)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* El Badge ahora es un botón clickeable */}
                <div
                    className={cn(
                        "flex items-center gap-2 cursor-pointer transition-all hover:opacity-80 select-none",
                        !isActive && "opacity-60 grayscale" // Efecto visual si está inactivo
                    )}
                >
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs font-normal border-slate-300 whitespace-nowrap pr-1 gap-2",
                            isActive ? "text-slate-700" : "text-slate-400 border-dashed"
                        )}
                    >
                        {/* Indicador visual de estado (Puntito) */}
                        <span className={cn(
                            "h-2 w-2 rounded-full",
                            isActive ? "bg-green-500 animate-pulse" : "bg-slate-300"
                        )} />

                        {name}
                        <span className="text-slate-400 font-light">({type})</span>
                        <MoreHorizontal className="h-3 w-3 text-slate-300 ml-1" />
                    </Badge>

                    {/* Badge de Créditos */}
                    <Badge
                        className={cn(
                            "text-[10px] h-5 px-1.5 transition-colors",
                            isActive
                                ? (credits <= 3 ? 'bg-red-500' : 'bg-slate-900')
                                : "bg-slate-300 text-slate-500"
                        )}
                    >
                        {credits} u.
                    </Badge>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Opciones del Plan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggle} disabled={loading}>
                    {isActive ? (
                        <>
                            <PauseCircle className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Pausar Plan</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                            <span>Reactivar Plan</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}