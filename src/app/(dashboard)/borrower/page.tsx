import { getBorrowerLoans } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PayEmiButton } from '@/components/pay-emi-button'

export default async function BorrowerDashboard() {
  const loans = await getBorrowerLoans()

  // Calculate upcoming EMIs
  const upcomingEmis = loans.flatMap((loan: any) =>
    loan.emis
      .filter((emi: any) => emi.status === 'PENDING')
      .map((emi: any) => ({ ...emi, loan }))
  ).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Borrower Dashboard</h1>

      {/* Upcoming Payments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Upcoming Payments</h2>
        {upcomingEmis.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No upcoming payments.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEmis.slice(0, 3).map((emi: any) => (
              <Card key={emi.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Due {new Date(emi.dueDate).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{emi.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Loan from {emi.loan.lender.name || emi.loan.lender.email}
                  </p>
                  <PayEmiButton emiId={emi.id} amount={emi.amount} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Loans</h2>
        {loans.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              You don't have any active loans.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {loans.map((loan: any) => (
              <Card key={loan.id}>
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">Loan from {loan.lender.name || loan.lender.email}</CardTitle>
                      <span className="text-xs text-muted-foreground">{new Date(loan.startDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="font-bold">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                      <p className="font-bold">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tenure</p>
                      <p className="font-bold">{loan.tenure} Months</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {loan.emis.filter((e: any) => e.status === 'PAID').length} / {loan.tenure}
                        </span>
                        <span className="text-xs text-muted-foreground">EMIs Paid</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable EMI details could go here */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
