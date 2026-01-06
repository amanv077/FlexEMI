import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col cursor-pointer">
            <span className="font-bold text-2xl tracking-tight text-primary">FlexEMI</span>
            <span className="text-[10px] text-muted-foreground leading-none">Smart Lending Simplified</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition cursor-pointer">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-full font-medium hover:bg-primary/90 transition cursor-pointer">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary">FlexEMI</span>
            <span className="text-xs text-muted-foreground">Smart Lending Simplified</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FlexEMI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
