
import { getLoanDetails } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BorrowerLoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // reuse the same getLoanDetails which checks role but we need to ensure it allows LOAN_TAKER too or create a new one.
  // getLoanDetails currently checks for LOAN_GIVER. We need to update it or create getBorrowerLoanDetails.
  // Start by creating this page, then I will update the action.
  
  // For now, let's assume we update getLoanDetails to allow both if they own the loan.
  const loan = await getLoanDetails(id)

  if (!loan) {
    return notFound()
  }

  const paidEmis = loan.emis.filter((e: any) => e.status === 'PAID')
  const progressPercent = Math.round((paidEmis.length / loan.tenure) * 100)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
            <Link href="/borrower">
                <ArrowLeft className="h-4 w-4 mr-1"/> Back to Dashboard
            </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Stats Card */}
        <Card className="md:col-span-2">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-primary">
                             {loan.name || "Loan Details"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">ID: {loan.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <Badge className="text-sm px-3 py-1" variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {loan.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Loan</p>
                        <p className="text-xl font-bold">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                        <p className="text-xl font-bold">{loan.interestRate}%</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Late Fee/Miss</p>
                        <p className="text-lg font-medium">₹{(loan as any).lateFeeAmount ?? 0}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Repayment Progress</span>
                        <span className="text-muted-foreground">{paidEmis.length} of {loan.tenure} EMIs Paid</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-right text-sm font-bold text-primary">{progressPercent}% Completed</p>
                </div>
            </CardContent>
        </Card>

        {/* Lender Info Card */}
        <Card>
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary"/>
                    Lender Details
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {/* We need to include lender in query */}
                {/* Note: getLoanDetails includes borrower, let's check if it includes lender.*/}
                {/* It currently includes borrower. We need to update it to include lender too if we want to show it. */}
                <div>
                     <p className="text-sm font-medium text-muted-foreground">Lender Email</p>
                    {/* Accessing lender assuming we will fetch it */}
                     <p className="text-base break-all">{(loan as any).lender?.email || 'Contact Admin'}</p>
                </div>
                <div className="pt-4 border-t">
                     <Button className="w-full" variant="outline" asChild>
                         <a href={`mailto:${(loan as any).lender?.email}`}>Contact Lender</a>
                     </Button>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
         <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-5 w-5"/>
            Your EMI Schedule
         </h2>
         
         <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 sm:grid-cols-4 bg-muted/50 p-3 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right hidden sm:block">Paid On</div>
            </div>
            <div className="divide-y">
                {loan.emis.map((emi: any) => (
                    <div key={emi.id} className="grid grid-cols-3 sm:grid-cols-4 p-4 items-center hover:bg-muted/20 transition-colors">
                        <div className="col-span-1 font-medium">
                            {new Date(emi.dueDate).toLocaleDateString()}
                        </div>
                        <div className="col-span-1">
                            ₹{emi.amount.toLocaleString()}
                        </div>
                        <div className="col-span-1">
                             <Badge variant={emi.status === 'PAID' ? 'default' : emi.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                                {emi.status}
                             </Badge>
                        </div>
                         <div className="col-span-1 text-right text-sm text-muted-foreground hidden sm:block">
                            {emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : '-'}
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  )
}
