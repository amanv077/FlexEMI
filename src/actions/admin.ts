'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getAdminStats() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') return null

    const totalUsers = await prisma.user.count()
    const totalLoans = await prisma.loan.count()
    const totalLent = await prisma.loan.aggregate({
        _sum: { amount: true }
    })
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })

    return {
        totalUsers,
        totalLoans,
        totalLent: totalLent._sum.amount || 0,
        recentUsers
    }
}
