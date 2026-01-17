'use client' // Esto es obligatorio para usar hooks como useState

import { useState } from 'react'
import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Loader2, User } from 'lucide-react'
import Image from 'next/image'

export function RegisterForm() {
    const [preview, setPreview] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Maneja la selección de la foto para mostrarla antes de subir
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
        }
    }

    // Envolvemos el action para manejar el estado de carga
    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setErrorMessage('') // Limpiar errores previos

        try {
            // Llamamos al Server Action
            await signup(formData)
        } catch (error) {
            // Si el redirect funciona, esto no se ejecuta.
            // Si hay error real, cae aquí.
            console.error(error)
            setErrorMessage("Ocurrió un error inesperado. Revisa tu conexión.")
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="grid gap-4">
            {/* ÁREA DE FOTO CON PREVIEW */}
            <div className="flex flex-col items-center gap-4 mb-2">
                <Label
                    htmlFor="avatar"
                    className={`
                relative cursor-pointer flex flex-col items-center justify-center gap-2 
                border-2 border-dashed border-gray-300 rounded-full 
                w-32 h-32 overflow-hidden hover:bg-gray-50 transition
                ${preview ? 'border-primary' : ''}
            `}
                >
                    {preview ? (
                        // Si hay foto, la mostramos
                        <img
                            src={preview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Si no, mostramos el icono de cámara
                        <>
                            <Camera size={24} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground text-center px-2">
                                Toca para foto
                            </span>
                        </>
                    )}

                    {/* Input oculto pero funcional */}
                    <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </Label>

                {/* Texto de ayuda debajo */}
                <p className="text-xs text-muted-foreground">
                    {preview ? '¡Foto lista!' : 'Foto requerida para validación'}
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" name="fullName" placeholder="Ej: Pepito Pérez" required disabled={isLoading} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required disabled={isLoading} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required minLength={6} disabled={isLoading} />
            </div>

            {errorMessage && (
                <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                    </>
                ) : (
                    'Registrarse'
                )}
            </Button>
        </form>
    )
}