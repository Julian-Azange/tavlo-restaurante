import { createClient } from '../../utils/supabase/server'
import { CreatePlanModal } from './create-plan-modal'
import { DeletePlanButton } from './delete-plan-button' // <-- Nuevo import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PlansPage() {
    const supabase = await createClient()
    const { data: plans } = await supabase.from('meal_plans').select('*').order('created_at')

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planes y Precios</h2>
                    <p className="text-muted-foreground">Configura los tipos de menú disponibles.</p>
                </div>
                <CreatePlanModal />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans?.map((plan) => (
                    <Card key={plan.id} className="relative group hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    {/* Mostramos el Tipo de Comida */}
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {plan.meal_type || 'General'}
                                    </span>
                                </div>
                                <Badge variant="secondary" className="text-lg font-bold bg-green-100 text-green-800">
                                    ${plan.price.toLocaleString()}
                                </Badge>
                            </div>
                            <CardDescription className="pt-2">{plan.description || 'Sin descripción'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                                <span>Precio por unidad</span>

                                {/* Usamos el nuevo botón con confirmación */}
                                <DeletePlanButton planId={plan.id} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!plans || plans.length === 0) && (
                    <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                        No hay planes creados aún.
                    </div>
                )}
            </div>
        </div>
    )
}