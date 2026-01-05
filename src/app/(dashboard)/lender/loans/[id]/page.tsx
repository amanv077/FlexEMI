
import { getLoanDetails, toggleArchiveLoan } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const loan = await getLoanDetails(id)

  if (!loan) {
    return notFound()
  }

  const paidEmis = loan.emis.filter((e: any) => e.status === 'PAID')
  const pendingEmis = loan.emis.filter((e: any) => e.status === 'PENDING')
  const overdueEmis = loan.emis.filter((e: any) => e.status === 'OVERDUE') // If logic exists
  
  const totalPaid = paidEmis.reduce((acc: number, e: any) => acc + e.amount, 0)
  const progressPercent = Math.round((paidEmis.length / loan.tenure) * 100)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
            <Link href="/lender">
                <ArrowLeft className="h-4 w-4 mr-1"/> Back to Dashboard
            </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Stats Card */}
        <Card className="md:col-span-2">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold text-primary">Loan Details</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">ID: {loan.id}</p>
                    </div>
                          <div className="flex items-center gap-2">
                              <Badge className="text-sm px-3 py-1" variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {loan.status}
                              </Badge>
                              {/* Archive Action */}
                              <form action={async () => {
                                  'use server'
                                  await toggleArchiveLoan(loan.id)
                              }}>
                                  <Button
                                      type="submit"
                                      variant={loan.isArchived ? "secondary" : "outline"}
                                      size="sm"
                                      className={loan.isArchived ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none" : ""}
                                  >
                                      {loan.isArchived ? "Archived" : "Archive"}
                                  </Button>
                              </form>
                          </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                        <p className="text-xl font-bold">{loan.interestRate}%</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                        <p className="text-lg font-medium">{new Date(loan.startDate).toLocaleDateString()}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Late Fee Config</p>
                        <p className="text-lg font-medium">₹{(loan as any).lateFeeAmount ?? 0}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Repayment Progress</span>
                        <span className="text-muted-foreground">{paidEmis.length} of {loan.tenure} EMIs Paid</span>
                    </div>
                     {/* Custom Progress Bar since we don't assume shadcn progress component exists */}
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

        {/* Borrower Info Card */}
        <Card>
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary"/>
                    Borrower
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg font-medium">{loan.borrower.name || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base break-all">{loan.borrower.email}</p>
                </div>
                <div className="pt-4 border-t">
                    <Button className="w-full" variant="outline" asChild>
                        <a href={`mailto:${loan.borrower.email}`}>Contact Borrower</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
         <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-5 w-5"/>
            EMI Schedule
         </h2>
         
         <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Payment Date</div>
            </div>
            <div className="divide-y">
                {loan.emis.map((emi: any) => (
                    <div key={emi.id} className="grid grid-cols-4 p-4 items-center hover:bg-muted/20 transition-colors">
                        <div className="col-span-1 font-medium">
                            {new Date(emi.dueDate).toLocaleDateString()}
                        </div>
                        <div className="col-span-1">
                            ₹{emi.amount.toLocaleString()}
                        </div>
                        <div className="col-span-1">
                            {emi.status === 'PAID' ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                                    <CheckCircle2 className="w-3 h-3 mr-1"/> Paid
                                </Badge>
                            ) : new Date(emi.dueDate) < new Date() && emi.status !== 'PAID' ? (
                                 <Badge variant="destructive" className="shadow-none">
                                    Overdue
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-muted-foreground bg-gray-100 shadow-none">
                                    Pending
                                </Badge>
                            )}
                        </div>
                         <div className="col-span-1 text-right text-sm text-muted-foreground">
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
