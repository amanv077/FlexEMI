'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createLoanSchema = z.object({
  borrowerEmail: z.string().email(),
  amount: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0),
  tenure: z.coerce.number().int().positive(), // months
  startDate: z.string().date(), // YYYY-MM-DD
})

export async function createLoan(prevState: string | undefined, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'LOAN_GIVER') {
        return "Unauthorized"
    }

    const validatedFields = createLoanSchema.safeParse({
        borrowerEmail: formData.get('borrowerEmail'),
        amount: formData.get('amount'),
        interestRate: formData.get('interestRate'),
        tenure: formData.get('tenure'),
        startDate: formData.get('startDate'),
    })

    if (!validatedFields.success) {
        return "Invalid fields"
    }

    const { borrowerEmail, amount, interestRate, tenure, startDate } = validatedFields.data

    const borrower = await prisma.user.findUnique({
        where: { email: borrowerEmail }
    })

    if (!borrower) {
        return "Borrower not found with that email."
    }

    if (borrower.id === session.user.id) {
        return "You cannot lend money to yourself."
    }

    try {
        const loan = await prisma.loan.create({
            data: {
                amount,
                interestRate,
                tenure,
                startDate: new Date(startDate),
                lenderId: session.user.id,
                borrowerId: borrower.id,
                status: 'ACTIVE'
            }
        })

        // Generate EMIs
        // Simple EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
        // Monthly Interest Rate r = R / (12 * 100)
        
        const r = interestRate / (12 * 100)
        let emiAmount = 0
        if (interestRate === 0) {
            emiAmount = amount / tenure
        } else {
             emiAmount = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1)
        }
        
        // Round to 2 decimals
        emiAmount = Math.round(emiAmount * 100) / 100

        const emiPromises = []
        let currentDate = new Date(startDate)

        for (let i = 1; i <= tenure; i++) {
            // Add 1 month for next due date
            currentDate.setMonth(currentDate.getMonth() + 1)
            
            emiPromises.push(prisma.eMI.create({
                data: {
                    amount: emiAmount,
                    dueDate: new Date(currentDate),
                    loanId: loan.id,
                    status: 'PENDING'
                }
            }))
        }

        await Promise.all(emiPromises)

    } catch (error) {
        console.error("Failed to create loan:", error)
        return "Failed to create loan."
    }

    revalidatePath('/lender')
    redirect('/lender')
}

export async function getLenderLoans() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'LOAN_GIVER') return []

    const loans = await prisma.loan.findMany({
        where: { lenderId: session.user.id },
        include: {
            borrower: {
                select: { name: true, email: true }
            },
            emis: true // Include likely needed for progress calculation
        },
        orderBy: { createdAt: 'desc' }
    })
    return loans
}

export async function getBorrowerLoans() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'LOAN_TAKER') return []

    const loans = await prisma.loan.findMany({
        where: { borrowerId: session.user.id },
        include: {
            lender: {
                select: { name: true, email: true }
            },
            emis: {
                orderBy: { dueDate: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
    return loans
}

