'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const LATE_FEE_AMOUNT = 500 // Fixed late fee for simplicity

export async function checkLateFees() {
    const session = await auth()
    // Allow Admin or Lender to trigger check
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'LOAN_GIVER')) {
        return { error: 'Unauthorized' }
    }

    try {
        const today = new Date()
        
        // Find overdue EMIs
        const overdueEmis = await prisma.eMI.findMany({
            where: {
                status: 'PENDING',
                dueDate: { lt: today }
            },
            include: { loan: true }
        })

        let chargesAdded = 0

        for (const emi of overdueEmis) {
            // Check if charge already exists for this EMI
            // Logic: we link charge to loan, but we should probably note which EMI it is for in the reason
            // or better, add an optional emiId to Charge model? 
            // For now, check reason string
            
            const reason = `Late Fee for EMI due on ${new Date(emi.dueDate).toLocaleDateString()}`
            
            const existingCharge = await prisma.charge.findFirst({
                where: {
                    loanId: emi.loanId,
                    reason: reason
                }
            })

            if (!existingCharge) {
                await prisma.charge.create({
                    data: {
                        amount: LATE_FEE_AMOUNT,
                        reason: reason,
                        date: today,
                        loanId: emi.loanId
                    }
                })
                chargesAdded++
            }
        }

        revalidatePath('/admin')
        revalidatePath('/lender')
        return { success: true, chargesAdded }

    } catch (error) {
        console.error("Late fee check error:", error)
        return { error: "Failed to check late fees" }
    }
}
