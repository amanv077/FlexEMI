import Link from 'next/link'
import { getBorrowerLoans } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PayEmiButton } from '@/components/pay-emi-button'
import { AlertCircle, Calendar } from 'lucide-react'

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

  let totalDueThisMonth = 0
  let totalUpcomingNextMonth = 0 // Sum of all EMIs due next month

  const pendingEmisThisMonth: any[] = []
  const upcomingEmisNextMonth: any[] = []

  loans.forEach((loan: any) => {
    if (loan.isArchived) return

    loan.emis.forEach((emi: any) => {
      const dueDate = new Date(emi.dueDate)

      // Due This Month or Overdue (Pay Now)
      if (emi.status !== 'PAID') {
        // If overdue OR due in current month (and contractually pending)
        if (emi.status === 'OVERDUE' || (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) || dueDate < now) {
          totalDueThisMonth += emi.amount
          pendingEmisThisMonth.push({
            ...emi,
            loanName: loan.name || `Loan from ${loan.lender.name}`,
            lenderName: loan.lender.name
          })
        }

        // Upcoming: Due specifically in NEXT MONTH
        if (dueDate.getMonth() === nextMonthIndex && dueDate.getFullYear() === nextMonthYear) {
          totalUpcomingNextMonth += emi.amount
          upcomingEmisNextMonth.push({
            ...emi,
            loanName: loan.name || `Loan from ${loan.lender.name}`,
            lenderName: loan.lender.name
          })
        }
      }
    })
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Borrower Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/borrower/loans">View All Loans</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Action Card: Pay Now */}
        <Card className={`border-l-4 ${totalDueThisMonth > 0 ? 'border-l-primary shadow-md' : 'border-l-green-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {totalDueThisMonth > 0 ? < AlertCircle className="h-5 w-5 text-red-500" /> : <Badge className="bg-green-100 text-green-700 hover:bg-green-200">All Caught Up</Badge>}
              Total Due Now
            </CardTitle>
            <p className="text-sm text-muted-foreground">Includes overdue and {now.toLocaleString('default', { month: 'long' })}'s EMIs</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">₹{totalDueThisMonth.toLocaleString()}</div>
            {totalDueThisMonth > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {pendingEmisThisMonth.map((emi: any) => (
                    <div key={emi.id} className="flex items-center justify-between text-sm border p-2 rounded-md bg-muted/20">
                      <div>
                        <p className="font-medium">{emi.loanName}</p>
                        <p className="text-xs text-muted-foreground">Due: {new Date(emi.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-bold">₹{emi.amount.toLocaleString()}</span>
                        <div className="w-24">
                          <PayEmiButton emiId={emi.id} amount={emi.amount} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You have no pending payments for this month. Great job!</p>
            )}
          </CardContent>
          </Card>

        {/* Upcoming Card */}
        <Card className="border-l-4 border-l-blue-500/50 bg-blue-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Due Next Month
                  </CardTitle>
            <p className="text-sm text-muted-foreground">Total payments for {nextMonthDate.toLocaleString('default', { month: 'long' })}</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">₹{totalUpcomingNextMonth.toLocaleString()}</div>
            {upcomingEmisNextMonth.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {upcomingEmisNextMonth.map((emi: any) => (
                  <div key={emi.id} className="flex items-center justify-between text-sm border-b border-blue-200 py-2 last:border-0">
                    <div>
                      <p className="font-medium">{emi.loanName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold block">₹{emi.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">Due {new Date(emi.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No EMIs scheduled for next month.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold text-foreground">Active Loans</h2>
        {loans.filter((l: any) => !l.isArchived).length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              You don't have any active loans.
            </CardContent>
          </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {loans.filter((l: any) => !l.isArchived).map((loan: any) => {
                // Calculate next EMI for this specific loan
                const nextLoanEmi = loan.emis.find((e: any) => e.status === 'PENDING')
                return (
                  <Link key={loan.id} href={`/borrower/loans/${loan.id}`} className="block group transition-transform active:scale-[0.99]">
                    <Card className="group-hover:border-primary/50 group-hover:shadow-md transition-all duration-200">
                      <CardHeader className="bg-muted/50 pb-3 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <CardTitle className="text-base group-hover:text-primary transition-colors">
                              {loan.name || `Loan from ${loan.lender.name}`}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Started {new Date(loan.startDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="bg-background">
                            ₹{loan.amount.toLocaleString()}
                          </Badge>
                                </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Outstanding EMI</span>
                          {nextLoanEmi ? (
                            <div className="text-right">
                              <span className="font-bold block">₹{nextLoanEmi.amount.toLocaleString()}</span>
                              <span className={`text-[10px] ${new Date(nextLoanEmi.dueDate) < now ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                Due {new Date(nextLoanEmi.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-600 font-medium">Fully Paid</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round((loan.emis.filter((e: any) => e.status === 'PAID').length / loan.tenure) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.round((loan.emis.filter((e: any) => e.status === 'PAID').length / loan.tenure) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                        </Card>
                  </Link>
                )
              })}
            </div>
        )}
      </div>
    </div>
  )
}
