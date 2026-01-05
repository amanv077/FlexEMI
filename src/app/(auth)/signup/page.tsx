'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from '@/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [errorMessage, dispatch] = useActionState(register, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl border border-gray-100">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
                Join FlexEMI today
            </p>
        </div>
        <form action={dispatch} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I want to...</Label>
              <select
                id="role"
                name="role"
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="LOAN_TAKER">Borrow Money</option>
                <option value="LOAN_GIVER">Lend Money</option>
              </select>
            </div>
          </div>

          <div>
            <SignupButton />
          </div>
          
          <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  )
}

function SignupButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Creating account...' : 'Create Account'}
    </button>
  )
}
