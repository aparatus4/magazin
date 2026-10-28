import { z } from "zod"
import { ProductMetaV1Schema } from "@forma/contracts/product"

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case handle")

const assetPath = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .startsWith("/", "must be an absolute path on the public asset origin")

const shortText = z.string().trim().min(1).max(160)
const longText = z.string().trim().min(1).max(5000)

export const SeedCategorySchema = z
  .object({
    handle: slug,
    name: shortText,
    tagline: shortText,
    description: longText,
    rank: z.number().int().nonnegative(),
    subcategories: z
      .array(
        z
          .object({
            handle: slug,
            name: shortText,
            note: shortText,
          })
          .strict(),
      )
      .max(20),
  })
  .strict()

export const SeedCollectionSchema = z
  .object({
    handle: slug,
    title: shortText,
    description: longText,
  })
  .strict()

export const SeedVariantSchema = z
  .object({
    title: shortText,
    sku: z.string().trim().min(1).max(64),
    options: z.record(z.string(), z.string().trim().min(1).max(40)),
    price_ron_minor: z.number().int().positive().nullable(),
    stock: z.number().int().nonnegative().nullable(),
    weight_grams: z.number().int().positive(),
  })
  .strict()

const SeedImageSchema = z
  .object({
    path: assetPath,
    alt: shortText,
  })
  .strict()

export const SeedProductSchema = z
  .object({
    handle: slug,
    title: shortText,
    subtitle: shortText.optional(),
    description: longText,
    category_handle: slug,
    collection_handles: z.array(slug).max(10),
    thumbnail_path: assetPath,
    images: z.array(SeedImageSchema).min(1).max(12),
    options: z
      .array(
        z
          .object({
            title: shortText,
            values: z.array(shortText).min(1).max(24),
          })
          .strict(),
      )
      .max(3),
    variants: z.array(SeedVariantSchema).min(1).max(32),
    metadata: z
      .object({
        data_status: z.enum(["provisional", "verified"]),
        forma: ProductMetaV1Schema,
      })
      .strict(),
  })
  .strict()
  .superRefine((product, ctx) => {
    const optionValues = new Map(product.options.map((option) => [option.title, new Set(option.values)]))

    for (const [index, variant] of product.variants.entries()) {
      const variantKeys = Object.keys(variant.options)
      if (variantKeys.length !== product.options.length) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", index, "options"],
          message: "variant options must set every product option exactly once",
        })
      }

      for (const [key, value] of Object.entries(variant.options)) {
        if (!optionValues.get(key)?.has(value)) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "options", key],
            message: `value "${value}" is not declared on the "${key}" option`,
          })
        }
      }
    }

    const availability = product.metadata.forma.availability
    if (availability === "ready") {
      for (const [index, variant] of product.variants.entries()) {
        if (variant.stock === null || variant.stock < 1) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "stock"],
            message: "ready products need positive stock on every variant",
          })
        }
        if (variant.price_ron_minor === null) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "price_ron_minor"],
            message: "ready products need a price on every variant",
          })
        }
      }
    }

    if (availability !== "ready") {
      for (const [index, variant] of product.variants.entries()) {
        if (variant.stock !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "stock"],
            message: "made-to-order and custom products must not claim stock",
          })
        }
      }
    }
  })

export const SeedCatalogSchema = z.array(SeedProductSchema).length(14)

export type SeedCategory = z.infer<typeof SeedCategorySchema>
export type SeedCollection = z.infer<typeof SeedCollectionSchema>
export type SeedProduct = z.infer<typeof SeedProductSchema>
export type SeedVariant = z.infer<typeof SeedVariantSchema>

export interface SeedData {
  categories: SeedCategory[]
  collections: SeedCollection[]
  products: SeedProduct[]
}

export function validateSeedData(input: {
  categories: unknown
  collections: unknown
  products: unknown
}): SeedData {
  const categories = z.array(SeedCategorySchema).length(10).parse(input.categories)
  const collections = z.array(SeedCollectionSchema).min(1).parse(input.collections)
  const products = SeedCatalogSchema.parse(input.products)

  const categoryHandles = new Set(categories.map((category) => category.handle))
  const collectionHandles = new Set(collections.map((collection) => collection.handle))
  const productHandles = new Set<string>()
  const skus = new Set<string>()

  if (categoryHandles.size !== categories.length) {
    throw new Error("Seed categories contain duplicate handles")
  }
  if (collectionHandles.size !== collections.length) {
    throw new Error("Seed collections contain duplicate handles")
  }

  for (const category of categories) {
    const subcategoryHandles = new Set(category.subcategories.map((subcategory) => subcategory.handle))
    if (subcategoryHandles.size !== category.subcategories.length) {
      throw new Error(`Category ${category.handle} contains duplicate subcategory handles`)
    }
  }

  for (const product of products) {
    if (productHandles.has(product.handle)) {
      throw new Error(`Duplicate product handle: ${product.handle}`)
    }
    productHandles.add(product.handle)

    if (!categoryHandles.has(product.category_handle)) {
      throw new Error(`Product ${product.handle} references unknown category ${product.category_handle}`)
    }

    for (const handle of product.collection_handles) {
      if (!collectionHandles.has(handle)) {
        throw new Error(`Product ${product.handle} references unknown collection ${handle}`)
      }
    }

    if (
      product.collection_handles.includes("ready-to-ship") &&
      product.metadata.forma.availability !== "ready"
    ) {
      throw new Error(`Product ${product.handle} is in ready-to-ship but is not ready availability`)
    }

    for (const variant of product.variants) {
      if (skus.has(variant.sku)) {
        throw new Error(`Duplicate SKU: ${variant.sku}`)
      }
      skus.add(variant.sku)
    }
  }

  return { categories, collections, products }
}
