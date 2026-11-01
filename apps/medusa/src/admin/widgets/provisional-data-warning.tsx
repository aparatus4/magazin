import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

type ProductWidgetData = {
  metadata?: {
    data_status?: unknown
  } | null
}

const isProvisional = (data: unknown): boolean => {
  if (typeof data !== "object" || data === null) {
    return false
  }

  const metadata = (data as ProductWidgetData).metadata

  return metadata?.data_status === "provisional"
}

/**
 * Reminds staff that seeded catalogue prices are development conversions.
 * The seed marks every product with `metadata.data_status = "provisional"`
 * until launch prices are approved.
 */
const ProvisionalDataWarning = ({ data }: { data?: unknown }) => {
  if (!isProvisional(data)) {
    return null
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between gap-x-2 px-6 py-4">
        <Heading level="h2">Provisional catalogue data</Heading>
        <Badge color="orange" size="small">
          Dev only
        </Badge>
      </div>
      <div className="border-t px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          This product&apos;s catalogue data is provisional. Seeded prices are
          development conversions, not launch prices; replace them with approved
          RON prices before the storefront is published. Portrait and
          custom-scan work remain unpriced.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
  id: "forma-provisional-data-warning",
})

export default ProvisionalDataWarning
