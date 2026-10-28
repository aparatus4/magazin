import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { isPlaceholderValue } from "../lib/env"

export default async function verifyPaymentProvider({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const paymentService = container.resolve(Modules.PAYMENT)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const apiKey = process.env.STRIPE_API_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (
    !apiKey ||
    !webhookSecret ||
    isPlaceholderValue(apiKey) ||
    isPlaceholderValue(webhookSecret)
  ) {
    throw new Error(
      "Stripe test credentials are missing or still placeholders. Replace STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET in apps/medusa/.env with values from the Stripe test dashboard.",
    )
  }

  const providers = await paymentService.listPaymentProviders({})
  const providerIds = providers.map((provider) => provider.id)

  if (!providerIds.includes("pp_system_default")) {
    throw new Error("The Medusa system payment provider is not registered.")
  }

  const stripe = providers.find((provider) => provider.id === "pp_stripe_stripe")
  if (!stripe) {
    throw new Error(
      "Stripe payment provider is not registered. Add STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET to apps/medusa/.env and restart.",
    )
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })
  const region = regions.find((entry) => entry.name === "Romania")
  if (!region) {
    throw new Error("Romania region is missing.")
  }

  if (!region.payment_providers?.some((provider) => provider?.id === stripe.id)) {
    throw new Error(`Romania region does not include ${stripe.id}.`)
  }

  logger.info(
    `Payment providers ready: ${providerIds.join(", ")}. Stripe is enabled for Romania (capture on checkout).`,
  )
}
