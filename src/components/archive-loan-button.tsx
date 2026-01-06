'use client'

import { useTransition } from 'react'
import { toggleArchiveLoan } from '@/actions/loan'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/loader'

export function ArchiveLoanButton({ loanId, isArchived }: { loanId: string, isArchived: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleArchiveLoan(loanId)
    })
  }

  return (
    <Button
      variant={isArchived ? "secondary" : "outline"}
      size="sm"
      className={isArchived ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none" : ""}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? <><ButtonLoader /> Processing...</> : (isArchived ? "Archived" : "Archive")}
    </Button>
  )
}
