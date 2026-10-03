# Rovei — Start Here

This is the clean production frontend baseline.

## Important
Use this project as-is. Do not move the `src/` folders.

Expected structure:

```text
src/
  app/
  components/
  lib/
  types/
```

## First run

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

The approved final integrated HTML is preserved in `reference/`.

Backend integrations are intentionally not connected yet. The next phase is:
Supabase database/auth/storage → secure client links → Paddle → email →
ElevenLabs/telephony → security/testing → deployment.
