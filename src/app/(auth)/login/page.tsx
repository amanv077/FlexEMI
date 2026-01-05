'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { authenticate } from '@/actions/auth'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)

  return (
    <div className="space-y-6 rounded-3xl bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all sm:p-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to your FlexEMI account
        </p>
      </div>
      <form action={dispatch} className="space-y-6">
        <div className="space-y-4">
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="bg-gray-50/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remember-me" className="text-sm text-gray-500">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              Forgot password?
            </a>
          </div>
        </div>

        <div className="pt-2">
          <LoginButton />
        </div>

        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
          )}
        </div>
      </form>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  )
}
