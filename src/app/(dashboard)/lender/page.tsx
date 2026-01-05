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

  // Calculate Monthly Stats
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let monthExpected = 0
  let monthReceived = 0 // Actually collected this month (Cash Flow)
  let monthPending = 0 // Due this month but not paid
  let totalOverdue = 0 // Global Overdue

  const allEmis: any[] = []

  loans.forEach((loan: any) => {
    if (loan.isArchived) return

    loan.emis.forEach((emi: any) => {
      const dueDate = new Date(emi.dueDate)
      const paidDate = emi.paidDate ? new Date(emi.paidDate) : null

      // Expected: Due in current month
      if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
        monthExpected += emi.amount

        // Pending: Due this month and NOT paid (or paid late? for now just not paid)
        // Actually simplest definition of pending for month: Due this month, status != PAID?
        // Or if status == PAID but paidDate is next month? (Edge case).
        // Let's stick to status.
        if (emi.status !== 'PAID') {
          monthPending += emi.amount
        }
      }

      // Received: PAID in current month (Cash Flow)
      if (emi.status === 'PAID' && paidDate && paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
        monthReceived += emi.amount
      }

      // Global Overdue
      if (emi.status === 'OVERDUE' || (emi.status === 'PENDING' && dueDate < startOfToday)) {
        totalOverdue += emi.amount
      }

      // For upcoming list
      if (emi.status !== 'PAID') {
        allEmis.push({
          ...emi,
          loanName: loan.name || loan.borrower.name || 'Loan',
          borrowerName: loan.borrower.name || loan.borrower.email
        })
      }
    })
  })

  // Sort upcoming EMIs by date
  const upcomingEmis = allEmis.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lender Dashboard</h1>
        <Button asChild>
          <Link href="/lender/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      {/* Monthly Overview Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Monthly Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{monthExpected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">due this month</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Collected</CardTitle>
              <div className="h-4 w-4 text-green-600 rounded-full border border-green-600 flex items-center justify-center text-[10px]">✔</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">₹{monthReceived.toLocaleString()}</div>
              <p className="text-xs text-green-600/80">received this month</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
              <div className="h-4 w-4 text-yellow-600 flex items-center justify-center">⏳</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">₹{monthPending.toLocaleString()}</div>
              <p className="text-xs text-yellow-600/80">left to collect</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Total Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">₹{totalOverdue.toLocaleString()}</div>
              <p className="text-xs text-red-600/80">cumulative amount</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats & Upcoming Row */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Stats (Compressed) */}
        <div className="md:col-span-4 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Portfolio Stats</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalLent.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBorrowers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Loans List (Existing) */}
          <div className="pt-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Loans</h2>
            {loans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">You haven't created any loans yet.</p>
                  <Button asChild variant="outline">
                    <Link href="/lender/create">Create your first loan</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Active Loans Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <h3 className="text-lg font-medium text-foreground">Active Loans</h3>
                    </div>
                    {loans.filter((l: any) => !l.isArchived).length === 0 ? (
                      <p className="text-muted-foreground text-sm pl-4">No active loans.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                          {loans.filter((l: any) => !l.isArchived).map((loan: any) => (
                            <Link key={loan.id} href={`/lender/loans/${loan.id}`} className="block group transition-transform active:scale-[0.99]">
                              <Card className="overflow-hidden group-hover:border-primary/50 group-hover:shadow-md transition-all duration-200">
                                <CardHeader className="bg-muted/50 pb-3 pt-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                                        {loan.name || loan.borrower.name || loan.borrower.email}
                                      </CardTitle>
                                      {/* Removed ID for cleaner look in compact view */}
                                    </div>
                                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                      {loan.status}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-3 pb-4 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-semibold">₹{loan.amount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium text-green-600">
                                      {Math.round((loan.emis.filter((e: any) => e.status === 'PAID').length / loan.tenure) * 100)}%
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Archived Loans Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                      <h3 className="text-lg font-medium text-muted-foreground">Archived Loans</h3>
                    </div>
                    {loans.filter((l: any) => l.isArchived).length === 0 ? (
                      <p className="text-muted-foreground text-sm pl-4">No archived loans.</p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all">
                        {loans.filter((l: any) => l.isArchived).map((loan: any) => (
                          <Link key={loan.id} href={`/lender/loans/${loan.id}`} className="block group">
                            <Card className="overflow-hidden border-dashed group-hover:border-primary/50 group-hover:border-solid transition-all duration-200">
                              <CardHeader className="bg-muted/30 pb-3 pt-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base text-muted-foreground group-hover:text-primary">
                                    {loan.name || loan.borrower.name}
                                  </CardTitle>
                                  <Badge variant="outline" className="text-xs">Archived</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-3 pb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Amount</span>
                                  <span className="font-semibold">₹{loan.amount.toLocaleString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Payments */}
        <div className="md:col-span-3">
          <Card className="h-full border-l-4 border-l-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Upcoming Payments
              </CardTitle>
              <p className="text-sm text-muted-foreground">Next partial or full EMIs due</p>
            </CardHeader>
            <CardContent>
              {upcomingEmis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming payments found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEmis.map((emi: any, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{emi.borrowerName}</p>
                        <p className="text-xs text-muted-foreground mb-1">{emi.loanName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${emi.status === 'OVERDUE' || (new Date(emi.dueDate) < now)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {new Date(emi.dueDate).toLocaleDateString()}
                          </div>
                          {(new Date(emi.dueDate) < now && emi.status !== 'PAID') &&
                            <span className="text-[10px] text-red-600 font-bold">OVERDUE</span>
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{emi.amount.toLocaleString()}</p>
                        <Button variant="ghost" size="sm" className="h-6 text-xs mt-1" asChild>
                          <Link href={`/lender/loans/${emi.loanId}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
