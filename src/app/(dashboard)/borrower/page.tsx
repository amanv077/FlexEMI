import Link from 'next/link'
import { getBorrowerLoans } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PayEmiButton } from '@/components/pay-emi-button'
import { AlertCircle, Calendar, CreditCard, Wallet, ArrowRight } from 'lucide-react'

export default async function BorrowerDashboard() {
  const loans = await getBorrowerLoans()

  // Calculate details
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Calculate Next Month params
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1)
  const nextMonthIndex = nextMonthDate.getMonth()
  const nextMonthYear = nextMonthDate.getFullYear()

  let totalOverdue = 0
  let totalOutstanding = 0 // Total remaining for all loans

  const pendingEmisThisMonth: any[] = []
  const upcomingEmisNextMonth: any[] = []

  const activeLoans = loans.filter((l: any) => !l.isArchived)
  const archivedLoans = loans.filter((l: any) => l.isArchived)

  loans.forEach((loan: any) => {
    // We count stats for ALL loans, even archived ones, so you don't miss payments.
    // if (loan.isArchived) return

    loan.emis.forEach((emi: any) => {
      const dueDate = new Date(emi.dueDate)

      // Calculate Total Outstanding (all pending/overdue EMIS)
      if (emi.status !== 'PAID') {
        totalOutstanding += emi.amount

        // Overdue Calculation
        if (emi.status === 'OVERDUE' || (dueDate < now && (dueDate.getMonth() !== currentMonth || dueDate.getFullYear() !== currentYear))) {
          totalOverdue += emi.amount
        }
      }

      // Grouping for "Pay This Month" (Includes Overdue + Due Current Month)
      if (emi.status !== 'PAID') {
        const isOverdue = emi.status === 'OVERDUE' || dueDate < now
        const isDueThisMonth = dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear

        if (isOverdue || isDueThisMonth) {
          pendingEmisThisMonth.push({
            ...emi,
            loanName: loan.name || `Loan from ${loan.lender.name}`,
            lenderName: loan.lender.name,
            isOverdue: isOverdue && !isDueThisMonth
          })
        }

        // "To be paid Next Month"
        if (dueDate.getMonth() === nextMonthIndex && dueDate.getFullYear() === nextMonthYear) {
          upcomingEmisNextMonth.push({
            ...emi,
            loanName: loan.name || `Loan from ${loan.lender.name}`,
            lenderName: loan.lender.name
          })
        }
      }
    })
  })

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">

      {/* Header & Top Stats */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your loan status and payments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Overdue Card */}
          <Card className={`border-l-4 shadow-sm ${totalOverdue > 0 ? 'border-l-red-500 bg-red-50/10' : 'border-l-green-500 bg-green-50/10'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue (Delayed)
              </CardTitle>
              <AlertCircle className={`h-4 w-4 ${totalOverdue > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalOverdue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total amount pending from past due dates
              </p>
            </CardContent>
          </Card>

          {/* Total Remaining Card */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Principal + Interest remaining
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 1: Pay This Month */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Due This Month
        </h2>
        <Card>
          <CardContent className="p-0">
            {pendingEmisThisMonth.length > 0 ? (
              <div className="divide-y">
                {pendingEmisThisMonth.map((emi) => (
                  <div key={emi.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-base">{emi.loanName}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Due: {new Date(emi.dueDate).toLocaleDateString()}</span>
                        {emi.isOverdue && <span className="text-red-500 font-bold">• Overdue</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                      <span className="font-bold text-lg">{formatCurrency(emi.amount)}</span>
                      <div className="w-32">
                        <PayEmiButton emiId={emi.id} amount={emi.amount} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No payments due right now. You're all caught up!
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Upcoming Next Month */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
          Upcoming (Next Month)
        </h2>
        <Card className="bg-muted/10 border-dashed">
          <CardContent className="p-0">
            {upcomingEmisNextMonth.length > 0 ? (
              <div className="divide-y">
                {upcomingEmisNextMonth.map((emi) => (
                  <div key={emi.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-90">
                    <div className="space-y-1">
                      <p className="font-medium text-base">{emi.loanName}</p>
                      <div className="text-xs text-muted-foreground">
                        <span>Due: {new Date(emi.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                      <span className="font-semibold text-lg text-muted-foreground">{formatCurrency(emi.amount)}</span>
                      <div className="w-32">
                        {/* Including Pay Button here too as requested */}
                        <PayEmiButton emiId={emi.id} amount={emi.amount} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No payments scheduled for next month.
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Active Loans */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Active Loans
        </h2>
        {activeLoans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeLoans.map((loan: any) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg text-muted-foreground">
            No active loans found.
          </div>
        )}
      </div>

      {/* Section 4: Archived Loans (if any) */}
      {archivedLoans.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-5 w-5" />
            Archived Loans
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
            {archivedLoans.map((loan: any) => (
              <LoanCard key={loan.id} loan={loan} isArchived />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function LoanCard({ loan, isArchived }: { loan: any, isArchived?: boolean }) {
  // Simple helper to find next payment for card display
  const nextEmi = loan.emis.find((e: any) => e.status === 'PENDING')
  const paidCount = loan.emis.filter((e: any) => e.status === 'PAID').length
  const progress = Math.round((paidCount / loan.tenure) * 100)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Link href={`/borrower/loans/${loan.id}`} className="block h-full">
      <Card className={`h-full transition-all hover:shadow-md ${isArchived ? 'bg-muted/10' : 'hover:border-primary/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-base line-clamp-1">
                {loan.name || `Loan from ${loan.lender.name}`}
                            </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isArchived ? 'Archived' : `Started ${new Date(loan.startDate).toLocaleDateString()}`}
              </p>
            </div>
            <Badge variant={isArchived ? "secondary" : "outline"}>
              {formatCurrency(loan.amount)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isArchived ? 'bg-muted-foreground' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {!isArchived && nextEmi && (
            <div className="pt-2 border-t mt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Next EMI</span>
                            <div className="text-right">
                <span className="block font-medium">{formatCurrency(nextEmi.amount)}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(nextEmi.dueDate).toLocaleDateString()}
                </span>
              </div>
                        </div>
          )}

          {!isArchived && !nextEmi && (
            <div className="pt-2 border-t mt-2 text-center text-green-600 font-medium py-1">
              Fully Paid
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
