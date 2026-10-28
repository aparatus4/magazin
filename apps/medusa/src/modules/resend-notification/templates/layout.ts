export type EmailTemplate = {
  subject: string
  html: string
  text: string
}

export type TemplateBrand = {
  storeName: string
  storeUrl?: string
}

export type TemplateData = Record<string, unknown>

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

export function renderLayout(
  brand: TemplateBrand,
  subject: string,
  preheader: string,
  contentHtml: string,
): string {
  const storeName = escapeHtml(brand.storeName)
  const footerLink =
    brand.storeUrl && /^https?:\/\//.test(brand.storeUrl)
      ? `<a href="${escapeHtml(brand.storeUrl)}" style="color:#6f6759;text-decoration:none;">${storeName}</a>`
      : storeName

  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f2eee5;color:#1c1b18;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee5;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #ddd5c6;">
            <tr>
              <td style="padding:36px 36px 0 36px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.32em;text-transform:uppercase;color:#1c1b18;">${storeName}</p>
                <div style="height:1px;background:#ddd5c6;margin:22px 0 0 0;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 36px 36px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#1c1b18;">
                ${contentHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 28px 36px;border-top:1px solid #ddd5c6;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6f6759;">
                <p style="margin:0;">Aceasta este o notificare transactională trimisă de ${footerLink}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
