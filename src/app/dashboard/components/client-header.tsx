'use client'


import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/app/utils/supabase/client'

export function ClientHeader() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Restaurante - Mi Tierrita</h1>

            <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
            </Button>
        </div>
    )
}