'use client'

import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { processConsumption } from '../../dashboard/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner' // Si tienes instalado sonner, sino usa alert

export default function ScannerPage() {
    const [isScanning, setIsScanning] = useState(true)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleScan = async (detectedCodes: any) => {
        // La librería a veces devuelve un array, tomamos el primero
        const code = detectedCodes[0]?.rawValue

        if (code && isScanning) {
            setIsScanning(false) // Pausar escaneo para no procesar doble
            setLoading(true)

            try {
                // Llamamos al Server Action
                const response = await processConsumption(code)
                setResult(response)

                // Reproducir sonido beep (opcional pero satisfactorio)
                if (response.success) {
                    new Audio('/beep-success.mp3').play().catch(() => { })
                } else {
                    new Audio('/beep-error.mp3').play().catch(() => { })
                }

            } catch (error) {
                setResult({ success: false, message: 'Error de conexión' })
            } finally {
                setLoading(false)
            }
        }
    }

    const resetScanner = () => {
        setResult(null)
        setIsScanning(true)
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 bg-slate-900">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-white">
                        <ArrowLeft />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold">Escanear Consumo</h1>
            </div>

            {/* Área de Cámara */}
            <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                {isScanning && !loading && (
                    <div className="w-full h-full max-w-md aspect-square">
                        <Scanner
                            onScan={handleScan}
                            components={{torch: true }} // torch = linterna
                            styles={{ container: { width: '100%', height: '100%' } }}
                        />
                        {/* Overlay visual (cuadrado de enfoque) */}
                        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-green-500 rounded-lg opacity-50 animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="mt-4 font-medium">Validando...</p>
                    </div>
                )}

                {/* Modal de Resultado */}
                {result && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/90 z-20">
                        <Card className="w-full max-w-sm text-center border-none">
                            <CardHeader>
                                <div className="mx-auto mb-4">
                                    {result.success ? (
                                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                                    ) : (
                                        <XCircle className="w-20 h-20 text-red-500" />
                                    )}
                                </div>
                                <CardTitle className={result.success ? "text-green-600" : "text-red-600"}>
                                    {result.success ? "¡Aprobado!" : "Rechazado"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg mb-6 text-black">{result.message}</p>
                                <Button size="lg" className="w-full text-lg" onClick={resetScanner}>
                                    Escanear Siguiente
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="p-4 text-center text-xs text-gray-500 bg-slate-900">
                Apunta la cámara al código QR del cliente
            </div>
        </div>
    )
}