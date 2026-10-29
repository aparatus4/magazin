import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { isPlaceholderValue } from "../lib/env"

const failures: string[] = []

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message)
}

const requiredEnv = [
  "R2_PUBLIC_ENDPOINT",
  "R2_PUBLIC_BUCKET",
  "R2_PUBLIC_ACCESS_KEY_ID",
  "R2_PUBLIC_SECRET_ACCESS_KEY",
  "R2_PUBLIC_URL",
] as const

async function fetchText(url: string): Promise<{ status: number; body: string }> {
  const response = await fetch(url)
  return { status: response.status, body: await response.text() }
}

/**
 * Verifies the public catalogue file provider against the configured
 * S3-compatible bucket (Cloudflare R2 in production, Backblaze B2 for
 * temporary testing).
 *
 * It uploads a small text object, checks the returned URL, reads it back
 * through the provider, downloads it through a presigned URL, optionally
 * checks the unauthenticated public URL, and deletes the object again. Set
 * `SKIP_PUBLIC_CHECK=true` for a private test bucket; upload, presigning, and
 * deletion are still verified.
 */
export default async function verifyFiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const missing = requiredEnv.filter(
    (key) => !process.env[key] || isPlaceholderValue(process.env[key]),
  )

  if (missing.length > 0) {
    throw new Error(
      `File provider verification requires real values for: ${missing.join(", ")}.`,
    )
  }

  const skipPublicCheck = process.env.SKIP_PUBLIC_CHECK === "true"
  const fileService = container.resolve(Modules.FILE)
  const provider = fileService.getProvider()
  const marker = `forma-file-verification-${Date.now()}`
  const content = `${marker}\n`
  const filename = `verification/${marker}.txt`
  const baseUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")

  let fileId: string | undefined

  try {
    const file = await fileService.createFiles({
      filename,
      mimeType: "text/plain",
      content: Buffer.from(content).toString("base64"),
      access: "public",
    })

    fileId = file.id

    check(
      file.url.startsWith(`${baseUrl}/`),
      `uploaded file URL does not start with R2_PUBLIC_URL: ${file.url}`,
    )

    const buffer = await fileService.getAsBuffer(file.id)
    check(
      buffer.toString("utf8") === content,
      "getAsBuffer did not return the uploaded content",
    )

    const presignedUrl = await provider.getPresignedDownloadUrl({
      fileKey: file.id,
    })
    const presigned = await fetchText(presignedUrl)
    check(
      presigned.status === 200,
      `presigned download returned HTTP ${presigned.status}`,
    )
    check(
      presigned.body === content,
      "presigned download content does not match the uploaded content",
    )

    if (skipPublicCheck) {
      logger.info("Public URL check skipped (SKIP_PUBLIC_CHECK=true).")
    } else {
      const publicFile = await fetchText(file.url)
      check(
        publicFile.status === 200,
        `public URL returned HTTP ${publicFile.status}; set SKIP_PUBLIC_CHECK=true for a private test bucket`,
      )
      check(
        publicFile.body === content,
        "public URL content does not match the uploaded content",
      )
    }

    await fileService.deleteFiles(file.id)
    fileId = undefined

    if (!skipPublicCheck) {
      const deleted = await fetchText(file.url)
      check(
        deleted.status === 404,
        `deleted public URL returned HTTP ${deleted.status} instead of 404`,
      )
    }
  } finally {
    if (fileId) {
      try {
        await fileService.deleteFiles(fileId)
      } catch {
        logger.warn(`Could not delete verification file ${fileId}.`)
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) logger.error(`FAIL: ${failure}`)
    throw new Error(`File provider verification failed with ${failures.length} issue(s).`)
  }

  logger.info(
    `File provider verification passed: upload, provider read, presigned download, deletion${
      skipPublicCheck ? " (public URL skipped)" : ", public URL"
    }.`,
  )
}
