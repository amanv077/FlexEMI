'use client'

import { useTransition } from 'react'
import { payEMI } from '@/actions/emi'
import { Button } from '@/components/ui/button'

export function PayEmiButton({ emiId, amount }: { emiId: string, amount: number }) {
  const [isPending, startTransition] = useTransition()

  const handlePayment = () => {
    if (!confirm(`Are you sure you want to pay ₹${amount.toLocaleString()}?`)) return

    startTransition(async () => {
        const result = await payEMI(emiId)
        if (result.error) {
            alert(result.error)
        }
    })
  }

  return (
    <Button 
        size="sm" 
        className="w-full" 
        onClick={handlePayment} 
        disabled={isPending}
    >
        {isPending ? 'Processing...' : 'Pay Now'}
    </Button>
  )
}
