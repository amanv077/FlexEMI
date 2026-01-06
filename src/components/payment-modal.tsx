'use client'

import { useState, useTransition } from 'react'
import { payEMI } from '@/actions/emi'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/loader'
import { X, Copy, Check, QrCode, Building2, Smartphone } from 'lucide-react'
import Image from 'next/image'

interface PaymentModalProps {
  emiId: string
  amount: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Bank details - can be made configurable later
const BANK_DETAILS = {
  accountName: "FlexEMI Payments",
  accountNumber: "1234567890123456",
  ifscCode: "SBIN0001234",
  bankName: "State Bank of India",
  upiId: "flexemi@upi"
}

function PaymentModal({ emiId, amount, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState<string | null>(null)

  if (!isOpen) return null

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirmPayment = () => {
    startTransition(async () => {
      const result = await payEMI(emiId)
      if (result.error) {
        alert(result.error)
      } else {
        onSuccess()
        onClose()
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Complete Payment</h2>
              <p className="text-sm text-muted-foreground">Scan QR or use bank details</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="px-6 py-4 bg-primary/5 border-b border-border">
          <p className="text-sm text-muted-foreground">Amount to Pay</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(amount)}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* QR Code Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <QrCode className="h-4 w-4" />
              Scan to Pay with UPI
            </div>
            <div className="inline-block p-4 bg-white rounded-xl shadow-md border">
              <Image 
                src="/qrcode.png" 
                alt="Payment QR Code" 
                width={180} 
                height={180}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Or Pay Via</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Smartphone className="h-4 w-4" />
              UPI ID
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <span className="font-mono text-sm">{BANK_DETAILS.upiId}</span>
              <button
                onClick={() => copyToClipboard(BANK_DETAILS.upiId, 'upi')}
                className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
              >
                {copied === 'upi' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4" />
              Bank Transfer
            </div>
            <div className="space-y-2 p-4 bg-muted/30 rounded-xl border">
              <DetailRow 
                label="Account Name" 
                value={BANK_DETAILS.accountName}
                onCopy={() => copyToClipboard(BANK_DETAILS.accountName, 'name')}
                copied={copied === 'name'}
              />
              <DetailRow 
                label="Account Number" 
                value={BANK_DETAILS.accountNumber}
                onCopy={() => copyToClipboard(BANK_DETAILS.accountNumber, 'account')}
                copied={copied === 'account'}
              />
              <DetailRow 
                label="IFSC Code" 
                value={BANK_DETAILS.ifscCode}
                onCopy={() => copyToClipboard(BANK_DETAILS.ifscCode, 'ifsc')}
                copied={copied === 'ifsc'}
              />
              <DetailRow 
                label="Bank" 
                value={BANK_DETAILS.bankName}
                onCopy={() => copyToClipboard(BANK_DETAILS.bankName, 'bank')}
                copied={copied === 'bank'}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            After completing payment, click below to notify the lender
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleConfirmPayment}
              disabled={isPending}
            >
              {isPending ? <><ButtonLoader /> Confirming...</> : "I've Paid"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, onCopy, copied }: { 
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium font-mono">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  )
}

export { PaymentModal }
