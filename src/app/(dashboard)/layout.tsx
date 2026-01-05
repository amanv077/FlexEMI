import Link from 'next/link'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">FlexEMI</Link>
              </div>
            </div>
            <div className="flex items-center">
                <form action={async () => {
                    'use server'
                    await signOut()
                }}>
                    <button type="submit" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                        Sign Out
                    </button>
                </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
