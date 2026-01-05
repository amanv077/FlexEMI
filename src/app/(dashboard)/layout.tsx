import Link from 'next/link'
import { signOut } from '@/auth'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="bg-background border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative h-25 w-25">
                    <img src="/logo.png" alt="FlexEMI Logo" className="object-contain" />
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
                <form action={async () => {
                    'use server'
                    await signOut()
                }}>
                <button type="submit" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
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
