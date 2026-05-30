'use client'

import { useState } from 'react'
import { FAB } from '@/app/components/layout/FAB'
import { TransactionInputPopup } from '@/app/components/layout/TransactionInputPopup'

interface GlobalTransactionFabProps {
  onSaved?: () => void | Promise<void>
}

export function GlobalTransactionFab({ onSaved }: GlobalTransactionFabProps) {
  const [open, setOpen] = useState(false)

  const handleSaved = async () => {
    if (onSaved) {
      await onSaved()
      return
    }

    window.location.reload()
  }

  return (
    <>
      <FAB onClick={() => setOpen(true)} />
      {open && (
        <TransactionInputPopup
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
