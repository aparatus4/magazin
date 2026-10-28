import { z } from "zod"

export const QUOTE_STATUSES = [
  "draft",
  "upload_pending",
  "quarantined",
  "processing",
  "review_required",
  "estimated",
  "sent",
  "accepted",
  "converted",
  "expired",
  "cancelled",
  "rejected",
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const CreateQuoteInputSchema = z
  .object({
    process_key: z.string().trim().min(1).max(48),
    material_key: z.string().trim().min(1).max(48),
    finish_key: z.string().trim().min(1).max(48),
    quantity: z.number().int().min(1).max(100),
    infill_percent: z.number().min(0).max(100).optional(),
    layer_height_mm: z.number().positive().max(10).optional(),
    customer_notes: z.string().trim().max(2000).optional(),
  })
  .strict()

export const CreateUploadIntentSchema = z
  .object({
    extension: z.enum(["stl", "obj", "3mf"]),
    byte_size: z.number().int().positive().max(104857600),
    declared_content_type: z.string().trim().max(128).optional(),
    client_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  })
  .strict()

export const UploadHeadersSchema = z
  .object({
    "content-type": z.string().min(1).max(128),
    "if-none-match": z.literal("*"),
    "x-amz-meta-intent": z.string().min(1).max(128),
    "x-amz-checksum-sha256": z.string().optional(),
  })
  .strict()

export const UploadIntentSchema = z
  .object({
    asset_id: z.string().min(1).max(128),
    upload_url: z
      .string()
      .url()
      .refine((value) => value.startsWith("https://")),
    upload_token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    required_headers: UploadHeadersSchema,
    max_bytes: z.number().int().positive().max(104857600),
    expires_at: z.string().datetime(),
  })
  .strict()

export const AcceptQuoteSchema = z
  .object({
    expected_aggregate_version: z.number().int().positive(),
    accepted_spec_revision: z.number().int().positive(),
    snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict()

export const QuotePriceSnapshotSchema = z
  .object({
    schema_version: z.literal(1),
    pricing_version: z.string().min(1).max(64),
    currency_code: z.string().regex(/^[a-z]{3}$/),
    quantity: z.number().int().min(1).max(100),
    volume_cm3: z.number().finite().nonnegative(),
    machine_seconds: z.number().finite().nonnegative(),
    material_rate_minor_per_cm3: z.number().finite().nonnegative(),
    machine_rate_minor_per_second: z.number().finite().nonnegative(),
    unit_minor: z.number().int().positive(),
    total_minor: z.number().int().positive(),
    setup_minor: z.number().int().nonnegative(),
    material_minor: z.number().int().nonnegative(),
    machine_minor: z.number().int().nonnegative(),
    postprocess_minor: z.number().int().nonnegative(),
    minimum_minor: z.number().int().nonnegative(),
    margin_bps: z.number().int().nonnegative().max(100_000),
    rounding: z.literal("ceil_each_component_then_total"),
  })
  .strict()

export { MeshAnalysisResultSchema } from "./mesh-analysis"
export type { MeshAnalysisResult } from "./mesh-analysis"

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>
export type CreateUploadIntentInput = z.infer<typeof CreateUploadIntentSchema>
export type UploadIntent = z.infer<typeof UploadIntentSchema>
export type AcceptQuote = z.infer<typeof AcceptQuoteSchema>
export type QuotePriceSnapshot = z.infer<typeof QuotePriceSnapshotSchema>
