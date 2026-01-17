'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Loader2, Calculator, Trash2, ShoppingCart } from 'lucide-react'
import { assignBatchPlans } from './actions'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

type Plan = {
    id: string
    name: string
    price: number
    total_credits: number
    meal_type: string
}

type CartItem = {
    planId: string
    planName: string
    planPrice: number
    quantity: number
    subtotal: number
}

export function AssignPlanModal({ userId, userName, plans }: { userId: string, userName: string, plans: Plan[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Estados para el formulario de agregar
    const [selectedPlanId, setSelectedPlanId] = useState<string>('')
    const [quantity, setQuantity] = useState<number>(20)

    // Estado del Carrito
    const [cart, setCart] = useState<CartItem[]>([])

    // Agregar al Carrito (Local)
    const addToCart = () => {
        const plan = plans.find(p => p.id === selectedPlanId)
        if (!plan || quantity < 1) return

        const newItem: CartItem = {
            planId: plan.id,
            planName: `${plan.name} (${plan.meal_type || 'General'})`,
            planPrice: plan.price,
            quantity: quantity,
            subtotal: plan.price * quantity
        }

        setCart([...cart, newItem])
        // Resetear inputs
        setSelectedPlanId('')
        setQuantity(20)
    }

    // Eliminar del Carrito
    const removeFromCart = (index: number) => {
        const newCart = [...cart]
        newCart.splice(index, 1)
        setCart(newCart)
    }

    // Calcular Total Global
    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0)

    // Guardar Todo en Base de Datos
    const handleCheckout = async () => {
        if (cart.length === 0) return
        setLoading(true)

        // Enviamos solo lo necesario al servidor
        const payload = cart.map(item => ({ planId: item.planId, quantity: item.quantity }))

        await assignBatchPlans(userId, payload)

        setLoading(false)
        toast.success(`Recarga exitosa por $${grandTotal.toLocaleString()}`)
        setCart([]) // Limpiar carrito
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Cargar / Vender
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nueva Venta</DialogTitle>
                    <DialogDescription>Agrega los planes al carrito para <strong>{userName}</strong>.</DialogDescription>
                </DialogHeader>

                {/* SECCIÓN 1: AGREGAR ITEMS */}
                <div className="grid gap-4 py-4 bg-slate-50 p-4 rounded-lg border">
                    <div className="grid gap-2">
                        <Label>Seleccionar Plan</Label>
                        <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder="-- Selecciona --" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        <span className="font-bold">{plan.name}</span> <span className="text-xs text-muted-foreground">({plan.meal_type})</span> — ${plan.price.toLocaleString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="grid gap-2 flex-1">
                            <Label>Cantidad</Label>
                            <Input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        <Button onClick={addToCart} disabled={!selectedPlanId} type="button" variant="secondary" className="bg-slate-900 text-white hover:bg-slate-700">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Agregar
                        </Button>
                    </div>
                </div>

                {/* SECCIÓN 2: LISTA DE ITEMS (RESUMEN) */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            El carrito está vacío.
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                <div className="text-sm">
                                    <div className="font-bold">{item.planName}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {item.quantity} x ${item.planPrice.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-slate-700">
                                        ${item.subtotal.toLocaleString()}
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => removeFromCart(idx)} className="h-6 w-6 text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* SECCIÓN 3: TOTAL Y PAGO */}
                {cart.length > 0 && (
                    <div className="flex justify-between items-center pt-4 border-t mt-2">
                        <span className="text-sm font-medium uppercase text-muted-foreground">Total a Pagar:</span>
                        <span className="text-2xl font-bold text-green-600">${grandTotal.toLocaleString()}</span>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        Cobrar ${grandTotal.toLocaleString()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}