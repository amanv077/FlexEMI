'use client'

import { useTransition } from 'react'
import { approvePayment, rejectPayment } from '@/actions/emi'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/loader'
import { Check, X } from 'lucide-react'

export function ApprovePaymentButton({ emiId, amount }: { emiId: string, amount: number }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    if (!confirm(`Approve payment of ₹${amount.toLocaleString()}?`)) return

    startTransition(async () => {
        const result = await approvePayment(emiId)
        if (result.error) {
            alert(result.error)
        }
    })
  }

  return (
    <Button 
        size="sm" 
        variant="default"
        className="gap-1" 
        onClick={handleApprove} 
        disabled={isPending}
    >
        {isPending ? <ButtonLoader /> : <Check className="h-3 w-3" />}
        {isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}

export function RejectPaymentButton({ emiId, amount }: { emiId: string, amount: number }) {
  const [isPending, startTransition] = useTransition()

  const handleReject = () => {
    if (!confirm(`Reject payment of ₹${amount.toLocaleString()}? The borrower will need to submit again.`)) return

    startTransition(async () => {
        const result = await rejectPayment(emiId)
        if (result.error) {
            alert(result.error)
        }
    })
  }

  return (
    <Button 
        size="sm" 
        variant="destructive"
        className="gap-1" 
        onClick={handleReject} 
        disabled={isPending}
    >
        {isPending ? <ButtonLoader /> : <X className="h-3 w-3" />}
        {isPending ? 'Rejecting...' : 'Reject'}
    </Button>
  )
}
