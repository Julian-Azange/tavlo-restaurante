import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { RestaurantConfigForm } from './restaurant-form'

export default async function SettingsPage() {
    const supabase = await createClient()

    // 1. Seguridad: Verificar que sea Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard') // Sacar si no es admin
    }

    // 2. Obtener la configuración actual
    const { data: config } = await supabase
        .from('restaurant_config')
        .select('*')
        .single()

    // Valores por defecto (Fallback)
    const defaultValues = {
        name: config?.name || '',
        description: config?.description || '',
        logo_url: config?.logo_url || '',
        address: config?.address || '',
        phone: config?.phone || ''
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración General</h2>
                <p className="text-muted-foreground">Personaliza la apariencia de tu página de inicio (TAVLO).</p>
            </div>

            <RestaurantConfigForm defaultValues={defaultValues} />
        </div>
    )
}