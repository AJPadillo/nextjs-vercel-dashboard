'use server'
// Marca que todas las funciones que se exportan son funciones de servidor
// y no se ejecuta ni envian al cliente. Esto es importante para evitar errores de compilación

import { date, z } from 'zod'
import { Invoice } from './definitions'

const CreateInvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['paid', 'pending']),
    date: z.string()
})

const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
    id: true,
    date: true
})

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
        customerID: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    //Transformamos para evitar el redondeo de los decimales
    const amountInCents = amount * 100
}