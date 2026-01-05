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
            <div className="space-y-2">
              <Label htmlFor="borrowerEmail">Borrower Email</Label>
              <Input
                id="borrowerEmail"
                name="borrowerEmail"
                type="email"
                placeholder="borrower@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">The user must already be registered as a borrower.</p>
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
