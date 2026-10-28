import { renderOrderCreatedTemplate } from "./order-created"
import type { EmailTemplate, TemplateBrand, TemplateData } from "./layout"

type TemplateRenderer = (
  data: TemplateData,
  brand: TemplateBrand,
) => EmailTemplate

const templates: Record<string, TemplateRenderer> = {
  "order-created-template": renderOrderCreatedTemplate,
}

export const supportedEmailTemplates = Object.keys(templates)

export function renderEmailTemplate(
  template: string,
  data: TemplateData,
  brand: TemplateBrand,
): EmailTemplate {
  const render = templates[template]

  if (!render) {
    throw new Error(
      `No transactional email template is registered for "${template}". Supported templates: ${supportedEmailTemplates.join(", ")}.`,
    )
  }

  return render(data, brand)
}

export type { EmailTemplate, TemplateBrand, TemplateData }
