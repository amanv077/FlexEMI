'use client'

import { useTransition } from 'react'
import { markUnpaid } from '@/actions/emi'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/loader'
import { Undo2 } from 'lucide-react'

export function MarkUnpaidButton({ emiId }: { emiId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleMarkUnpaid = () => {
    if (!confirm('Are you sure you want to mark this EMI as unpaid? The borrower will be notified.')) return

    startTransition(async () => {
      const result = await markUnpaid(emiId)
      if (result.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button 
      size="sm" 
      variant="ghost"
      className="gap-1 text-muted-foreground hover:text-destructive h-7 px-2"
      onClick={handleMarkUnpaid} 
      disabled={isPending}
    >
      {isPending ? <ButtonLoader /> : <Undo2 className="h-3 w-3" />}
      {isPending ? 'Reverting...' : 'Mark Unpaid'}
    </Button>
  )
}
