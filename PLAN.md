# Rovei Mission 2 — private manual backup and recovery

Status: plan and helper prepared; **no database export or restore has run here**. No hosted migration or hosted data write is authorized by this kit. The connected project is `Rovei-3-`, `errzsgncbygxwwmwndha`, PostgreSQL 17. The owner confirmed the Codespace uses that reference and the Free plan has no scheduled backup/PITR.

## One Codespaces procedure

1. Download this kit to your computer, then upload it to your Codespace at `/tmp/ROVEI-MISSION2-RECOVERY-KIT.zip`, outside the repository. Review this file and `rovei_recovery.py`. Keep every Codespaces forwarded port **Private**. Use your existing database password; do not reset it or paste it into chat. In Supabase's **Connect** panel choose the **Session pooler on port 5432** (normally works with Codespaces IPv4), or the direct connection if IPv6 works. The URL password must be percent-encoded; transaction pooler port 6543 is rejected.

2. Prerequisites: an official stable Supabase CLI, a running Docker daemon, PostgreSQL **17** `psql`, Python 3.10+, Git and GnuPG. The helper does not install packages or change the application. If anything is missing, stop and install it using the official instructions linked below. It discovers CLI help and records its version privately; a local restore can fail when the hosted Auth/Storage versions are newer than the local stack. Never remove records or ignore errors to make it pass.

3. Coordinate a short quiet period: no studio writes, signup/login, intake, uploads, migrations or incoming provider events during the export. Do not change hosted settings, cancel anything or disable signature checks. If you cannot obtain a quiet period, stop and arrange a consistent-snapshot export instead. Separate CLI dumps are not an atomic cross-file snapshot. Before/after row fingerprints detect observed changes, but do not replace a quiet period.

Run this single terminal block. It creates private folders under your home directory; it does not change `/workspaces/Rovei-3-`, its branch or its uncommitted work.

```bash
(
  set -eu
  set +x
  umask 077
  for tool in python3 git supabase docker psql gpg; do
    command -v "$tool" >/dev/null || { echo "STOP: missing $tool; see PLAN.md"; exit 1; }
  done
  docker info >/dev/null 2>&1 || { echo 'STOP: Docker is unavailable'; exit 1; }
  task_kit_dir="$(mktemp -d "$HOME/rovei-recovery-kit.XXXXXX")"
  chmod 700 "$task_kit_dir"
  python3 - "$task_kit_dir" <<'PY'
import pathlib,sys,zipfile
dest=pathlib.Path(sys.argv[1]).resolve()
with zipfile.ZipFile('/tmp/ROVEI-MISSION2-RECOVERY-KIT.zip') as z:
    for entry in z.infolist():
        target=(dest/entry.filename).resolve()
        if not target.is_relative_to(dest): raise SystemExit('STOP: unsafe ZIP path')
    z.extractall(dest)
import hashlib,json
for name,expected in json.loads((dest/'KIT-MANIFEST.json').read_text()).items():
    target=(dest/name).resolve()
    if not target.is_relative_to(dest) or hashlib.sha256(target.read_bytes()).hexdigest()!=expected:
        raise SystemExit('STOP: kit file hash mismatch')
PY
  python3 "$task_kit_dir/rovei_recovery.py" backup
  printf '\nEnter the PRIVATE backup folder printed above (backup-...): '
  IFS= read -r task_backup_dir
  python3 "$task_kit_dir/rovei_recovery.py" rehearse --backup "$task_backup_dir"
)
```

The source URL is entered at a hidden prompt, not as a pasted shell command. The official CLI receives it transiently as a process argument, so run only in your private Codespace with trusted users/processes. CLI logs can contain credentials or records; they remain private and must never be shared. Do not use `--debug`, shell tracing, screen sharing or terminal recording during credential entry. GnuPG prompts separately for a new encryption passphrase; keep it in your password manager, separately from the archive.

The rehearsal starts a fresh, unlinked local Supabase project, sets PostgreSQL 17, then stops its Auth/API/Storage and other non-database containers before importing records. Restore connections must be loopback port 54322; hosted restore URLs are rejected. An existing local stack or occupied port causes a stop rather than resetting anything. No source migration from the five-file pending sequence is executed, even locally, by this procedure.

If a step fails, **STOP**. Keep the private original exports unchanged. Do not paste SQL dumps or full logs into chat, drop schemas, use `db reset`, omit COPY sections, remove Auth rows or disable `ON_ERROR_STOP`. A failed rehearsal means recovery is still unverified. Share only the generic step/error category; we will prepare a specific fix against a new disposable local instance. After a failed local start/import, keep its ports Private and stop only the containers belonging to the printed `rovei_recovery_...` project; do not stop your other projects. No automatic volume deletion is performed.

## What is backed up and checked

| Recovery material | Coverage |
|---|---|
| `roles.sql` | Official CLI custom-role export. Role passwords are not assumed recoverable; keep any custom login credentials separately in a password manager. Read-only inspection found zero custom login roles. |
| `schema.sql` | Official CLI application DDL: tables, constraints, indexes, functions, grants, RLS and policies; Supabase filters platform internals. |
| `data.sql` | Explicit `public,auth,storage` data using COPY. This includes account/identity data, application records, bucket/object metadata. Managed Auth/Storage migration tables are excluded from replay; vector metadata exclusions follow the official guide and are accepted only when their source row counts are zero. |
| `history_schema.sql`, `history_data.sql` | Explicit `supabase_migrations` schema/data export. This preserves actual hosted history, including its current discrepancies. It does not mark missing migrations as applied. |
| `managed-customizations.sql` | The current user-defined trigger on `auth.users`, whose function lives in `public`. Source Auth/Storage policies must still be absent, otherwise the helper stops for a revised export. |
| `source-platform.json` | PostgreSQL/extension versions, managed-schema column inventory and managed Auth/Storage migration-history reference. Platform-managed migrations must match the destination service versions; they are not replayed over a different platform version. |
| `source-migrations/` | Copies of installed SQL files from the current Codespace, including uncommitted files. All five reviewed migration hashes must match before export. No environment files are copied. |
| Private expected rows/catalog and SHA-256 manifest | Before/after source table counts and content fingerprints, COPY row coverage, file checksums, and security catalog comparisons. Record contents are never printed. |

The helper exports the current project's application data in `public`. Read-only inspection found no additional custom data schema. If new application schemas are added, revise the export and coverage checks first. Fingerprint queries sort row text in memory: this is intended for the current small prelaunch database, not an unbounded large database.

The five core CLI commands follow Supabase's official method: role-only dump, schema dump, COPY data-only dump, plus explicit migration-history schema/data dumps. Restore uses `psql --single-transaction --variable ON_ERROR_STOP=1`, revokes broad destination public-table default grants before schema import, imports reviewed managed-schema customizations, and sets `session_replication_role=replica` for the data import. These restore changes apply **only to the newly created local database**.

Local verification requires all exported source tables' row counts/content fingerprints to match and public functions, grants, policies, RLS flags and relevant triggers to match. Foreign keys and other DDL must restore without error. A restore failure or mismatch is not a pass. This is database recovery evidence, not a hosted Auth/API/Storage end-to-end test or permission to restore the source project.

## Auth needs a separate recovery record

Auth users/identities and password hashes are sensitive data included in the data export; the helper checks source coverage and restored content. The `on_auth_user_created` trigger must also survive. Keep a private recovery record in your password manager for the project's Site URL, redirect allowlist, email confirmation/password/MFA settings, enabled OAuth providers, SMTP setup and email templates, Auth hooks, signing-key configuration and required provider credentials. Do not copy a source project's secrets into a publicly reachable test service.

These dashboard/provider settings and credentials are not restored by SQL. For recovery to a new hosted project, configure them separately, issue appropriate new project keys, update application configuration only after approval, and expect users to reauthenticate when signing keys change. Restoring account rows alone does not verify email delivery, OAuth login or session behavior. Never ask customers for passwords to test recovery.

## Private Storage and encryption

Read-only inspection found **zero objects across Storage**, including `client-experience-photos`; its bucket is private. The helper rechecks zero objects before/after export and preserves bucket metadata. It stops if any object appears.

If files exist at backup time, the backup gate remains blocked until a separate private Storage API export handles every bucket, recursively paginates all objects, downloads original bytes without making buckets public, and records original bucket/path, MIME type, size and SHA-256. It must reconcile the exported list against database metadata, then upload through the Storage API to a private disposable target and re-download/hash-check every object. Test signed access and cross-tenant denial. Database `storage.objects` rows alone do not recover file bytes. Never make a public bucket or upload private photos to chat/GitHub as a workaround. Provider egress/storage charges may apply when objects exist.

The Vault extension is installed but has **zero secret entries** at inspection. The helper stops if entries appear, because a logical dump alone cannot establish encrypted-secret recovery; Supabase's encryption-key transfer requirements need separate review. Do not print decrypted Vault data.

## Off-Codespace retention and acceptance

The helper produces an AES-256 GnuPG-encrypted `.tar.gz.gpg` file, decrypts it to a private temporary copy and checks its bytes against the original archive. Plaintext originals/decrypt-check archive remain under the private home directory, outside Git, for verification. Do not delete them until two verified retained copies and restore evidence exist; this kit performs no automatic deletion.

Download **only the encrypted archive and its `.sha256` file** to your own private computer or encrypted private storage outside the Codespace. Verify its SHA-256 there and confirm it decrypts with your saved passphrase. Do not use a public repository, PR attachment, chat attachment or shared public drive. A backup kept only inside a Codespace does not satisfy recovery. Keep a dated pre-migration copy, a verified post-migration copy and several retained generations. Disk usage, existing Codespaces compute time and any transfer fees remain possible; this plan does not enable a paid Supabase add-on.

Return only:

```text
Project: errzsgncbygxwwmwndha
Export: PASS / FAILED
Local restore: PASS / FAILED (or safe-summary.json)
Encrypted copy outside Codespace: downloaded + SHA-256/decryption verified / pending
Passphrase stored separately: yes / no
Private Auth recovery record: complete / pending
Storage object count recheck: zero / nonzero
```

Do not send the backups, SQL, connection URL, credentials, private logs, fingerprints or private account counts. No approval is requested until these gates pass. Before migration application, recheck project/schema/history and backup freshness; refresh the backup if intervening writes make its recovery point unacceptable.

## Actual recovery route if an approved change fails

Stop further migration execution on the first error; do not continue the sequence or improvise a destructive rollback. Each reviewed migration has its own transaction, so earlier successful migrations can remain committed. Prefer a separately reviewed forward fix. If recovery is needed, restore the retained backup into a new compatible Supabase project or private local environment, verify database and Auth/Storage configuration and API behavior, then request separate approval for any hosted restore, traffic switch or settings changes. Do not import this baseline over the populated original project: that can conflict with existing objects and lose newer writes. Recovery point is the manual export's quiet window, so later writes require reconciliation; recovery time is unmeasured until rehearsal actually succeeds. This plan grants no restore/deletion approval for the original project.

## Pending single migration approval (not issued yet)

Once backup acceptance passes, the consolidated request will name target `errzsgncbygxwwmwndha`, the verified recovery evidence, these exact hashes, application/history mechanism, a quiet execution window and the authorized synthetic test writes:

| Migration | SHA-256 |
|---|---|
| `202610110001_subscription_access.sql` | `233d0b3f1447f282b6fa48117e1bb90367e1816da1c17dd5d7e6746c83385b82` |
| `202610120001_support_requests.sql` | `b84c33de0bf483a561268123ae4edf53586b723511ca602361858981c5a3b340` |
| `20261014155715_launch_billing_hardening.sql` | `863a33f89573459fd793efbba78bc431da415d2e5ff728ece7b19d85adac78c2` |
| `20261014160018_atomic_studio_and_pack_saves.sql` | `57050c46d958cc49c9c19ba991a0ac145516b439a216dd793a11747460a086b2` |
| `20261014182409_persistent_studio_workflows.sql` | `e696d941e5a4f53da4a2f5c9480922aa6d0a27869e830cd6e80acf101920b5a1` |

The five-file sequence was recovered from the attached original ZIP, whose SHA-256 is `17296a666e4148a0fd665a8cd5d2b40bc777958bb0f13e8a7a960295a423e2fe`. All SQL hashes match its review. The support table already exists; replay/reconciliation must preserve records and match its current columns, defaults, constraints, indexes, RLS and grants. The final persistent-workflows migration is not repeatable. SQL functions may contain deletes for future authorized operations; no migration itself backfills, deletes or rewrites existing customer rows.

Planned later synthetic tests: distinct authorized paid and unpaid studios, two-tenant denial, reusable intake, concurrent conflicting appointments and rollback, client/appointment associations, visits/history, atomic Beauty Pack saves, private photo upload/signing/denial, session restoration, and real Auth/RPC/Storage calls. Synthetic subscription fixtures must not alter real subscription records or make Paddle transactions. Test accounts/data are hosted writes requiring explicit authorization; no customer-data deletion or synthetic cleanup deletion is bundled. Full paid-studio tests remain unverified until actually run.

## Official references checked

- Backup/restore and migration history: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- CLI dump semantics and destination default privileges: https://supabase.com/docs/reference/cli/supabase-db-dump
- Auth configuration, roles and version compatibility: https://supabase.com/docs/guides/self-hosting/restore-from-platform
- Storage exclusions and Free-plan backup guidance: https://supabase.com/docs/guides/platform/backups
- CLI setup: https://supabase.com/docs/guides/local-development/cli/getting-started

Preparation checks: Python syntax passed; ten offline target/COPY safety assertions passed. CLI execution, GnuPG execution, Docker startup, source export, local restore and hosted integration are **not verified in this environment**. Neither CLI/Docker/psql nor the required private database connection are available here. The helper is reviewable preparation, not evidence of a completed backup.
