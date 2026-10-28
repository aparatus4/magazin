import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"

import catalogData from "../data/catalog.json"
import categoriesData from "../data/categories.json"
import collectionsData from "../data/collections.json"
import { validateSeedData } from "../data/schema"

const failures: string[] = []

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message)
}

export default async function verifyCatalog({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const seed = validateSeedData({
    categories: categoriesData,
    collections: collectionsData,
    products: catalogData,
  })

  // --- Products and variants ----------------------------------------------
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "status",
      "thumbnail",
      "metadata",
      "collection_id",
      "categories.id",
      "categories.handle",
      "variants.id",
      "variants.sku",
      "variants.title",
      "variants.manage_inventory",
      "variants.weight",
      "variants.price_set.prices.amount",
      "variants.price_set.prices.currency_code",
    ],
  })

  check(
    products.length === seed.products.length,
    `expected ${seed.products.length} products, found ${products.length}`,
  )

  const productsByHandle = new Map(products.map((product) => [product.handle, product]))
  const variantsBySku = new Map<string, (typeof products)[number]["variants"][number]>()

  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.sku) variantsBySku.set(variant.sku, variant)
    }
  }

  for (const expected of seed.products) {
    const product = productsByHandle.get(expected.handle)
    check(Boolean(product), `missing product ${expected.handle}`)
    if (!product) continue

    check(
      product.status === ProductStatus.PUBLISHED,
      `${expected.handle}: status is ${product.status}, expected published`,
    )
    check(
      product.categories?.some(
        (category) => category?.handle === expected.category_handle,
      ) ?? false,
      `${expected.handle}: missing category ${expected.category_handle}`,
    )
    check(
      product.thumbnail?.startsWith("http") ?? false,
      `${expected.handle}: thumbnail is not an absolute URL`,
    )

    const metadata = product.metadata as
      | { data_status?: string; forma?: { availability?: string } }
      | null
    check(
      metadata?.data_status === expected.metadata.data_status,
      `${expected.handle}: data_status mismatch`,
    )
    check(
      metadata?.forma?.availability === expected.metadata.forma.availability,
      `${expected.handle}: availability metadata mismatch`,
    )

    for (const expectedVariant of expected.variants) {
      const variant = variantsBySku.get(expectedVariant.sku)
      check(Boolean(variant), `${expected.handle}: missing variant ${expectedVariant.sku}`)
      if (!variant) continue

      check(
        variant.manage_inventory ===
          (expected.metadata.forma.availability === "ready"),
        `${expectedVariant.sku}: manage_inventory mismatch`,
      )
      check(
        variant.weight === expectedVariant.weight_grams,
        `${expectedVariant.sku}: weight ${variant.weight}, expected ${expectedVariant.weight_grams}`,
      )

      const ronPrices =
        variant.price_set?.prices?.filter((price) => price?.currency_code === "ron") ?? []

      if (expectedVariant.price_ron_minor === null) {
        check(
          ronPrices.length === 0,
          `${expectedVariant.sku}: expected no RON price, found ${ronPrices.length}`,
        )
      } else {
        check(
          ronPrices.length === 1,
          `${expectedVariant.sku}: expected one RON price, found ${ronPrices.length}`,
        )
        check(
          ronPrices[0]?.amount === expectedVariant.price_ron_minor,
          `${expectedVariant.sku}: price ${ronPrices[0]?.amount}, expected ${expectedVariant.price_ron_minor}`,
        )
      }
    }
  }

  // --- Categories ----------------------------------------------------------
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "parent_category_id"],
  })

  const expectedCategoryCount = seed.categories.reduce(
    (count, category) => count + 1 + category.subcategories.length,
    0,
  )
  check(
    categories.length === expectedCategoryCount,
    `expected ${expectedCategoryCount} categories, found ${categories.length}`,
  )

  const categoriesByHandle = new Map(
    categories.map((category) => [category.handle, category]),
  )
  for (const expected of seed.categories) {
    const category = categoriesByHandle.get(expected.handle)
    check(Boolean(category), `missing category ${expected.handle}`)
    check(
      category?.parent_category_id === null,
      `${expected.handle}: expected a top-level category`,
    )

    for (const subcategory of expected.subcategories) {
      const child = categoriesByHandle.get(subcategory.handle)
      check(Boolean(child), `missing subcategory ${subcategory.handle}`)
      check(
        child?.parent_category_id === category?.id,
        `${subcategory.handle}: parent mismatch`,
      )
    }
  }

  // --- Collections ---------------------------------------------------------
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle", "title"],
  })

  check(
    collections.length === seed.collections.length,
    `expected ${seed.collections.length} collections, found ${collections.length}`,
  )
  for (const expected of seed.collections) {
    check(
      collections.some((collection) => collection.handle === expected.handle),
      `missing collection ${expected.handle}`,
    )
  }

  // --- Region and tax ------------------------------------------------------
  const { data: regions } = await query.graph({
    entity: "region",
    fields: [
      "id",
      "name",
      "currency_code",
      "automatic_taxes",
      "countries.iso_2",
      "payment_providers.id",
    ],
  })

  check(regions.length === 1, `expected one region, found ${regions.length}`)
  const region = regions[0]
  check(region?.name === "Romania", `region name is ${region?.name}`)
  check(region?.currency_code === "ron", `region currency is ${region?.currency_code}`)
  check(region?.automatic_taxes === true, "region does not calculate taxes automatically")
  check(
    region?.countries?.some((country) => country?.iso_2 === "ro") ?? false,
    "region does not include Romania",
  )
  check(
    region?.payment_providers?.some((provider) => provider?.id === "pp_system_default") ??
      false,
    "region is missing the system payment provider",
  )

  const { data: pricePreferences } = await query.graph({
    entity: "price_preference",
    fields: ["id", "attribute", "value", "is_tax_inclusive"],
  })
  check(
    pricePreferences.some(
      (preference) =>
        preference.attribute === "region_id" &&
        preference.value === region?.id &&
        preference.is_tax_inclusive === true,
    ),
    "region is not marked tax-inclusive",
  )
  check(
    pricePreferences.some(
      (preference) =>
        preference.attribute === "currency_code" &&
        preference.value === "ron" &&
        preference.is_tax_inclusive === true,
    ),
    "RON currency preference is not tax-inclusive",
  )

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "tax_rates.rate", "tax_rates.is_default", "tax_rates.code"],
  })
  const taxRegion = taxRegions.find((entry) => entry.country_code === "ro")
  check(Boolean(taxRegion), "missing Romanian tax region")
  check(
    taxRegion?.tax_rates?.some(
      (rate) => rate?.is_default === true && rate?.rate === 21,
    ) ?? false,
    "Romanian default tax rate is not 21%",
  )

  // --- Shipping option -----------------------------------------------------
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "price_type",
      "provider_id",
      "price_set_link.price_set.prices.amount",
      "price_set_link.price_set.prices.currency_code",
    ],
  })
  const shippingOption = shippingOptions.find(
    (option) => option.name === "Standard delivery (Romania)",
  )
  check(Boolean(shippingOption), "missing Romania shipping option")
  check(
    shippingOption?.price_type === "flat",
    `shipping option type is ${shippingOption?.price_type}`,
  )
  const shippingPrices = shippingOption?.price_set_link?.price_set?.prices ?? []
  check(
    shippingPrices.some(
      (price) => price?.currency_code === "ron" && price?.amount === 2500,
    ),
    "shipping option is not 2500 RON",
  )

  // --- Inventory -----------------------------------------------------------
  const { data: inventoryLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "stocked_quantity", "inventory_item.sku", "location_id"],
  })

  const levelsBySku = new Map(
    inventoryLevels.map((level) => [level.inventory_item.sku, level]),
  )

  let expectedLevelCount = 0
  for (const product of seed.products) {
    if (product.metadata.forma.availability !== "ready") continue

    for (const variant of product.variants) {
      if (variant.stock === null) continue
      expectedLevelCount += 1

      const level = levelsBySku.get(variant.sku)
      check(Boolean(level), `missing inventory level for ${variant.sku}`)
      check(
        level?.stocked_quantity === variant.stock,
        `${variant.sku}: stocked ${level?.stocked_quantity}, expected ${variant.stock}`,
      )
    }
  }

  check(
    inventoryLevels.length === expectedLevelCount,
    `expected ${expectedLevelCount} inventory levels, found ${inventoryLevels.length}`,
  )

  // --- Store, API key, sales channel --------------------------------------
  const { data: stores } = await query.graph({
    entity: "store",
    fields: [
      "id",
      "name",
      "default_region_id",
      "default_location_id",
      "default_sales_channel_id",
      "supported_currencies.currency_code",
      "supported_currencies.is_default",
      "supported_locales.locale_code",
    ],
  })
  const store = stores[0]
  check(store?.name === "FORMA", `store name is ${store?.name}`)
  check(
    store?.supported_currencies?.length === 1 &&
      store.supported_currencies[0]?.currency_code === "ron" &&
      store.supported_currencies[0]?.is_default === true,
    "store currency is not RON-only/default",
  )
  check(
    store?.supported_locales?.length === 2 &&
      store.supported_locales.some((locale) => locale?.locale_code === "ro") &&
      store.supported_locales.some((locale) => locale?.locale_code === "en"),
    "store locales are not ro + en",
  )
  check(store?.default_region_id === region?.id, "store default region mismatch")
  check(
    store?.default_location_id === inventoryLevels[0]?.location_id,
    "store default location mismatch",
  )

  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type", "sales_channels.id"],
  })
  const publishableKey = apiKeys.find(
    (key) => key.title === "FORMA Storefront" && key.type === "publishable",
  )
  check(Boolean(publishableKey), "missing FORMA publishable API key")
  check(
    publishableKey?.sales_channels?.some(
      (channel) => channel?.id === store?.default_sales_channel_id,
    ) ?? false,
    "publishable API key is not linked to the storefront sales channel",
  )

  if (failures.length) {
    for (const failure of failures) logger.error(`FAIL: ${failure}`)
    throw new Error(`Catalogue verification failed with ${failures.length} issue(s).`)
  }

  logger.info(
    `Catalogue verification passed: ${products.length} products, ${categories.length} categories, ${collections.length} collections, ${inventoryLevels.length} inventory levels, 21% VAT, 25 RON shipping.`,
  )
}
