'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react" // Icono
import QRCode from "react-qr-code" // Librería instalada

interface QrModalProps {
    subscriptionId: string
    planName: string
    mealType: string
    remaining: number
}

export function QrCodeModal({ subscriptionId, planName, mealType, remaining }: QrModalProps) {
    // ESTA ES LA CLAVE: El QR contiene el ID específico de la suscripción
    // El escáner leerá esto y sabrá exactamente qué descontar.
    const qrData = JSON.stringify({
        subId: subscriptionId,
        action: 'redeem'
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-white text-slate-900 hover:bg-slate-200 font-bold">
                    <QrCode className="mr-2 h-4 w-4" />
                    Usar Tiquete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Escanea para Redimir</DialogTitle>
                    <DialogDescription className="text-center">
                        Muestra este código en caja para descontar 1 {mealType}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-white rounded-xl">
                    <div className="p-4 bg-white border-2 border-slate-900 rounded-lg">
                        <QRCode
                            value={qrData}
                            size={200}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="font-bold text-lg">{planName}</p>
                        <p className="text-sm text-muted-foreground">
                            Te quedan <span className="font-bold text-slate-900">{remaining}</span> créditos
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}