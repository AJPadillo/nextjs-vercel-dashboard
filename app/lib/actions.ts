'use server'
// Marca que todas las funciones que se exportan son funciones de servidor
// y no se ejecuta ni envian al cliente. Esto es importante para evitar errores de compilación

import { date, z } from 'zod'
import { Invoice } from './definitions'
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = neon(`${process.env.DATABASE_URL}`);

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
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    //Transformamos para evitar el redondeo de los decimales
    const amountInCents = amount * 100

    //Creamos la fecha actual (2015-11-12 <- en este formato)
    const [date] = new Date().toISOString().split('T')

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `

    revalidatePath('dashboard/invoices')
    redirect('/dashboard/invoices')
}