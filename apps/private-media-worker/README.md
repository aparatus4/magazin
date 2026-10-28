# @forma/private-media-worker

Phase 0 placeholder for FORMA's private media worker.

This package intentionally contains no upload, scanning, or parsing logic yet.
The functional worker is a Phase 3 deliverable and must follow the security
contracts in `PLAN.md` Section 8.7:

- Consume jobs from a dedicated Redis queue.
- Read customer files only from the private quarantine bucket.
- Run image and mesh parsing in an isolated sandbox with no R2, Medusa, Redis,
  database, or application secrets.
- Apply the pinned limits for source photos and STL/OBJ/3MF files.
- Emit only a small, versioned JSON result; never a path or executable artifact.

Do not store customer photographs or uploaded files in this repository.
