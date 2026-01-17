import { createClient } from '../utils/supabase/server'
import { Sidebar } from './components/sidebar'
import { MobileSidebar } from './components/mobile-sidebar'
import { ClientHeader } from './components/client-header' // Importa el nuevo header
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Verificamos usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Verificamos Rol
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    // --- ESCENARIO 1: ES CLIENTE (Layout Simple) ---
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ClientHeader />
                <main className="w-full">
                    {children}
                    <Toaster />
                </main>
            </div>
        )
    }

    // --- ESCENARIO 2: ES ADMIN (Layout Completo con Sidebar) ---
    return (
        <div className="h-full relative">
            {/* SIDEBAR PARA PC */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar isAdmin={isAdmin} />
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main className="md:pl-72 pb-10">
                {/* NAVBAR MÓVIL (Solo para Admin) */}
                <div className="flex items-center p-4 md:hidden bg-white border-b shadow-sm sticky top-0 z-50">
                    <MobileSidebar isAdmin={isAdmin} />
                    <span className="font-bold ml-4">Panel Admin</span>
                </div>

                {children}
            </main>
        </div>
    )
}