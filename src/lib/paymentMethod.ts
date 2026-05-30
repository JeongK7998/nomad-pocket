import type { PaymentMethod } from '@/types/database'

export function formatPaymentMethodLabel(paymentMethod: PaymentMethod) {
  const owner = paymentMethod.owner?.trim()
  return owner ? `${paymentMethod.name} · ${owner}` : paymentMethod.name
}
