'use server';
import { z } from 'zod';
import Form from '../ui/invoices/create-form';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import exp from 'constants';
import { error } from 'console';
import { signIn } from '../auth';
import { AuthError } from 'next-auth';



// Menambahkan Autentikasi
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an Invoice Status.',
    }),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData){
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // };
    const validateFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Memvalidasi apakah form sudah benar
    if(!validateFields.success){
        return {
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoices.'
        }
    }

    // Prepare Data for insertion into the database
    const {customerId, amount, status} = validateFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    try {
        await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES(${customerId}, ${amountInCents}, ${status}, ${date})`;
    }catch(error){
        return {
            message: "Database Error: Failed to Create Invoices"
        }
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Tes it Out
    // const rawFormData = Object.fromEntries(formData.entries());
    // console.log(rawFormData);
    // console.log(typeof rawFormData.amount);
}

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, prevState: State, formData: FormData){
    const validateFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validateFields.success){
        return {
            errors: validateFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Invoice",
        }
    }
    const { customerId, amount, status } = validateFields.data;
    const amountInCents = amount * 100;
    try {
        await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;
    } catch(error){
        return {
            message: "Database Error:  Failed to Update Invoice"
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoices(id: string){
    throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: "Deleted Invoice" }
    } catch(error){
        return { message: 'Database Error: Failed to Deleted Invoices' }
    }
    // alert('Data Berhasil Di Hapus');
}