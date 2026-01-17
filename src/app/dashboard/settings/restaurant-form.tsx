'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateRestaurantConfig } from './actions'
import { toast } from 'sonner'
import { Loader2, Save, Image as ImageIcon, UploadCloud } from 'lucide-react'

interface ConfigFormProps {
    defaultValues: {
        name: string
        description: string
        logo_url: string
        address: string
        phone: string
    }
}

export function RestaurantConfigForm({ defaultValues }: ConfigFormProps) {
    const [loading, setLoading] = useState(false)
    const [logoPreview, setLogoPreview] = useState(defaultValues.logo_url)

    // Manejar la previsualización local cuando seleccionan un archivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setLogoPreview(objectUrl)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        const res = await updateRestaurantConfig(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(res.message)
        }
    }

    return (
        <form action={handleSubmit}>
            {/* INPUT OCULTO: Para enviar la URL actual si el usuario no sube foto nueva */}
            <input type="hidden" name="current_logo_url" value={defaultValues.logo_url} />

            <div className="grid gap-6">

                {/* TARJETA 1: IDENTIDAD */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identidad del Restaurante</CardTitle>
                        <CardDescription>Datos principales visibles en la landing page.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Negocio</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={defaultValues.name}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Eslogan</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={defaultValues.description}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* TARJETA 2: LOGO (UPLOAD) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Logo del Restaurante</CardTitle>
                        <CardDescription>Sube una imagen (JPG o PNG). Recomendado 500x500px.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-6">

                            {/* Previsualización Circular */}
                            <div className="relative group h-32 w-32 shrink-0">
                                <div className="h-full w-full rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-10 w-10 text-slate-300" />
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2 w-full">
                                <Label htmlFor="logo_file" className="cursor-pointer">
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center">
                                        <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-medium text-slate-700">Clic para seleccionar imagen</span>
                                        <span className="text-xs text-slate-400 mt-1">Soporta PNG, JPG, WEBP</span>
                                    </div>
                                    {/* El input real está oculto pero funcional */}
                                    <Input
                                        id="logo_file"
                                        name="logo_file"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TARJETA 3: CONTACTO */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={defaultValues.address}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={defaultValues.phone}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* BOTÓN GUARDAR */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} size="lg" className="bg-slate-900 w-full md:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Configuración
                    </Button>
                </div>
            </div>
        </form>
    )
}