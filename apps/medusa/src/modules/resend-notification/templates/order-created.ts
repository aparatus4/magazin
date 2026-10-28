import {
  escapeHtml,
  renderLayout,
  type EmailTemplate,
  type TemplateBrand,
  type TemplateData,
} from "./layout"

const readOrderId = (data: TemplateData): string => {
  const orderId = typeof data.order_id === "string" ? data.order_id.trim() : ""
  if (!orderId) {
    throw new Error(
      'The "order-created-template" email requires data.order_id.',
    )
  }
  return orderId
}

export function renderOrderCreatedTemplate(
  data: TemplateData,
  brand: TemplateBrand,
): EmailTemplate {
  const orderId = readOrderId(data)
  const safeOrderId = escapeHtml(orderId)
  const subject = `Comanda ta ${brand.storeName} a fost înregistrată`

  const contentHtml = `
    <p style="margin:0 0 16px 0;">Bună,</p>
    <p style="margin:0 0 20px 0;">Comanda ta a fost înregistrată.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee5;border:1px solid #ddd5c6;margin:0 0 20px 0;">
      <tr>
        <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6f6759;letter-spacing:0.08em;text-transform:uppercase;">Referință comandă</td>
      </tr>
      <tr>
        <td style="padding:0 20px 18px 20px;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.5;color:#1c1b18;word-break:break-all;">${safeOrderId}</td>
      </tr>
    </table>
    <p style="margin:0;">Păstrăm comanda în sistemul nostru și revenim cu detalii despre pregătire și livrare.</p>
  `

  const text = [
    brand.storeName,
    "",
    "Comanda ta a fost înregistrată.",
    "",
    `Referință comandă: ${orderId}`,
    "",
    "Păstrăm comanda în sistemul nostru și revenim cu detalii despre pregătire și livrare.",
    "",
    "Aceasta este o notificare transactională.",
  ].join("\n")

  return {
    subject,
    html: renderLayout(
      brand,
      subject,
      "Comanda ta a fost înregistrată.",
      contentHtml,
    ),
    text,
  }
}
