import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  console.log("Home page session:", session)

  if (session?.user) {
    console.log("Redirecting based on role:", session.user.role)
    // Redirect based on role if possible, or just to default dashboard
    if (session.user.role === 'ADMIN') redirect('/admin')
    if (session.user.role === 'LOAN_GIVER') redirect('/lender')
    if (session.user.role === 'LOAN_TAKER') redirect('/borrower')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-6 tracking-tight">FlexEMI</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-lg">
        The easiest way to manage loans and convert them into flexible EMIs.
        Login to manage your payments or lend money.
      </p>
      <div className="flex space-x-4">
        <Link href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
          Get Started
        </Link>
        <Link href="/login" className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-full font-bold shadow-sm hover:bg-blue-50 transition">
          Sign In
        </Link>
      </div>
    </div>
  )
}
