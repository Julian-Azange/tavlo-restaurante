'use client'

import { DataTable } from './data-table'
import { getColumns, ClientData } from './columns'

type Plan = {
    id: string
    name: string
    price: number
    total_credits: number
}

interface ClientsTableProps {
    clients: ClientData[]
    plans: Plan[]
}

export function ClientsTable({ clients, plans }: ClientsTableProps) {
    // Ahora sí podemos llamar a getColumns porque estamos en un componente de cliente ('use client')
    const columns = getColumns(plans)

    return <DataTable columns={columns} data={clients} />
}