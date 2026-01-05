'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createLoan } from '@/actions/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateLoanPage() {
    // const [errorMessage, formAction] = useActionState(createLoan, undefined)
	// Fixed: useActionState is correct hook for React 19/Next 15 but if types collide or alpha issues, stick to useFormState or useActionState if working.
	// Since we are on Next 15 canary/RC, useActionState is likely correct but sometimes imports vary.
    // However, in previous file I used useActionState from 'react'.

    const [errorMessage, dispatch] = useActionState(createLoan, undefined)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
            <Link href="/lender">
                <ArrowLeft className="h-4 w-4 mr-1"/> Back
            </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Loan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border bg-gray-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="createBorrower" className="text-base">Create New Borrower?</Label>
                  <p className="text-xs text-muted-foreground">Toggle if the borrower doesn't have an account yet.</p>
                </div>
                <input
                  type="checkbox"
                  id="createBorrower"
                  name="createBorrower"
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => {
                    const passwordField = document.getElementById('borrower-password-container');
                    if (e.target.checked) {
                      passwordField?.classList.remove('hidden');
                      document.getElementById('borrowerName')?.setAttribute('required', 'true');
                      document.getElementById('borrowerPassword')?.setAttribute('required', 'true');
                    } else {
                      passwordField?.classList.add('hidden');
                      document.getElementById('borrowerName')?.removeAttribute('required');
                      document.getElementById('borrowerPassword')?.removeAttribute('required');
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="borrowerEmail">Borrower Email</Label>
                <Input
                  id="borrowerEmail"
                  name="borrowerEmail"
                  type="email"
                  placeholder="borrower@example.com"
                  required
                  className="bg-white"
                />
              </div>

              <div id="borrower-password-container" className="hidden space-y-4 animate-accordion-down">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">Borrower Name</Label>
                  <Input
                    id="borrowerName"
                    name="borrowerName"
                    type="text"
                    placeholder="John Doe"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrowerPassword">Borrower Password</Label>
                  <Input
                    id="borrowerPassword"
                    name="borrowerPassword"
                    type="password"
                    placeholder="Set a temporary password"
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground">Share this password with the borrower.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% per year)</Label>
                <Input
                    id="interestRate"
                    name="interestRate"
                    type="number"
                    placeholder="12"
                    min="0"
                    step="0.01"
                    required
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanName">Loan Name (Optional)</Label>
              <Input
                id="loanName"
                name="loanName"
                type="text"
                placeholder="e.g. Home Loan, Personal Expense"
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="tenure">Tenure (Months)</Label>
                <Input
                    id="tenure"
                    name="tenure"
                    type="number"
                    placeholder="12"
                    min="1"
                    step="1"
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateFeeAmount">Late Fee per EMI (₹)</Label>
              <Input
                id="lateFeeAmount"
                name="lateFeeAmount"
                type="number"
                placeholder="500"
                defaultValue="500"
                min="0"
                step="1"
                required
              />
              <p className="text-xs text-muted-foreground">This amount will be charged if an EMI is overdue.</p>
            </div>

            <div className="pt-4">
                <SubmitButton />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Loan...' : 'Create Loan'}
    </Button>
  )
}
