# FORMA workspace — agent instructions

This repository is migrating the existing Vite concept storefront to a **Medusa v2 + Next.js** production storefront.

**Before doing any work, read [`PLAN.md`](./PLAN.md) — it is the single source of truth.**

1. Read Section 0 (current focus and resume protocol).
2. Check `git status` and the current phase in Section 9.
3. Pick the next unchecked task, or confirm the blocking decision if one is listed.
4. Verify with the current build/test commands.
5. Update `PLAN.md` before ending the session: current focus, phase status, checkboxes, decision log, and next action.

Important:

- Preserve the current Vite app until the replacement reaches parity. After Phase 0 it may live in `legacy/` and also in git history.
- Write JSON/config files as **UTF-8 without BOM**. A BOM has crashed Vite before.
- Never commit secrets, API keys, customer photographs, or uploaded customer files.
- The portrait head scan is CC BY 3.0; keep its attribution.
- Keep the existing premium visual language unless a redesign is explicitly approved.
- Do not invent reviews, product counts, scarcity, or instant-quote capabilities.
