'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from '@/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const [errorMessage, dispatch] = useActionState(register, undefined)

  return (
    <div className="space-y-6 rounded-3xl bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all sm:p-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
        <p className="mt-2 text-sm text-gray-500">
          Join FlexEMI today
        </p>
      </div>
      <form action={dispatch} className="space-y-5">
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
              className="bg-gray-50/50"
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
              placeholder="name@example.com"
              className="bg-gray-50/50"
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
              className="bg-gray-50/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">I want to...</Label>
            <div className="relative">
              <select
                id="role"
                name="role"
                required
                className="flex h-12 w-full appearance-none rounded-2xl border border-input bg-gray-50/50 px-4 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground"
              >
                <option value="LOAN_TAKER">Borrow Money</option>
                <option value="LOAN_GIVER">Lend Money</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <SignupButton />
        </div>

        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
          )}
        </div>
      </form>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function SignupButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Creating account...' : 'Create Account'}
    </Button>
  )
}
