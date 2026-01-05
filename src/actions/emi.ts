'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"

export async function payEMI(emiId: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'LOAN_TAKER') {
        return { error: 'Unauthorized' }
    }

    try {
        // 1. Verify ownership and status
        const emi = await prisma.eMI.findUnique({
            where: { id: emiId },
            include: { loan: true }
        })

        if (!emi) return { error: 'EMI not found' }
        if (emi.loan.borrowerId !== session.user.id) return { error: 'Unauthorized' }
        if (emi.status === 'PAID') return { error: 'EMI already paid' }

        // 2. Mark EMI as PAID
        await prisma.eMI.update({
            where: { id: emiId },
            data: {
                status: 'PAID',
                paidDate: new Date()
            }
        })

        // Notify Lender
        if (emi.loan.lender.email) {
            await sendEmail({
                to: emi.loan.lender.email,
                subject: 'EMI Received - FlexEMI',
                text: `You have received a payment of ₹${emi.amount} for loan #${emi.loanId}.`
            })
        }


        // 3. Check if all EMIs for this loan are paid
        const remainingEmis = await prisma.eMI.count({
            where: {
                loanId: emi.loanId,
                status: 'PENDING'
            }
        })

        // 4. If no pending EMIs, mark loan as COMPLETED
        if (remainingEmis === 0) {
            await prisma.loan.update({
                where: { id: emi.loanId },
                data: { status: 'COMPLETED' }
            })
        }

        revalidatePath('/borrower')
        return { success: true }
    } catch (error) {
        console.error("Payment error:", error)
        return { error: "Failed to process payment" }
    }
}
