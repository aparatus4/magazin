import { z } from "zod"

const finite = z.number().finite()
const mm = finite.nonnegative().max(200_000)

const Base = z.object({
  schema_version: z.literal(1),
  job_id: z.string().uuid(),
  asset_id: z.string().min(1).max(128),
  spec_revision: z.number().int().positive(),
  input_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  parser_version: z.string().regex(/^\d+\.\d+\.\d+$/),
})

const Ok = Base.extend({
  result: z.enum(["valid", "review_required"]),
  unit: z.enum(["mm", "inch", "unknown"]),
  bounds_mm: z
    .object({ x: mm, y: mm, z: mm })
    .strict()
    .refine((bounds) => Math.max(bounds.x, bounds.y, bounds.z) > 0, "degenerate bounds"),
  volume_mm3: finite.nonnegative().max(1e12),
  vertex_count: z.number().int().nonnegative().max(2_000_000),
  triangle_count: z.number().int().nonnegative().max(2_000_000),
  component_count: z.number().int().nonnegative().max(10_000),
  watertight: z.boolean(),
  manifold: z.boolean(),
  reasons: z
    .array(
      z.enum([
        "unknown_unit",
        "non_manifold",
        "open_shell",
        "multi_shell",
        "volume_ratio_low",
        "volume_ratio_high",
        "near_build_limit",
      ]),
    )
    .max(8),
}).strict()

const Bad = Base.extend({
  result: z.literal("rejected"),
  reason: z.enum([
    "E_SIZE",
    "E_MAGIC",
    "E_ARCHIVE",
    "E_BOMB",
    "E_XML",
    "E_REF",
    "E_COMPLEXITY",
    "E_GEOMETRY",
    "E_TIMEOUT",
    "E_RESULT",
  ]),
}).strict()

export const MeshAnalysisResultSchema = z.discriminatedUnion("result", [Ok, Bad])

export type MeshAnalysisResult = z.infer<typeof MeshAnalysisResultSchema>
