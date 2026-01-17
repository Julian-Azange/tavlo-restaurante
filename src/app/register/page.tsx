import { RegisterForm } from './register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function RegisterPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Sube tu foto para iniciar.
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    {/* Aquí insertamos el componente cliente */}
                    <RegisterForm />

                    {/* Mensaje de error que venga del servidor (URL params) */}
                    {searchParams?.message && (
                        <p className="text-sm font-medium text-red-500 text-center mt-4">
                            {searchParams.message}
                        </p>
                    )}

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        ¿Ya tienes cuenta? <Link href="/login" className="font-bold text-primary">Inicia Sesión</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}