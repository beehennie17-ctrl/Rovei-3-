# Rovei Backend Phase 4 — Secure Client Experiences

Phase 4 replaces browser-only prototype client links with secure server-issued client experience links.

## Security model

A production client link contains a cryptographically random opaque token.

Example shape:

`/client/rvc_<random-secret>`

The token contains:

- no client name
- no email
- no phone number
- no appointment data
- no Studio ID
- no database ID

The URL therefore contains no client PII.

## Token generation

Rovei generates 32 cryptographically secure random bytes on the server.

The bytes are encoded with URL-safe Base64 and prefixed with `rvc_`.

This produces approximately 256 bits of randomness.

## Token storage

The raw token is never persisted.

Before database storage, the server computes:

`SHA-256(raw token)`

Only the 64-character hexadecimal digest is stored in `client_experiences.token_hash`.

The authenticated Studio user receives the raw token once when the link is issued.

## Verification

When a client opens a public link:

1. Rovei validates the token format.
2. The server hashes the presented token.
3. The server looks up the hash.
4. The experience must exist.
5. The link must not be revoked.
6. The link must not be expired.
7. Only the minimum client-facing experience data is returned.

## Expiry

Secure links receive an explicit expiry.

The initial policy is:

- at least 7 days from issuance
- or 7 days after the appointment
- whichever is later

This keeps future appointment links usable while avoiding permanently valid client secrets.

## Revocation and rotation

A Studio can revoke a link by setting `token_revoked_at`.

Reissuing a link replaces the stored token hash with a new hash.

Because only the new hash remains valid, the previous raw token immediately stops resolving.

## RLS

No anonymous RLS policies are added for secure client experiences.

Public token verification will happen only through server-side API routes using the server secret client.

The public browser does not receive privileged database credentials.

## Photos

Private photo storage is handled separately within Phase 4.

Photo objects will not be public URLs.

Rovei will use:

- private storage
- file type and size validation
- Studio/client-experience ownership checks
- short-lived signed access
- sanitized metadata

The current IndexedDB photo implementation remains prototype-only until that storage layer is connected.

## Authenticated link issuance

`POST /api/client-links`

The authenticated Studio user supplies an appointment ID.

The server:

1. derives the Studio from the authenticated user
2. verifies the appointment belongs to that Studio
3. snapshots the configured client-experience modules
4. creates a 256-bit random client secret
5. hashes that secret with SHA-256
6. stores only the hash
7. marks appointment readiness as `waiting`
8. returns the raw secret once

Issuing another link for the same unfinished appointment rotates the secret.

Because the database stores only the new hash, the previous URL stops resolving immediately.

## Revocation

`DELETE /api/client-links/[clientExperienceId]`

Revocation records `token_revoked_at`.

An unfinished appointment returns to `draft` readiness when its secure link is revoked.

## Public lookup

`GET /api/public/client-experience/[token]`

The public route:

- validates the opaque token format
- hashes the token server-side
- uses the server-only Supabase secret client
- rejects missing, revoked, expired, or cancelled experiences
- returns only the minimum client-facing Studio, client, appointment, theme, module, and response data

Invalid and unavailable links use the same public-facing 404 response.

## Public progress

`PUT /api/public/client-experience/[token]`

Client progress is persisted by module in `client_experience_responses`.

The server verifies that submitted modules are actually enabled for that specific experience.

The experience moves to `started` when progress is saved.

## Public submission

`POST /api/public/client-experience/[token]/submit`

Before completion, the server independently checks that every enabled module is complete.

Successful submission:

- marks the client experience `completed`
- records the completion timestamp
- moves the appointment readiness status to `ready`

The browser cannot declare an appointment ready by itself.

## Response security

Public client-experience API responses are explicitly non-cacheable and use a no-referrer policy.

The raw token is never returned by public lookup APIs.

## Frontend secure-link handoff

After cloud Add Client creates the client and appointment, Rovei stores only the new client/appointment IDs in browser session storage.

The secure raw link token is retained only in browser session storage after issuance so the professional can copy or share it.

It is not persisted in the database.

## Public client experience UI

`/client/[token]` now supports two modes:

Prototype tokens:
- browser session prototype
- IndexedDB photos
- existing frontend preview behavior

Secure production tokens:
- server-verified token hash lookup
- cloud-persisted responses
- real appointment readiness
- private photo storage

## Private photos

Secure client photos use the private `client-experience-photos` Supabase Storage bucket.

The browser never receives public bucket access.

Uploads:

1. require a valid active client-experience token
2. accept JPEG, PNG, or WebP source files
3. enforce the 10 MB source limit
4. re-encode server-side as WebP
5. strip source image metadata during re-encoding
6. cap dimensions at 2400 × 2400
7. store an opaque object path with no client PII
8. record ownership in `file_assets`

Photo previews use short-lived signed URLs.

Photo IDs submitted in client-experience responses are independently verified to belong to that exact client experience.

## Deployment note

The server upload route accepts source images up to 10 MB.

The final hosting platform must be configured with a request-body limit compatible with this policy. If the selected platform imposes a smaller hard limit, Rovei should switch the upload transport to signed direct uploads while preserving the same private-storage and ownership model.
