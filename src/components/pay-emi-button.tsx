'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentModal } from '@/components/payment-modal'

export function PayEmiButton({ emiId, amount }: { emiId: string, amount: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button 
        size="sm" 
        className="w-full" 
        onClick={() => setIsModalOpen(true)}
      >
        Pay Now
      </Button>

      <PaymentModal
        emiId={emiId}
        amount={amount}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Payment submitted for approval
        }}
      />
    </>
  )
}
