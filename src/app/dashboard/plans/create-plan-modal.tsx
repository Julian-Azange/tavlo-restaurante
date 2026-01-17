'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from 'lucide-react'
import { createPlan } from './actions'
import { toast } from 'sonner' // Notificaciones bonitas

export function CreatePlanModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mealType, setMealType] = useState('Almuerzo') // Valor por defecto

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        // Agregamos manualmente el valor del Select al FormData
        formData.append('mealType', mealType)

        const res = await createPlan(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error) // Mensaje de error rojo
        } else {
            toast.success(res.message) // Mensaje de éxito verde
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Plan
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo Tipo de Menú</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">

                    {/* Nombre */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" required placeholder="Ej: Ejecutivo Corriente" />
                    </div>

                    {/* Tipo de Comida (Select) */}
                    <div className="grid gap-2">
                        <Label>Tipo de Comida</Label>
                        <Select onValueChange={setMealType} defaultValue={mealType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Desayuno">Desayuno</SelectItem>
                                <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                                <SelectItem value="Cena">Cena</SelectItem>
                                <SelectItem value="Bebida">Bebida</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Precio */}
                    <div className="grid gap-2">
                        <Label htmlFor="price">Precio Unitario</Label>
                        <Input id="price" name="price" type="number" required placeholder="Ej: 15000" />
                    </div>

                    {/* Descripción */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" placeholder="Opcional..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}