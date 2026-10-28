import { z } from "zod"

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"))

export const ProductMetaV1Schema = z
  .object({
    schema_version: z.literal(1),
    availability: z.enum(["ready", "made_to_order", "custom"]),
    processes: z.array(z.enum(["FDM", "SLA", "SLS", "MJF"])).max(4),
    lead_time_days: z.number().int().nonnegative(),
    lead_time_label: z.string().trim().min(1).max(80).optional(),
    materials: z.array(z.string().trim().min(1).max(48)).max(16),
    finishes: z.array(z.string().trim().min(1).max(48)).max(16),
    dimensions: z
      .object({
        width: z.number().positive(),
        height: z.number().positive(),
        depth: z.number().positive(),
        unit: z.enum(["mm", "cm"]),
      })
      .strict(),
    weight_grams: z.number().int().positive(),
    care: z.string().max(500).optional(),
    edition: z.string().max(100).optional(),
    designer_note: z.string().max(1000).optional(),
    glb_url: httpsUrl.optional(),
    poster_url: httpsUrl.optional(),
    seo: z
      .object({
        title: z.string().trim().min(1).max(70).optional(),
        description: z.string().trim().min(1).max(160).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

export type ProductMetaV1 = z.infer<typeof ProductMetaV1Schema>
