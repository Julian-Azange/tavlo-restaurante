'use client'

import { Menu } from 'lucide-react'
// 1. IMPORTA SheetTitle
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function MobileSidebar({ isAdmin }: { isAdmin: boolean }) {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])
    if (!isMounted) return null

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-none text-white w-72">
                {/* 2. AGREGA EL TÍTULO AQUÍ (Requerido para accesibilidad) */}
                <SheetTitle className="text-white p-4 text-lg font-bold">Menú</SheetTitle>
                <SheetDescription className="sr-only">Menú de navegación</SheetDescription>

                <Sidebar isAdmin={isAdmin} />
            </SheetContent>
        </Sheet>
    )
}