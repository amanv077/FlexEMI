import Link from 'next/link'
import { getLenderLoans } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Wallet, Users, AlertCircle, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { ApprovePaymentButton, RejectPaymentButton } from '@/components/payment-approval-buttons'

export default async function LenderDashboard() {
  const loans = await getLenderLoans()

  const totalLent = loans.reduce((acc: number, loan: any) => acc + loan.amount, 0)
  const activeLoansCount = loans.filter((l: any) => l.status === 'ACTIVE' && !l.isArchived).length
  const totalBorrowers = new Set(loans.map((l: any) => l.borrowerId)).size

  // Calculate stats
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let totalOutstanding = 0
  let totalOverdue = 0

  // Collect pending approvals
  const pendingApprovals: any[] = []
  let totalLateFees = 0

  loans.forEach((loan: any) => {
    if (loan.isArchived) return

    // First, build a map of which EMIs are paid
    const paidEmiDates = new Set<string>()
    loan.emis.forEach((emi: any) => {
      if (emi.status === 'PAID') {
        paidEmiDates.add(new Date(emi.dueDate).toLocaleDateString())
      }
    })

    // Add late fees (charges) to outstanding and overdue only if EMI is not paid
    if (loan.charges) {
      loan.charges.forEach((charge: any) => {
        // Extract EMI due date from charge reason
        const match = charge.reason.match(/Late Fee for EMI due on (.+)/)
        if (match) {
          const emiDueDate = match[1]
          // Only count if EMI is not paid
          if (!paidEmiDates.has(emiDueDate)) {
            totalOutstanding += charge.amount
            totalOverdue += charge.amount
            totalLateFees += charge.amount
          }
        }
      })
    }

    loan.emis.forEach((emi: any) => {
      const dueDate = new Date(emi.dueDate)

      if (emi.status !== 'PAID') {
        totalOutstanding += emi.amount
      }

      if (emi.status === 'OVERDUE' || (emi.status === 'PENDING' && dueDate < startOfToday)) {
        totalOverdue += emi.amount
      }

      if (emi.status === 'AWAITING_APPROVAL') {
        // Calculate late fee for this EMI
        let lateFeeForEmi = 0
        if (loan.charges) {
          const emiLateFee = loan.charges.find((c: any) =>
            c.reason === `Late Fee for EMI due on ${dueDate.toLocaleDateString()}`
          )
          if (emiLateFee) {
            lateFeeForEmi = emiLateFee.amount
          }
        }

        pendingApprovals.push({
          ...emi,
          loanName: loan.name || loan.borrower.name || 'Loan',
          borrowerName: loan.borrower.name || loan.borrower.email,
          lateFee: lateFeeForEmi,
          totalAmount: emi.amount + lateFeeForEmi
        })
      }
    })
  })

  const activeLoans = loans.filter((l: any) => !l.isArchived)
  const archivedLoans = loans.filter((l: any) => l.isArchived)

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage your loans and track payments.</p>
        </div>
        <Button asChild>
          <Link href="/lender/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        <Card className={totalOverdue > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className={`h-4 w-4 ${totalOverdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(totalOverdue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoansCount}</div>
            <p className="text-xs text-muted-foreground">{totalBorrowers} borrower{totalBorrowers !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals - Only show if there are any */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Approvals
            <Badge variant="secondary">{pendingApprovals.length}</Badge>
          </h2>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-0 divide-y">
              {pendingApprovals.map((emi: any) => (
                <div key={emi.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{emi.borrowerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {emi.loanName} • Due {new Date(emi.dueDate).toLocaleDateString()}
                      {emi.lateFee > 0 && <span className="text-red-500 ml-2">+ ₹{emi.lateFee} late fee</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="font-bold text-lg">{formatCurrency(emi.totalAmount || emi.amount)}</span>
                      {emi.lateFee > 0 && <p className="text-[10px] text-muted-foreground">incl. late fee</p>}
                    </div>
                    <div className="flex gap-2">
                      <ApprovePaymentButton emiId={emi.id} amount={emi.totalAmount || emi.amount} />
                      <RejectPaymentButton emiId={emi.id} amount={emi.totalAmount || emi.amount} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Your Loans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Your Loans
          </h2>
        </div>

        {loans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any loans yet.</p>
              <Button asChild>
                <Link href="/lender/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Loan
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Loans */}
            {activeLoans.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeLoans.map((loan: any) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}

              {activeLoans.length === 0 && archivedLoans.length > 0 && (
                <p className="text-muted-foreground text-center py-4">No active loans. All loans are archived.</p>
              )}

              {/* Archived Loans */}
              {archivedLoans.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Archived</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {archivedLoans.map((loan: any) => (
                      <LoanCard key={loan.id} loan={loan} isArchived />
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

function LoanCard({ loan, isArchived }: { loan: any, isArchived?: boolean }) {
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
    <Link href={`/lender/loans/${loan.id}`} className="block h-full">
      <Card className={`h-full transition-all hover:shadow-md ${isArchived ? 'opacity-60 bg-muted/20' : 'hover:border-primary/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {loan.name || loan.borrower.name || loan.borrower.email}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isArchived ? 'Archived' : loan.borrower.email}
              </p>
            </div>
            <Badge variant={isArchived ? "secondary" : "outline"} className="shrink-0 ml-2">
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
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{paidCount} of {loan.tenure} EMIs paid</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
