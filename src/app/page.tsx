import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ArrowRight, Shield, Clock, CreditCard, Users, CheckCircle } from 'lucide-react'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    if (session.user.role === 'ADMIN') redirect('/admin')
    if (session.user.role === 'LOAN_GIVER') redirect('/lender')
    if (session.user.role === 'LOAN_TAKER') redirect('/borrower')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight text-primary">FlexEMI</span>
            <span className="text-[10px] text-muted-foreground leading-none">Smart Lending Simplified</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-full font-medium hover:bg-primary/90 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
          Manage Loans with<br />
          <span className="text-primary">Complete Confidence</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          The simplest way to track EMIs, manage borrowers, and stay on top of your lending business.
          No spreadsheets, no confusion—just clarity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup" className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/90 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-secondary text-foreground border border-input rounded-full font-bold shadow-sm hover:bg-secondary/80 transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">Why Choose FlexEMI?</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Built for lenders and borrowers who want a stress-free experience.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<CreditCard className="h-8 w-8 text-primary" />}
            title="Easy EMI Tracking"
            description="Track every payment with automatic reminders. Know exactly what's due and when."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Manage Borrowers"
            description="Create borrower accounts instantly. They get their own dashboard to track payments."
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-primary" />}
            title="Payment Approval"
            description="Borrowers submit payments, you approve them. Full control over your lending."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-20 bg-muted/30 rounded-3xl my-10">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StepCard number="1" title="Create a Loan" description="Add borrower details, amount, interest rate, and tenure." />
          <StepCard number="2" title="Track Payments" description="EMIs are auto-calculated. Borrowers pay, you approve." />
          <StepCard number="3" title="Stay Organized" description="See all loans, payments, and overdue amounts in one dashboard." />
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="text-lg font-medium text-foreground">Built for Trust</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Simple. Transparent. Reliable.</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          FlexEMI is designed for personal lenders and borrowers who value clarity and simplicity.
          No hidden fees, no complex terms—just a straightforward tool to manage your finances.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/90 transition">
          Start Managing Loans Today
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t border-border mt-10">
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
