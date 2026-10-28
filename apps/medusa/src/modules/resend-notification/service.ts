import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { Resend } from "resend"

import { renderEmailTemplate } from "./templates"

export type ResendNotificationOptions = {
  apiKey: string
  from: string
  storeName?: string
  storeUrl?: string
  replyTo?: string
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  static validateOptions(options: Record<string, unknown>): void {
    if (typeof options.apiKey !== "string" || options.apiKey.trim() === "") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend notification provider requires an API key.",
      )
    }

    if (typeof options.from !== "string" || options.from.trim() === "") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend notification provider requires a sender address.",
      )
    }
  }

  protected readonly logger_: Logger
  protected readonly options_: ResendNotificationOptions
  protected readonly resend_: Resend

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationOptions,
  ) {
    super()

    this.logger_ = logger
    this.options_ = options
    this.resend_ = new Resend(options.apiKey)
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO,
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (notification.channel !== "email") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Resend notification provider only supports the email channel, received "${notification.channel}".`,
      )
    }

    if (!notification.to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend notification provider requires a recipient.",
      )
    }

    const rendered = renderEmailTemplate(
      notification.template,
      notification.data ?? {},
      {
        storeName: this.options_.storeName ?? "FORMA",
        storeUrl: this.options_.storeUrl,
      },
    )

    const { data, error } = await this.resend_.emails.send({
      from: notification.from || this.options_.from,
      to: notification.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...(this.options_.replyTo ? { replyTo: this.options_.replyTo } : {}),
    })

    if (error) {
      this.logger_.error(
        `Resend rejected template "${notification.template}" (${error.name}): ${error.message}`,
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Resend delivery failed: ${error.message}`,
      )
    }

    this.logger_.info(
      `Resend accepted template "${notification.template}" (message ${data?.id ?? "unknown"}).`,
    )

    return { id: data?.id }
  }
}

export default ResendNotificationProviderService
