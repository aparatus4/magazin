import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Server-only payment truth reader.
 *
 * Reconstructs the current Medusa Payment/Capture/Refund state for a Payment
 * Collection through the Query API. It never calls Stripe and never relies on
 * provider metadata, so the same path can reconcile a checkout whether or not
 * the `payment.captured` event arrived.
 */

type MoneyValue =
  | number
  | string
  | { toJSON?: () => number | string }
  | null
  | undefined

const toAmount = (value: MoneyValue, field: string): number => {
  if (value === null || value === undefined) return 0

  const raw =
    typeof value === "object" && typeof value.toJSON === "function"
      ? value.toJSON()
      : value
  const amount = Number(raw)

  if (!Number.isFinite(amount)) {
    throw new Error(`Payment truth: ${field} is not a finite amount.`)
  }

  return amount
}

const toIsoString = (value: string | Date | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  return value instanceof Date ? value.toISOString() : value
}

const toRequiredIsoString = (
  value: string | Date | null | undefined,
  field: string,
): string => {
  const iso = toIsoString(value)
  if (iso === null) {
    throw new Error(`Payment truth: ${field} is missing.`)
  }
  return iso
}

export type PaymentTruthCapture = {
  id: string
  amount: number
  created_at: string
}

export type PaymentTruthRefund = {
  id: string
  amount: number
  status: string
  created_at: string
}

export type PaymentTruthPayment = {
  id: string
  provider_id: string
  amount: number
  currency_code: string
  captured_at: string | null
  canceled_at: string | null
  captures: PaymentTruthCapture[]
  refunds: PaymentTruthRefund[]
}

export type PaymentTruth = {
  payment_collection_id: string
  currency_code: string
  amount: number
  authorized_amount: number
  captured_amount: number
  refunded_amount: number
  status: string
  completed_at: string | null
  payments: PaymentTruthPayment[]
  totals: {
    payment_count: number
    capture_count: number
    refund_count: number
    captured_amount: number
    refunded_amount: number
  }
}

export async function readPaymentTruth(
  container: MedusaContainer,
  paymentCollectionId: string,
): Promise<PaymentTruth | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "payment_collection",
    fields: [
      "id",
      "currency_code",
      "amount",
      "authorized_amount",
      "captured_amount",
      "refunded_amount",
      "status",
      "completed_at",
      "payments.id",
      "payments.provider_id",
      "payments.amount",
      "payments.currency_code",
      "payments.captured_at",
      "payments.canceled_at",
      "payments.captures.id",
      "payments.captures.amount",
      "payments.captures.created_at",
      "payments.refunds.id",
      "payments.refunds.amount",
      "payments.refunds.status",
      "payments.refunds.created_at",
    ],
    filters: { id: paymentCollectionId },
  })

  const collection = data[0]
  if (!collection) return null

  const payments: PaymentTruthPayment[] = (collection.payments ?? [])
    .filter((payment): payment is NonNullable<typeof payment> => Boolean(payment))
    .map((payment) => {
      const captures = (payment.captures ?? [])
        .filter((capture): capture is NonNullable<typeof capture> => Boolean(capture))
        .map((capture) => ({
          id: capture.id,
          amount: toAmount(capture.amount, `capture ${capture.id}.amount`),
          created_at: toRequiredIsoString(
            capture.created_at,
            `capture ${capture.id}.created_at`,
          ),
        }))

      const refunds = (payment.refunds ?? [])
        .filter((refund): refund is NonNullable<typeof refund> => Boolean(refund))
        .map((refund) => ({
          id: refund.id,
          amount: toAmount(refund.amount, `refund ${refund.id}.amount`),
          status: refund.status,
          created_at: toRequiredIsoString(
            refund.created_at,
            `refund ${refund.id}.created_at`,
          ),
        }))

      return {
        id: payment.id,
        provider_id: payment.provider_id,
        amount: toAmount(payment.amount, `payment ${payment.id}.amount`),
        currency_code: payment.currency_code,
        captured_at: toIsoString(payment.captured_at),
        canceled_at: toIsoString(payment.canceled_at),
        captures,
        refunds,
      }
    })

  const capturedAmount = payments.reduce(
    (total, payment) =>
      total + payment.captures.reduce((sum, capture) => sum + capture.amount, 0),
    0,
  )
  const refundedAmount = payments.reduce(
    (total, payment) =>
      total + payment.refunds.reduce((sum, refund) => sum + refund.amount, 0),
    0,
  )

  return {
    payment_collection_id: collection.id,
    currency_code: collection.currency_code,
    amount: toAmount(collection.amount, "payment collection amount"),
    authorized_amount: toAmount(
      collection.authorized_amount,
      "payment collection authorized_amount",
    ),
    captured_amount: toAmount(
      collection.captured_amount,
      "payment collection captured_amount",
    ),
    refunded_amount: toAmount(
      collection.refunded_amount,
      "payment collection refunded_amount",
    ),
    status: collection.status,
    completed_at: toIsoString(collection.completed_at),
    payments,
    totals: {
      payment_count: payments.length,
      capture_count: payments.reduce(
        (count, payment) => count + payment.captures.length,
        0,
      ),
      refund_count: payments.reduce(
        (count, payment) => count + payment.refunds.length,
        0,
      ),
      captured_amount: capturedAmount,
      refunded_amount: refundedAmount,
    },
  }
}
