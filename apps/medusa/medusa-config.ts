import { defineConfig, loadEnv } from "@medusajs/framework/utils"

import {
  assertRuntimeEnv,
  isMedusaBuildCommand,
  readRuntimeEnv,
} from "./src/lib/env"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const env = readRuntimeEnv()

// `medusa build` must run without runtime secrets (CI uses dummy values).
// Every other command validates the environment before boot.
if (!isMedusaBuildCommand()) {
  assertRuntimeEnv(env)
}

const modules: Array<Record<string, unknown>> = []

if (env.REDIS_URL) {
  modules.push({
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: {
        redisUrl: env.REDIS_URL,
      },
    },
  })
}

if (env.STRIPE_API_KEY && env.STRIPE_WEBHOOK_SECRET) {
  modules.push({
    resolve: "@medusajs/medusa/payment-stripe",
    options: {
      apiKey: env.STRIPE_API_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      capture: true,
    },
  })
}

if (
  env.R2_PUBLIC_ENDPOINT &&
  env.R2_PUBLIC_BUCKET &&
  env.R2_PUBLIC_ACCESS_KEY_ID &&
  env.R2_PUBLIC_SECRET_ACCESS_KEY &&
  env.R2_PUBLIC_URL
) {
  modules.push({
    resolve: "@medusajs/medusa/file-s3",
    options: {
      file_url: env.R2_PUBLIC_URL,
      access_key_id: env.R2_PUBLIC_ACCESS_KEY_ID,
      secret_access_key: env.R2_PUBLIC_SECRET_ACCESS_KEY,
      region: "auto",
      bucket: env.R2_PUBLIC_BUCKET,
      endpoint: env.R2_PUBLIC_ENDPOINT,
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.DATABASE_URL,
    http: {
      storeCors: env.STORE_CORS ?? "",
      adminCors: env.ADMIN_CORS ?? "",
      authCors: env.AUTH_CORS ?? "",
      jwtSecret: env.JWT_SECRET ?? "",
      cookieSecret: env.COOKIE_SECRET ?? "",
    },
  },
  admin: {
    path: (env.ADMIN_PATH ?? "/app") as `/${string}`,
    backendUrl: env.ADMIN_BACKEND_URL,
  },
  modules,
})
