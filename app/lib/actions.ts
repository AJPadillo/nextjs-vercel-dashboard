'use server'
// Marca que todas las funciones que se exportan son funciones de servidor
// y no se ejecuta ni envian al cliente. Esto es importante para evitar errores de compilación

import { z } from 'zod'
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = neon(`${process.env.DATABASE_URL}`);

const CreateInvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['paid', 'pending'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string()
})

const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
    id: true,
    date: true
})

const UpdateInvoiceSchema = CreateInvoiceFormSchema;

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoiceFormSchema.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;

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

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoiceSchema.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}
