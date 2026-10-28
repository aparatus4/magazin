import { z } from "zod"

export const COMMISSION_STATUSES = [
  "brief_received",
  "review",
  "quote_sent",
  "deposit_pending",
  "sculpting",
  "proof_sent",
  "changes_requested",
  "approved",
  "printing",
  "finishing",
  "balance_pending",
  "shipped",
  "cancelled",
] as const

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number]

export const CreateCommissionInputSchema = z
  .object({
    subject_type: z.string().trim().min(1).max(40),
    style_key: z.string().trim().min(1).max(48),
    size_key: z.string().trim().min(1).max(48),
    finish_key: z.string().trim().min(1).max(48),
    plinth_key: z.string().trim().min(1).max(48).optional(),
    gift_note: z.string().trim().max(500).optional(),
    requested_deadline: z.string().datetime().optional(),
    source_photo_consent: z
      .object({
        accepted: z.literal(true),
        consent_version: z.string().trim().min(1).max(32),
      })
      .strict(),
  })
  .strict()

export const ApproveProofSchema = z
  .object({
    expected_aggregate_version: z.number().int().positive(),
    proof_revision: z.number().int().positive(),
  })
  .strict()

export const RequestProofChangesSchema = z
  .object({
    expected_aggregate_version: z.number().int().positive(),
    proof_revision: z.number().int().positive(),
    message: z.string().trim().min(1).max(1000),
  })
  .strict()

export const CommissionPriceSnapshotSchema = z
  .object({
    schema_version: z.literal(1),
    pricing_version: z.string().min(1).max(64),
    currency_code: z.string().regex(/^[a-z]{3}$/),
    total_minor: z.number().int().positive(),
    deposit_minor: z.number().int().nonnegative(),
    balance_minor: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.deposit_minor + value.balance_minor !== value.total_minor) {
      ctx.addIssue({
        code: "custom",
        path: ["balance_minor"],
        message: "deposit plus balance must equal total",
      })
    }
  })

export const CommissionChargeSnapshotSchema = z
  .object({
    schema_version: z.literal(1),
    commission_id: z.string().min(1).max(128),
    purpose: z.enum(["deposit", "balance"]),
    amount_minor: z.number().int().positive(),
    currency_code: z.string().regex(/^[a-z]{3}$/),
    pricing_version: z.string().min(1).max(64),
    commission_snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    commission_aggregate_version_at_creation: z.number().int().positive(),
  })
  .strict()

export const SetCommissionPriceSchema = z
  .object({
    expected_aggregate_version: z.number().int().positive(),
    snapshot: CommissionPriceSnapshotSchema,
  })
  .strict()

export type CreateCommissionInput = z.infer<typeof CreateCommissionInputSchema>
export type ApproveProofInput = z.infer<typeof ApproveProofSchema>
export type RequestProofChangesInput = z.infer<typeof RequestProofChangesSchema>
export type CommissionPriceSnapshot = z.infer<typeof CommissionPriceSnapshotSchema>
export type CommissionChargeSnapshot = z.infer<typeof CommissionChargeSnapshotSchema>
export type SetCommissionPriceInput = z.infer<typeof SetCommissionPriceSchema>
