'use client'

import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loader({ size = 'md', text, className }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Animated EMI coins loader */}
      <div className="relative">
        <div className={cn(
          "rounded-full border-2 border-primary/20 border-t-primary animate-spin",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-transparent border-b-primary/50 animate-spin",
          sizeClasses[size]
        )} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/10" />
          {/* Spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-primary animate-pulse">₹</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{text}</p>
          <p className="text-xs text-muted-foreground">FlexEMI</p>
        </div>
      </div>
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="p-8 flex items-center justify-center">
      <Loader size="md" text="Loading..." />
    </div>
  )
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin", className)} />
  )
}
