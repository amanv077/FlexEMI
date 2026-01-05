import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/admin') || 
                            nextUrl.pathname.startsWith('/lender') || 
                            nextUrl.pathname.startsWith('/borrower');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect to appropriate dashboard if logged in and visiting auth pages (optional)
        // For now, let them proceed
      }
      return true
    },
    jwt({ token, user }) {
        if (user) {
          token.role = user.role
          token.id = user.id
        }
        return token
      },
      session({ session, token }) {
        if (token && session.user) {
          session.user.role = token.role as string
          session.user.id = token.id as string
        }
        return session
      },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
