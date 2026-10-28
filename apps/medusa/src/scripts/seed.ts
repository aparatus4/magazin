import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

import catalogData from "../data/catalog.json"
import categoriesData from "../data/categories.json"
import collectionsData from "../data/collections.json"
import { validateSeedData } from "../data/schema"

/**
 * FORMA seed data.
 *
 * Idempotent: every entity is looked up by a stable natural key before it is
 * created, so the script can be re-run after a partial failure. Prices are
 * provisional development values (see the "Product price migration to RON"
 * decision in PLAN.md) and must be replaced before launch.
 */

const STORE_NAME = "FORMA"
const SALES_CHANNEL_NAME = "FORMA Storefront"
const REGION_NAME = "Romania"
const CURRENCY_CODE = "ron"
const VAT_RATE = 21
const VAT_CODE = "RO-VAT-21"
const VAT_NAME = "Romanian standard VAT"
const STOCK_LOCATION_NAME = "FORMA Studio"
const FULFILLMENT_SET_NAME = "FORMA Romania delivery"
const SHIPPING_PROFILE_NAME = "FORMA default shipping profile"
const SHIPPING_OPTION_NAME = "Standard delivery (Romania)"
const SHIPPING_AMOUNT = 2500
const PUBLISHABLE_KEY_TITLE = "FORMA Storefront"
const ASSET_BASE_URL = (process.env.PUBLIC_ASSET_BASE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
)

const assetUrl = (path: string) => `${ASSET_BASE_URL}${path}`

export default async function seedFormaData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const storeService = container.resolve(Modules.STORE)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const regionService = container.resolve(Modules.REGION)
  const taxService = container.resolve(Modules.TAX)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const productService = container.resolve(Modules.PRODUCT)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const paymentService = container.resolve(Modules.PAYMENT)
  const pricingService = container.resolve(Modules.PRICING)

  const seed = validateSeedData({
    categories: categoriesData,
    collections: collectionsData,
    products: catalogData,
  })

  logger.info("FORMA seed: validated catalogue data.")

  const [store] = await storeService.listStores()
  if (!store) {
    throw new Error("No Medusa store found. Run `medusa db:migrate` before seeding.")
  }

  // --- Sales channel -------------------------------------------------------
  let [salesChannel] = await salesChannelService.listSalesChannels({
    name: SALES_CHANNEL_NAME,
  })

  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: SALES_CHANNEL_NAME,
            description: "FORMA storefront (Romania)",
          },
        ],
      },
    })
    salesChannel = result[0]
    logger.info(`FORMA seed: created sales channel ${salesChannel.id}.`)
  }

  // --- Region --------------------------------------------------------------
  const paymentProviders = await paymentService.listPaymentProviders({})
  const providerIds = paymentProviders
    .map((provider) => provider.id)
    .filter((id) => id === "pp_system_default" || id.startsWith("pp_stripe_"))

  if (!providerIds.includes("pp_system_default")) {
    throw new Error("The Medusa system payment provider is not registered.")
  }

  let [region] = await regionService.listRegions({ name: REGION_NAME })

  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: CURRENCY_CODE,
            countries: ["ro"],
            payment_providers: providerIds,
            is_tax_inclusive: true,
            automatic_taxes: true,
          },
        ],
      },
    })
    region = result[0]
    logger.info(`FORMA seed: created region ${region.id} (${providerIds.join(", ")}).`)
  } else {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: providerIds,
          is_tax_inclusive: true,
          automatic_taxes: true,
        },
      },
    })
  }

  // --- Tax region ----------------------------------------------------------
  let [taxRegion] = await taxService.listTaxRegions({ country_code: "ro" })

  if (!taxRegion) {
    const { result } = await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "ro",
          provider_id: "tp_system",
          default_tax_rate: {
            rate: VAT_RATE,
            code: VAT_CODE,
            name: VAT_NAME,
          },
        },
      ],
    })
    taxRegion = result[0]
    logger.info(`FORMA seed: created Romanian tax region at ${VAT_RATE}% (provisional).`)
  }

  // --- Tax-inclusive currency preference -----------------------------------
  // Adding a currency to the store auto-creates a currency preference with
  // `is_tax_inclusive: false`. Currency-level product prices use that
  // preference (the region preference only wins for region-priced records),
  // so the RON preference must be flipped for VAT-inclusive display.
  const currencyPreferences = await pricingService.listPricePreferences({
    attribute: "currency_code",
    value: CURRENCY_CODE,
  })

  if (currencyPreferences.length) {
    await pricingService.updatePricePreferences(
      { attribute: "currency_code", value: CURRENCY_CODE },
      { is_tax_inclusive: true },
    )
  } else {
    await pricingService.createPricePreferences({
      attribute: "currency_code",
      value: CURRENCY_CODE,
      is_tax_inclusive: true,
    })
  }

  logger.info(`FORMA seed: ${CURRENCY_CODE.toUpperCase()} prices are tax-inclusive.`)

  // --- Stock location ------------------------------------------------------
  let [stockLocation] = await stockLocationService.listStockLocations({
    name: STOCK_LOCATION_NAME,
  })

  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              address_1: "",
              city: "Bucharest",
              country_code: "RO",
            },
          },
        ],
      },
    })
    stockLocation = result[0]
    logger.info(`FORMA seed: created stock location ${stockLocation.id}.`)
  }

  // --- Fulfillment ---------------------------------------------------------
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  let [fulfillmentSet] = await fulfillmentService.listFulfillmentSets(
    { name: FULFILLMENT_SET_NAME },
    { relations: ["service_zones"] },
  )

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: "Romania",
          geo_zones: [{ country_code: "ro", type: "country" }],
        },
      ],
    })
    logger.info(`FORMA seed: created fulfillment set ${fulfillmentSet.id}.`)
  }

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  const serviceZone = fulfillmentSet.service_zones?.[0]
  if (!serviceZone) {
    throw new Error(`Fulfillment set ${fulfillmentSet.id} has no service zone.`)
  }

  let [shippingProfile] = await fulfillmentService.listShippingProfiles({
    type: "default",
  })

  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: SHIPPING_PROFILE_NAME, type: "default" }],
      },
    })
    shippingProfile = result[0]
  }

  const [existingShippingOption] = await fulfillmentService.listShippingOptions({
    name: SHIPPING_OPTION_NAME,
  })

  if (!existingShippingOption) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: SHIPPING_OPTION_NAME,
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZone.id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Tracked delivery within Romania (provisional rate).",
            code: "standard-ro",
          },
          prices: [{ region_id: region.id, amount: SHIPPING_AMOUNT }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    logger.info("FORMA seed: created provisional 25 RON Romania shipping option.")
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [salesChannel.id],
    },
  })

  // --- Publishable API key -------------------------------------------------
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type"],
    filters: { type: "publishable" },
  })

  let publishableApiKeyId: string | undefined = apiKeys.find(
    (key) => key.title === PUBLISHABLE_KEY_TITLE,
  )?.id

  if (!publishableApiKeyId) {
    const {
      result: [createdKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: PUBLISHABLE_KEY_TITLE,
            type: "publishable",
            created_by: "seed",
          },
        ],
      },
    })
    publishableApiKeyId = createdKey.id
    logger.info(`FORMA seed: created publishable API key ${publishableApiKeyId}.`)
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKeyId,
      add: [salesChannel.id],
    },
  })

  // --- Categories ----------------------------------------------------------
  const allCategoryHandles = seed.categories.flatMap((category) => [
    category.handle,
    ...category.subcategories.map((subcategory) => subcategory.handle),
  ])

  const existingCategories = await productService.listProductCategories(
    { handle: allCategoryHandles },
    { select: ["id", "handle"] },
  )
  const categoryIds = new Map<string, string>(
    existingCategories.map((category) => [category.handle, category.id]),
  )

  const topLevelToCreate = seed.categories
    .filter((category) => !categoryIds.has(category.handle))
    .map((category) => ({
      name: category.name,
      handle: category.handle,
      description: category.description,
      is_active: true,
      is_internal: false,
      rank: category.rank,
    }))

  if (topLevelToCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: topLevelToCreate },
    })
    for (const category of result) {
      categoryIds.set(category.handle, category.id)
    }
    logger.info(`FORMA seed: created ${result.length} top-level categories.`)
  }

  const subcategoriesToCreate = seed.categories.flatMap((category) => {
    const parentId = categoryIds.get(category.handle)
    if (!parentId) {
      throw new Error(`Missing parent category for ${category.handle}.`)
    }

    return category.subcategories
      .filter((subcategory) => !categoryIds.has(subcategory.handle))
      .map((subcategory, index) => ({
        name: subcategory.name,
        handle: subcategory.handle,
        description: subcategory.note,
        is_active: true,
        is_internal: false,
        rank: index,
        parent_category_id: parentId,
      }))
  })

  if (subcategoriesToCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: subcategoriesToCreate },
    })
    for (const category of result) {
      categoryIds.set(category.handle, category.id)
    }
    logger.info(`FORMA seed: created ${result.length} subcategories.`)
  }

  // --- Collections ---------------------------------------------------------
  const existingCollections = await productService.listProductCollections(
    { handle: seed.collections.map((collection) => collection.handle) },
    { select: ["id", "handle"] },
  )
  const collectionIds = new Map<string, string>(
    existingCollections.map((collection) => [collection.handle, collection.id]),
  )

  const collectionsToCreate = seed.collections
    .filter((collection) => !collectionIds.has(collection.handle))
    .map((collection) => ({
      title: collection.title,
      handle: collection.handle,
      metadata: { description: collection.description },
    }))

  if (collectionsToCreate.length) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: collectionsToCreate },
    })
    for (const collection of result) {
      collectionIds.set(collection.handle, collection.id)
    }
    logger.info(`FORMA seed: created ${result.length} collections.`)
  }

  // --- Products ------------------------------------------------------------
  const existingProducts = await productService.listProducts(
    { handle: seed.products.map((product) => product.handle) },
    { select: ["id", "handle"] },
  )
  const existingProductHandles = new Set(
    existingProducts.map((product) => product.handle),
  )

  const productsToCreate = seed.products
    .filter((product) => !existingProductHandles.has(product.handle))
    .map((product) => {
      const categoryId = categoryIds.get(product.category_handle)
      if (!categoryId) {
        throw new Error(`Missing category ${product.category_handle} for ${product.handle}.`)
      }

      const collectionId = product.collection_handles[0]
        ? collectionIds.get(product.collection_handles[0])
        : undefined

      const managesInventory = product.metadata.forma.availability === "ready"

      return {
        title: product.title,
        subtitle: product.subtitle ?? null,
        description: product.description,
        handle: product.handle,
        status: ProductStatus.PUBLISHED,
        thumbnail: assetUrl(product.thumbnail_path),
        images: product.images.map((image, index) => ({
          url: assetUrl(image.path),
          metadata: { alt: image.alt, rank: index },
        })),
        options: product.options,
        variants: product.variants.map((variant) => ({
          title: variant.title,
          sku: variant.sku,
          options: variant.options,
          manage_inventory: managesInventory,
          allow_backorder: false,
          weight: variant.weight_grams,
          ...(variant.price_ron_minor === null
            ? {}
            : {
                prices: [
                  {
                    amount: variant.price_ron_minor,
                    currency_code: CURRENCY_CODE,
                  },
                ],
              }),
        })),
        category_ids: [categoryId],
        ...(collectionId ? { collection_id: collectionId } : {}),
        sales_channels: [{ id: salesChannel.id }],
        shipping_profile_id: shippingProfile.id,
        metadata: product.metadata,
      }
    })

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({
      input: { products: productsToCreate },
    })
    logger.info(`FORMA seed: created ${productsToCreate.length} products.`)
  } else {
    logger.info("FORMA seed: all products already exist.")
  }

  // --- Inventory levels ----------------------------------------------------
  const stockBySku = new Map<string, number>()
  for (const product of seed.products) {
    if (product.metadata.forma.availability !== "ready") continue

    for (const variant of product.variants) {
      if (variant.stock !== null) {
        stockBySku.set(variant.sku, variant.stock)
      }
    }
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  })

  const existingLevels = await inventoryService.listInventoryLevels({
    location_id: stockLocation.id,
  })
  const stockedItemIds = new Set(
    existingLevels.map((level) => level.inventory_item_id),
  )

  const levelsToCreate = inventoryItems.flatMap((item) => {
    if (!item.sku || !stockBySku.has(item.sku) || stockedItemIds.has(item.id)) {
      return []
    }

    return [
      {
        inventory_item_id: item.id,
        location_id: stockLocation.id,
        stocked_quantity: stockBySku.get(item.sku)!,
      },
    ]
  })

  if (levelsToCreate.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: levelsToCreate },
    })
    logger.info(`FORMA seed: created ${levelsToCreate.length} inventory levels.`)
  }

  // --- Store defaults ------------------------------------------------------
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: STORE_NAME,
        supported_currencies: [
          {
            currency_code: CURRENCY_CODE,
            is_default: true,
            is_tax_inclusive: true,
          },
        ],
        supported_locales: [{ locale_code: "ro" }, { locale_code: "en" }],
        default_sales_channel_id: salesChannel.id,
        default_region_id: region.id,
        default_location_id: stockLocation.id,
      },
    },
  })

  logger.info("FORMA seed: complete.")
}
