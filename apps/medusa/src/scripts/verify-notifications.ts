import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { isPlaceholderValue } from "../lib/env"
import {
  renderEmailTemplate,
  supportedEmailTemplates,
} from "../modules/resend-notification/templates"

const failures: string[] = []

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message)
}

/**
 * Verifies the transactional email adapter without sending real email.
 *
 * Renders the registered templates, checks escaping and failure behaviour, and
 * dispatches one notification through Medusa's Notification Module using the
 * local `feed` provider. Resend is exercised only when real credentials are
 * configured; this script never calls the Resend API.
 */
export default async function verifyNotifications({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const brand = { storeName: "FORMA", storeUrl: "https://forma.example" }
  const orderId = "order_verify_123"

  check(
    supportedEmailTemplates.includes("order-created-template"),
    "order-created-template is not registered",
  )

  const rendered = renderEmailTemplate(
    "order-created-template",
    { order_id: orderId },
    brand,
  )
  check(rendered.subject.includes("FORMA"), "order email subject is missing the brand")
  check(rendered.html.includes(orderId), "order email HTML is missing the order reference")
  check(rendered.text.includes(orderId), "order email text is missing the order reference")

  const injected = renderEmailTemplate(
    "order-created-template",
    { order_id: '<script>alert("x")</script>' },
    brand,
  )
  check(
    !injected.html.includes("<script>"),
    "order email HTML did not escape the order reference",
  )

  let unknownTemplateFailed = false
  try {
    renderEmailTemplate("unknown-template", {}, brand)
  } catch {
    unknownTemplateFailed = true
  }
  check(unknownTemplateFailed, "an unknown email template did not fail")

  const notificationService = container.resolve(Modules.NOTIFICATION)
  const notification = await notificationService.createNotifications({
    to: "dev@localhost",
    channel: "feed",
    template: "order-created-template",
    data: { order_id: orderId },
    trigger_type: "verify:notifications",
    resource_id: orderId,
    resource_type: "order",
  })

  check(
    notification.status === "success",
    `local notification status is ${notification.status}`,
  )
  check(
    notification.provider_id === "local",
    `local notification provider is ${notification.provider_id}`,
  )

  const resendConfigured = Boolean(
    process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM &&
      !isPlaceholderValue(process.env.RESEND_API_KEY) &&
      !isPlaceholderValue(process.env.RESEND_FROM),
  )

  if (failures.length) {
    for (const failure of failures) logger.error(`FAIL: ${failure}`)
    throw new Error(
      `Notification verification failed with ${failures.length} issue(s).`,
    )
  }

  logger.info(
    `Notification verification passed: ${supportedEmailTemplates.length} template(s), local feed dispatch. Resend ${
      resendConfigured ? "is configured" : "is not configured (local development)"
    }.`,
  )
}
