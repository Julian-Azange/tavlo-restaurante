import { login, forgotPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Restaurante App</CardTitle>
                    <CardDescription className="text-center">
                        Inicia sesión para ver tu cartera
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="login-form" className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                                {/* Opcional: Modal o vista para recuperar pass */}
                                {/* Por ahora un botón simple que dispara la acción */}
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {searchParams?.message && (
                            <p className="text-sm font-medium text-red-500 text-center">{searchParams.message}</p>
                        )}

                        <Button formAction={login} className="w-full">Entrar</Button>

                        {/* Botón "trampa" para disparar el forgot password sin otra página por ahora */}
                        <Button formAction={forgotPassword} variant="link" size="sm" className="px-0 text-muted-foreground">
                            ¿Olvidaste tu contraseña?
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        ¿No tienes cuenta? <Link href="/register" className="text-primary font-bold hover:underline">Regístrate aquí</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}