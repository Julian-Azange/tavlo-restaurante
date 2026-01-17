'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { QrCode, CreditCard } from 'lucide-react'

export function DashboardActions({ userId, userEmail }: { userId: string, userEmail: string }) {
    // El valor del QR será un JSON string con la data vital
    // En producción, esto debería estar encriptado, pero para MVP está bien.
    const qrData = JSON.stringify({
        uid: userId,
        email: userEmail,
        valid: true
    })

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* BOTÓN 1: MOSTRAR QR */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="h-24 flex flex-col gap-2" variant="outline">
                        <QrCode className="h-8 w-8" />
                        Mostrar QR
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md flex flex-col items-center justify-center">
                    <DialogHeader>
                        <DialogTitle className="text-center">Escanea para Redimir</DialogTitle>
                        <DialogDescription className="text-center">
                            Muestra este código en la caja para descontar 1 almuerzo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 bg-white rounded-lg shadow-inner">
                        <QRCode
                            value={qrData}
                            size={200}
                            viewBox={`0 0 256 256`}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Usuario: {userEmail}
                    </p>
                </DialogContent>
            </Dialog>

            {/* BOTÓN 2: HISTORIAL (Deshabilitado por ahora) */}
            <Button className="h-24 flex flex-col gap-2" variant="outline" disabled>
                <CreditCard className="h-8 w-8" />
                Historial
            </Button>
        </div>
    )
}