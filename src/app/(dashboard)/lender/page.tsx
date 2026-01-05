import Link from 'next/link'
import { getLenderLoans } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Wallet, Users, AlertCircle } from 'lucide-react'

export default async function LenderDashboard() {
  const loans = await getLenderLoans()

  const totalLent = loans.reduce((acc: number, loan: any) => acc + loan.amount, 0)
  const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE').length
  const totalBorrowers = new Set(loans.map((l: any) => l.borrowerId)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lender Dashboard</h1>
        <Button asChild>
          <Link href="/lender/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalLent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">currently ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBorrowers}</div>
            <p className="text-xs text-muted-foreground">unique users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Loans</h2>
        {loans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-500 mb-4">You haven't created any loans yet.</p>
              <Button asChild variant="outline">
                <Link href="/lender/create">Create your first loan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan: any) => (
              <Card key={loan.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{loan.borrower.name || loan.borrower.email}</CardTitle>
                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-semibold">₹{loan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Interest:</span>
                    <span className="font-semibold">{loan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date:</span>
                    <span>{new Date(loan.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tenure:</span>
                    <span>{loan.tenure} months</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
