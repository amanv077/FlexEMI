'use client'

import { useTransition } from 'react'
import { checkLateFees } from '@/actions/charges'
import { Button } from '@/components/ui/button'

export function CheckLateFeesButton() {
  const [isPending, startTransition] = useTransition()

  const handleCheck = () => {
    startTransition(async () => {
        const result = await checkLateFees()
        if (result.error) {
            alert(result.error)
        } else if (result.success) {
            alert(`Late fees check complete. Added ${result.chargesAdded} new charges.`)
        }
    })
  }

  return (
    <Button 
        variant="outline"
        onClick={handleCheck} 
        disabled={isPending}
        className="w-full sm:w-auto"
    >
        {isPending ? 'Checking...' : 'Check for Late Fees'}
    </Button>
  )
}
