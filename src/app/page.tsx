import Link from 'next/link'
import { createClient } from './utils/supabase/server'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, MapPin, Phone, LogIn, UserPlus } from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()

  // 1. Obtener configuración
  const { data: config } = await supabase
    .from('restaurant_config')
    .select('*')
    .single()

  const restaurantName = config?.name || 'TAVLO'
  const description = config?.description || 'Tu experiencia gastronómica digital.'
  const logo = config?.logo_url
  const address = config?.address
  const phone = config?.phone

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-slate-200">

      {/* --- 1. NAVBAR (Solo Identidad) --- */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-centerh-16 flex items-center md:justify-start">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white">
                <UtensilsCrossed size={16} />
              </div>
            )}
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              {restaurantName}
            </span>
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION (Centro de Acción) --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">

        <div className="max-w-2xl w-full space-y-8">

          {/* Logo Central Grande */}
          <div className="relative mx-auto h-40 w-40 bg-white p-1 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-100">
            {logo ? (
              <img src={logo} alt="Logo Grande" className="object-cover h-full w-full"/>
            ) : (
              <UtensilsCrossed size={64} className="text-slate-300" />
            )}
          </div>

          {/* Textos */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              {restaurantName}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-light max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* BOTONES DE ACCIÓN (Lo único que el usuario necesita) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-48 h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105">
                <LogIn className="mr-2 h-5 w-5" />
                Ingresar
              </Button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-48 h-14 text-lg border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <UserPlus className="mr-2 h-5 w-5" />
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Información de Contacto (Discreto abajo) */}
          {(address || phone) && (
            <div className="pt-12 flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-slate-400">
              {address && (
                <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border shadow-sm">
                  <MapPin size={14} /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border shadow-sm">
                  <Phone size={14} /> <span>{phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- 3. FOOTER (Marca Blanca) --- */}
      <footer className="bg-white border-t py-8 text-center text-sm">
        <div className="flex flex-col gap-2 items-center justify-center text-slate-400">
          <p className="font-medium">
            Software desarrollado por <span className="font-bold text-slate-900">Scryved</span> - TAVLO
          </p>
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()} Plataforma de Gestión de Alimentos.
          </p>
        </div>
      </footer>
    </div>
  )
}