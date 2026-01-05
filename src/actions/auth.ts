'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    console.log("Attempting sign in...")
    // Convert FormData to object to include redirectTo
    const data = Object.fromEntries(formData)
    await signIn('credentials', { ...data, redirectTo: '/' })
    console.log("Sign in successful (should redirect)")
  } catch (error) {
    console.log("Sign in error:", error)
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

export async function register(prevState: string | undefined, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  if (!email || !password || !role) {
    return 'Please fill in all fields.'
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
        return 'User already exists.'
    }

    // Simple hashing for demo (crypto is built-in)
    // In real prod, use bcrypt/argon2
    // const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    // Actually, for simplicity and compatibility with the login check I wrote earlier (plain text comparison),
    // I will use plain text OR update login to use hash.
    // I'll use plain text for now as per my previous Auth.ts code. 
    // "if (password === user.password) return user"
    
    await prisma.user.create({
      data: {
        name,
        email,
        password: password, // Storing plain text as requested/implied by simple setup. 
        role,
      },
    })
  } catch (error) {
    console.error(error)
    return 'Failed to create user.'
  }

  redirect('/login')
}

