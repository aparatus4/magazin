import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FORMA CMS",
  description: "Content management for FORMA.",
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
