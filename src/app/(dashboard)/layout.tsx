import Link from 'next/link'
import { signOut } from '@/auth'

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
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-xl tracking-tight text-primary">FlexEMI</span>
                    <span className="text-[10px] text-muted-foreground leading-none">Smart Lending Simplified</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
                <form action={async () => {
                    'use server'
                    await signOut()
                }}>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-medium border border-border text-foreground/70 hover:text-foreground hover:border-foreground/40 rounded-full transition-all cursor-pointer"
                >
                  Log out
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
