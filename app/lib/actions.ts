'use server'
// Marca que todas las funciones que se exportan son funciones de servidor
// y no se ejecuta ni envian al cliente. Esto es importante para evitar errores de compilación

import { date, z } from 'zod'
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

const UpdateInvoiceSchema = CreateInvoiceFormSchema;

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

    try {
        await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('dashboard/invoices') //Revalidamos la ruta para que se actualice el cache y se vea el nuevo invoice creado
    redirect('/dashboard/invoices') //Redirigimos a la ruta de invoices para que se vea el nuevo invoice creado
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoiceSchema.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
          `;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}