import { createClient } from '../../utils/supabase/server'
import { ClientsTable } from './clients-table' // ✅ Importamos el nuevo wrapper
import { ClientData } from './columns'

export default async function ClientsPage() {
    const supabase = await createClient()

    // 1. Obtener Clientes con su suscripción activa
    const { data: rawClients } = await supabase
        .from('profiles')
        .select(`
            id, full_name, email, avatar_url, role,
            user_subscriptions(
                id,
                remaining_credits,
                is_active,
                end_date,
                meal_plans(name, meal_type, price)
            )
        `)
        .eq('role', 'cliente')
        .order('created_at', { ascending: false })

    // 2. Obtener lista de Planes
    const { data: plans } = await supabase
        .from('meal_plans')
        .select('*')
        .order('price', { ascending: true })

    // Conversión de tipos segura
    const clients: ClientData[] = (rawClients || []) as unknown as ClientData[]

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">
                        Gestiona usuarios, verifica estados y asigna planes de alimentación.
                    </p>
                </div>
            </div>

            {/* ✅ Pasamos los datos puros al componente Cliente */}
            <ClientsTable clients={clients} plans={plans || []} />
        </div>
    )
}