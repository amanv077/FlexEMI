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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lender Dashboard</h1>
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
        <h2 className="text-xl font-semibold text-foreground">Recent Loans</h2>
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
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Active Loans
                </h3>
                {loans.filter((l: any) => !l.isArchived).length === 0 ? (
                  <p className="text-muted-foreground text-sm pl-4">No active loans.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {loans.filter((l: any) => !l.isArchived).map((loan: any) => (
                        <Link key={loan.id} href={`/lender/loans/${loan.id}`} className="block group transition-transform active:scale-[0.99]">
                          <Card className="overflow-hidden group-hover:border-primary/50 group-hover:shadow-md transition-all duration-200">
                              {/* ... Existing Card Content ... */}
                              {/* Reusing existing card structure but minimizing code duplication is hard with replace_file_content unless we extract component. */}
                              {/* For now, I'll just duplicate the inner card logic or try to keep it simple. */}
                              {/* Actually, let's just copy the card content structure from previous version but applied to map */}
                              <CardHeader className="bg-muted/50 pb-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                      {loan.name || loan.borrower.name || loan.borrower.email}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground font-mono">ID: {loan.id.slice(-8).toUpperCase()}</p>
                                  </div>
                                  <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {loan.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4 space-y-2">
                                {loan.name && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Borrower:</span>
                                    <span className="font-medium">{loan.borrower.name || loan.borrower.email}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">₹{loan.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Interest:</span>
                                  <span className="font-semibold">{loan.interestRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Start Date:</span>
                                  <span>{new Date(loan.startDate).toLocaleDateString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                    </div>
                )}
              </div>

              {/* Archived Loans Section */}
              {loans.some((l: any) => l.isArchived) && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                    Archived Loans
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all">
                    {loans.filter((l: any) => l.isArchived).map((loan: any) => (
                      <Link key={loan.id} href={`/lender/loans/${loan.id}`} className="block group transition-transform active:scale-[0.99]">
                        <Card className="overflow-hidden border-dashed group-hover:border-primary/50 group-hover:border-solid transition-all duration-200">
                          <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg text-muted-foreground group-hover:text-primary transition-colors">
                                  {loan.name || loan.borrower.name}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-mono">ID: {loan.id.slice(-8).toUpperCase()}</p>
                              </div>
                              <Badge variant="outline">Archived</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">₹{loan.amount.toLocaleString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
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
