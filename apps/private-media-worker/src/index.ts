/**
 * Phase 0 placeholder for the private media worker.
 *
 * The functional worker is a Phase 3 deliverable. It will consume upload jobs
 * from a dedicated Redis queue, read only from the private quarantine bucket,
 * and run untrusted image/mesh parsing in an isolated sandbox with no R2,
 * Medusa, or Redis credentials. Do not add upload handling here until the
 * Phase 3 security contracts in PLAN.md Section 8.7 are implemented.
 */
export const workerScope = {
  phase: 0,
  status: 'placeholder',
} as const
