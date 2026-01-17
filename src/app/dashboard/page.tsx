import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

// --- COMPONENTES UI COMUNES ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// --- COMPONENTES DE ADMIN ---
import { AdminScanner } from './admin-scanner' // <--- Asegúrate de tener este archivo creado
import { Users, UtensilsCrossed, TrendingUp } from 'lucide-react'

// --- COMPONENTES DE CLIENTE ---
import { RealtimeBalance } from './realtime-balance'
import { QrCodeModal } from './components/qr-code-modal'
import { Utensils, Coffee, Moon } from 'lucide-react'

import Link from 'next/link'
import { QrCode, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. VERIFICAR SESIÓN
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/login')

    // 2. OBTENER PERFIL Y ROL
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // =========================================================
    // 🅰️ VISTA DE ADMINISTRADOR (Dashboard de Control)
    // =========================================================
    if (profile?.role === 'admin') {

        // Calcular Estadísticas del día
        const today = new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD

        // A. Total Clientes
        const { count: clientCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'cliente')

        // B. Consumos de HOY
        const { count: todayConsumptions } = await supabase
            .from('consumptions')
            .select('*', { count: 'exact', head: true })
            .gte('check_in_time', today)

        return (
            <div className="p-6 space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h2>
                        <p className="text-muted-foreground">Bienvenido, Administrador.</p>
                    </div>
                </div>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{clientCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consumos Hoy</CardTitle>
                            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todayConsumptions || 0}</div>
                            <p className="text-xs text-muted-foreground">Platos entregados hoy</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">En Línea</div>
                            <p className="text-xs text-muted-foreground">Todo funcionando correctamente</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ZONA DE ESCÁNER Y ACCIONES RÁPIDAS */}
                <div className="grid md:grid-cols-2 gap-8 mt-8">

                    {/* TARJETA DE ACCESO AL ESCÁNER */}
                    <div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl relative overflow-hidden group">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                            <QrCode size={200} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <QrCode className="text-green-400" />
                                    Caja Rápida
                                </h3>
                                <p className="text-slate-300 mt-2 max-w-xs">
                                    Abre el lector en pantalla completa para procesar filas de clientes rápidamente.
                                </p>
                            </div>

                            <Link href="/dashboard/scanner">
                                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold w-full md:w-auto shadow-lg shadow-green-900/20 transition-all hover:translate-x-1">
                                    Abrir Escáner <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* TARJETA DE HISTORIAL (Placeholder) */}
                    <div className="bg-white p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center text-muted-foreground shadow-sm">
                        <UtensilsCrossed className="h-12 w-12 text-slate-300 mb-4" />
                        <h4 className="font-medium text-slate-700">Historial Reciente</h4>
                        <p className="text-sm max-w-xs mt-2">Los últimos movimientos aparecerán aquí.</p>
                    </div>
                </div>
            </div>
        )
    }

    // =========================================================
    // 🅱️ VISTA DE CLIENTE (Tiqueteras y QR)
    // =========================================================

    // 3. OBTENER SUSCRIPCIONES DEL CLIENTE
    const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*, meal_plans(name, meal_type)')
        .eq('user_id', user.id)
        .eq('is_active', true)

    return (
        <div className="min-h-screen w-full bg-gray-50 pb-24">
            <RealtimeBalance userId={user.id} />

            <div className="p-4 max-w-lg mx-auto space-y-6">

                {/* Header Cliente */}
                <div className="flex items-center justify-between pt-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Mis Tiqueteras</h2>
                        <p className="text-muted-foreground text-sm">Hola, {profile?.full_name}</p>
                    </div>
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border">
                        <span className="font-bold text-slate-600 uppercase">{profile?.full_name?.[0]}</span>
                    </div>
                </div>

                {/* GRILLA DE TARJETAS */}
                {subscriptions && subscriptions.length > 0 ? (
                    <div className="grid gap-4">
                        {subscriptions.map((sub) => (
                            <Card key={sub.id} className="bg-slate-900 text-white shadow-xl border-0 relative overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute top-4 right-4 opacity-20 text-white">
                                    {getMealIcon(sub.meal_plans?.meal_type)}
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-widest">
                                        {sub.meal_plans?.meal_type || 'General'}
                                    </CardTitle>
                                    <CardDescription className="text-white text-xl font-semibold">
                                        {sub.meal_plans?.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-5xl font-bold tracking-tighter">
                                            {sub.remaining_credits}
                                        </span>
                                        <span className="ml-2 text-lg text-slate-400">disponibles</span>
                                    </div>

                                    {/* BOTÓN DE QR */}
                                    {sub.is_active && sub.remaining_credits > 0 ? (
                                        <QrCodeModal
                                            subscriptionId={sub.id}
                                            planName={sub.meal_plans?.name || 'Plan'}
                                            mealType={sub.meal_plans?.meal_type || 'General'}
                                            remaining={sub.remaining_credits}
                                        />
                                    ) : (
                                        <div className="mt-4 p-2 text-center text-sm bg-red-500/20 text-red-200 rounded">
                                            No disponible para uso
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400">
                                        <span>Vence: {new Date(sub.end_date).toLocaleDateString()}</span>
                                        <span className={sub.is_active ? "text-green-400" : "text-red-400"}>
                                            {sub.is_active ? '● Activo' : '● Inactivo'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // ESTADO VACÍO
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed shadow-sm">
                        <Utensils className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">Sin planes activos</h3>
                        <p className="text-sm text-muted-foreground mt-1 px-4">
                            No tienes tiquetes disponibles. Acércate a caja para recargar tu cuenta.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Función auxiliar para iconos (Mantenida igual)
function getMealIcon(type: string | undefined) {
    const t = (type || '').toLowerCase()
    if (t.includes('desayuno')) return <Coffee size={40} />
    if (t.includes('cena')) return <Moon size={40} />
    return <Utensils size={40} />
}