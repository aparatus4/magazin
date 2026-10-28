import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { readPaymentTruth } from "../lib/payments/read-payment-truth"

const failures: string[] = []

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message)
}

/**
 * Verifies the launch capture policy from Medusa's own records.
 *
 * Set ORDER_ID or PAYMENT_COLLECTION_ID. Optionally set EXPECT_PROVIDER
 * (for example `pp_stripe_stripe`) and EXPECT_CAPTURED_AMOUNT in minor units.
 * The same command works whether or not the Stripe `payment.captured` event
 * arrived, because it reads the Payment/Capture/Refund state directly.
 */
export default async function verifyPaymentTruth({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const orderId = process.env.ORDER_ID
  let paymentCollectionId = process.env.PAYMENT_COLLECTION_ID

  if (!paymentCollectionId && orderId) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "total",
        "currency_code",
        "payment_collections.id",
      ],
      filters: { id: orderId },
    })

    const order = orders[0]
    if (!order) {
      throw new Error(`Order ${orderId} was not found.`)
    }

    paymentCollectionId = order.payment_collections?.[0]?.id
    if (!paymentCollectionId) {
      throw new Error(`Order ${orderId} has no payment collection.`)
    }

    logger.info(
      `Order ${order.display_id}: ${order.total} ${order.currency_code}, payment collection ${paymentCollectionId}.`,
    )
  }

  if (!paymentCollectionId) {
    throw new Error(
      "Set ORDER_ID or PAYMENT_COLLECTION_ID before running verify:payment-truth.",
    )
  }

  const truth = await readPaymentTruth(container, paymentCollectionId)
  if (!truth) {
    throw new Error(`Payment collection ${paymentCollectionId} was not found.`)
  }

  logger.info(`Payment truth: ${JSON.stringify(truth, null, 2)}`)

  const expectedProvider = process.env.EXPECT_PROVIDER
  if (expectedProvider) {
    check(
      truth.payments.length > 0 &&
        truth.payments.every((payment) => payment.provider_id === expectedProvider),
      `expected provider ${expectedProvider}, found ${
        truth.payments.map((payment) => payment.provider_id).join(", ") || "none"
      }`,
    )
  }

  const expectedCapturedAmount = process.env.EXPECT_CAPTURED_AMOUNT
  if (expectedCapturedAmount !== undefined) {
    const amount = Number(expectedCapturedAmount)
    check(Number.isFinite(amount), "EXPECT_CAPTURED_AMOUNT is not a number")
    check(
      truth.totals.captured_amount === amount,
      `captured ${truth.totals.captured_amount}, expected ${amount}`,
    )
  }

  check(
    truth.totals.payment_count === 1,
    `expected one payment, found ${truth.totals.payment_count}`,
  )
  check(
    truth.totals.capture_count === 1,
    `expected one capture, found ${truth.totals.capture_count}`,
  )
  check(
    truth.totals.refund_count === 0,
    `expected no refunds, found ${truth.totals.refund_count}`,
  )
  check(
    truth.totals.captured_amount === truth.captured_amount,
    `collection captured_amount ${truth.captured_amount} does not match captures ${truth.totals.captured_amount}`,
  )
  check(
    truth.totals.refunded_amount === truth.refunded_amount,
    `collection refunded_amount ${truth.refunded_amount} does not match refunds ${truth.totals.refunded_amount}`,
  )
  check(
    truth.captured_amount === truth.amount,
    `captured ${truth.captured_amount} does not match collection amount ${truth.amount}`,
  )
  check(
    truth.payments.every(
      (payment) => payment.currency_code === truth.currency_code,
    ),
    "payment currency does not match the collection currency",
  )
  check(
    truth.payments.every(
      (payment) =>
        payment.captures.length === 1 &&
        payment.captures[0]?.amount === payment.amount,
    ),
    "capture amount does not match the payment amount",
  )

  if (failures.length) {
    for (const failure of failures) logger.error(`FAIL: ${failure}`)
    throw new Error(
      `Payment truth verification failed with ${failures.length} issue(s).`,
    )
  }

  logger.info(
    `Payment truth verified: ${truth.totals.capture_count} capture(s), ${truth.totals.captured_amount} ${truth.currency_code}, ${truth.totals.refund_count} refund(s), provider ${truth.payments
      .map((payment) => payment.provider_id)
      .join(", ")}.`,
  )
}
