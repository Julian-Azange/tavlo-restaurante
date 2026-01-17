'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed, // Icono más preciso para comida
    LogOut,
    Settings, // Nuevo icono
    QrCode,
    Store // Icono para el logo
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

// Definimos los módulos del sistema
const routes = [
    {
        label: 'Panel Principal',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: 'text-sky-400',
        adminOnly: false,
    },
    // SECCIÓN ADMIN
    {
        label: 'Gestión de Clientes',
        icon: Users,
        href: '/dashboard/clients',
        color: 'text-violet-400',
        adminOnly: true,
    },
    {
        label: 'Planes de Comida',
        icon: UtensilsCrossed,
        href: '/dashboard/plans',
        color: 'text-pink-400',
        adminOnly: true,
    },
    {
        label: 'Configuración', // <--- NUEVO MÓDULO
        icon: Settings,
        href: '/dashboard/settings',
        color: 'text-gray-400', // Color neutro para settings
        adminOnly: true,
    },
]

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0f172a] text-white border-r border-white/10">

            {/* --- HEADER / LOGO --- */}
            <div className="px-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            TAVLO
                        </h1>
                        <p className="text-xs text-slate-400 font-medium">
                            {isAdmin ? 'Panel Admin' : 'Mi Cuenta'}
                        </p>
                    </div>
                </Link>
            </div>

            {/* --- NAVEGACIÓN --- */}
            <div className="px-3 flex-1 overflow-y-auto">
                <div className="space-y-1">
                    {routes.map((route) => {
                        // Filtro de seguridad visual
                        if (route.adminOnly && !isAdmin) return null

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 ease-in-out",
                                    pathname === route.href
                                        ? "text-white bg-white/10 shadow-sm border border-white/5"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                                    {route.label}
                                </div>
                                {/* Indicador activo (punto pequeño) */}
                                {pathname === route.href && (
                                    <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* --- FOOTER / LOGOUT --- */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className="mb-4 px-2">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                        Sistema
                    </p>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                >
                    <LogOut className="h-5 w-5 mr-3 group-hover:text-red-400 transition-colors" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}