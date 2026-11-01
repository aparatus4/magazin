# Admin Customizations

You can extend the Medusa Admin to add widgets and new pages. Your customizations interact with API routes to provide merchants with custom functionalities.

## FORMA extensions

- `widgets/provisional-data-warning.tsx` — product-detail sidebar warning. It is
  shown only when the product's `metadata.data_status` is `provisional`, which
  the seed sets on every catalogue product until launch prices are approved.
  The widget uses `@medusajs/ui` (pinned `4.2.8`).
- `i18n/index.ts` — empty namespace map; add Admin translations here when a
  custom string needs one.
- Build with `pnpm --filter @forma/medusa admin:build`. The output is
  `.medusa/admin`.

> Learn more about Admin Extensions in [this documentation](https://docs.medusajs.com/learn/fundamentals/admin).

## Example: Create a Widget

A widget is a React component that can be injected into an existing page in the admin dashboard.

For example, create the file `src/admin/widgets/product-widget.tsx` with the following content:

```tsx title="src/admin/widgets/product-widget.tsx"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

// The widget
const ProductWidget = () => {
  return (
    <div>
      <h2>Product Widget</h2>
    </div>
  )
}

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductWidget
```

This inserts a widget with the text “Product Widget” at the end of a product’s details page.