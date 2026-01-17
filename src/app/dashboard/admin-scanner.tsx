'use client'

import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { processRedemption } from '@/app/dashboard/scanner/actions' // Asegúrate de tener esta ruta correcta según el paso anterior
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function AdminScanner() {
    const [paused, setPaused] = useState(false)
    const [lastResult, setLastResult] = useState<{ status: 'success' | 'error', msg: string, data?: any } | null>(null)

    const handleScan = async (text: string) => {
        if (paused) return

        // 1. Pausar para no leer el mismo código 50 veces por segundo
        setPaused(true)

        try {
            // 2. Parsear el JSON del QR
            const qrData = JSON.parse(text)

            if (!qrData.subId) throw new Error('QR Inválido')

            // 3. Llamar al servidor para descontar
            toast.info('Procesando tiquete...')
            const res = await processRedemption(qrData.subId)

            if (res.error) {
                setLastResult({ status: 'error', msg: res.error })
                toast.error(res.error)
            } else {
                setLastResult({ status: 'success', msg: '¡Consumo Exitoso!', data: res.data })
                toast.success(`Entregado: 1 ${res.data.plan}`)
            }

        } catch (e) {
            toast.error('Código QR no válido o ilegible')
            setLastResult({ status: 'error', msg: 'QR ilegible' })
        }

        // 4. Esperar 3 segundos antes de poder escanear otro
        setTimeout(() => {
            setPaused(false)
            setLastResult(null)
        }, 3000)
    }

    return (
        <Card className="border-2 border-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-900 text-white py-3">
                <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                    Lector de Tiquetes
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative aspect-square max-w-[400px] mx-auto bg-black">

                {/* CÁMARA */}
                <Scanner
                    onScan={(result) => result[0] && handleScan(result[0].rawValue)}
                    components={{ audio: false, finder: false }}
                    styles={{ container: { width: '100%', height: '100%' } }}
                />

                {/* GUIAS VISUALES (MIRA) */}
                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-green-500 -ml-1 -mt-1"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-green-500 -mr-1 -mt-1"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-green-500 -ml-1 -mb-1"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-green-500 -mr-1 -mb-1"></div>
                    </div>
                </div>

                {/* OVERLAY DE RESULTADO */}
                {paused && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-10 animate-in fade-in duration-200">
                        {lastResult?.status === 'success' ? (
                            <>
                                <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                                <h3 className="text-2xl font-bold text-white">¡Aprobado!</h3>
                                <p className="text-green-400 text-lg">{lastResult.data.plan}</p>
                                <p className="text-white text-sm mt-1">Cliente: {lastResult.data.client}</p>
                                <p className="text-slate-400 text-xs mt-4">Restan: {lastResult.data.remaining}</p>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mb-2" />
                                <h3 className="text-2xl font-bold text-white">Error</h3>
                                <p className="text-red-300">{lastResult?.msg}</p>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}