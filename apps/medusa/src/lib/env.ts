import { z } from "zod"

const PLACEHOLDER_PATTERN =
  /(replace[_-]?me|replace[_-]?with|changeme|supersecret|example\.(com|org|net))/i

export function isPlaceholderValue(value: string | undefined): boolean {
  return typeof value === "string" && PLACEHOLDER_PATTERN.test(value)
}

const isOrigin = (value: string) => {
  if (!value || value === "*" || value === "null") return false

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return false
    if (url.pathname !== "/" || url.search || url.hash) return false
    return url.origin === value.replace(/\/$/, "")
  } catch {
    return false
  }
}

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value

const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional())
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().url().optional())
const secret = z.preprocess(emptyToUndefined, z.string().trim().min(32).optional())

const corsList = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) => value.split(",").every((origin) => isOrigin(origin.trim())),
      "must be a comma-separated list of exact http(s) origins (no wildcards, paths, or null)",
    )
    .optional(),
)

export const RuntimeEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: optionalString,
    REDIS_URL: optionalString,

    JWT_SECRET: secret,
    COOKIE_SECRET: secret,

    STORE_CORS: corsList,
    ADMIN_CORS: corsList,
    AUTH_CORS: corsList,

    ADMIN_PATH: z.string().trim().startsWith("/").optional(),
    ADMIN_BACKEND_URL: optionalUrl,

    // Public origin for catalogue renders used by the seed script.
    PUBLIC_ASSET_BASE_URL: optionalUrl,

    STRIPE_API_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,

    R2_PUBLIC_ENDPOINT: optionalUrl,
    R2_PUBLIC_BUCKET: optionalString,
    R2_PUBLIC_ACCESS_KEY_ID: optionalString,
    R2_PUBLIC_SECRET_ACCESS_KEY: optionalString,
    R2_PUBLIC_URL: optionalUrl,

    R2_PRIVATE_ENDPOINT: optionalUrl,
    R2_PRIVATE_REGION: optionalString,
    R2_UPLOAD_STAGING_BUCKET: optionalString,
    R2_UPLOAD_STAGING_ACCESS_KEY_ID: optionalString,
    R2_UPLOAD_STAGING_SECRET_ACCESS_KEY: optionalString,
    R2_UPLOAD_QUARANTINE_BUCKET: optionalString,
    R2_UPLOAD_QUARANTINE_ACCESS_KEY_ID: optionalString,
    R2_UPLOAD_QUARANTINE_SECRET_ACCESS_KEY: optionalString,
    R2_WORKER_ACCESS_KEY_ID: optionalString,
    R2_WORKER_SECRET_ACCESS_KEY: optionalString,
    R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID: optionalString,
    R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY: optionalString,
    UPLOAD_INTENT_SECRET: secret,

    RESEND_API_KEY: optionalString,
    RESEND_FROM: optionalString,
  })
  .passthrough()

export type RuntimeEnv = z.infer<typeof RuntimeEnvSchema>

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EnvValidationError"
  }
}

export function readRuntimeEnv(source: NodeJS.ProcessEnv = process.env): RuntimeEnv {
  const parsed = RuntimeEnvSchema.safeParse(source)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n")

    throw new EnvValidationError(`Invalid Medusa environment:\n${details}`)
  }

  return parsed.data
}

const CORE_REQUIRED = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "COOKIE_SECRET",
  "STORE_CORS",
  "ADMIN_CORS",
  "AUTH_CORS",
] as const

const PRODUCTION_REQUIRED = [
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "R2_PUBLIC_ENDPOINT",
  "R2_PUBLIC_BUCKET",
  "R2_PUBLIC_ACCESS_KEY_ID",
  "R2_PUBLIC_SECRET_ACCESS_KEY",
  "R2_PUBLIC_URL",
  "RESEND_API_KEY",
  "RESEND_FROM",
] as const

/**
 * Validates the variables Medusa needs to boot. Called from medusa-config.ts
 * for every command except `medusa build`, which must work without runtime
 * secrets (CI builds with dummy values).
 */
export function assertRuntimeEnv(env: RuntimeEnv, isProduction = env.NODE_ENV === "production") {
  const missing: string[] = []

  for (const key of CORE_REQUIRED) {
    if (!env[key]) missing.push(key)
  }

  if (isProduction) {
    for (const key of PRODUCTION_REQUIRED) {
      if (!env[key]) missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required Medusa environment variables: ${[...new Set(missing)].join(", ")}`,
    )
  }

  if (isProduction) {
    const placeholders = Object.entries(env)
      .filter(([, value]) => typeof value === "string" && PLACEHOLDER_PATTERN.test(value))
      .map(([key]) => key)

    if (placeholders.length > 0) {
      throw new EnvValidationError(
        `Placeholder values are not allowed in production: ${[...new Set(placeholders)].join(", ")}`,
      )
    }

    for (const key of ["STORE_CORS", "ADMIN_CORS", "AUTH_CORS"] as const) {
      const value = env[key]
      if (!value) continue

      for (const origin of value.split(",")) {
        if (!origin.trim().startsWith("https://")) {
          throw new EnvValidationError(`${key} must contain HTTPS origins in production`)
        }
      }
    }
  }
}

export function isMedusaBuildCommand(argv: string[] = process.argv): boolean {
  return argv.includes("build")
}
