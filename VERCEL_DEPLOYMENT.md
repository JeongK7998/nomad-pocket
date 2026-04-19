# Vercel Deployment Guide

## Scope

This guide covers only the Vercel side for Nomad Pocket.

## Current Project Assumptions

- Framework: Next.js App Router
- Build command: `npm run build`
- Output command: `npm run start`
- Public data backend: Supabase
- Current required public env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Before Connecting Vercel

- [ ] Make sure the Supabase migration has already been applied.
- [ ] Make sure the branch you deploy includes:
- [ ] [supabase/migrations/20260419_align_schema_with_current_app.sql](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/supabase/migrations/20260419_align_schema_with_current_app.sql:1)
- [ ] [src/app/manifest.ts](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/manifest.ts:1)
- [ ] [src/app/icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/icon.tsx:1)
- [ ] [src/app/apple-icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/apple-icon.tsx:1)
- [ ] Run `npx tsc --noEmit` locally.
- [ ] Run `npm run build` locally if possible.

## Vercel Project Setup

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as `Next.js`.
3. Use the default root directory unless you later move this into a monorepo.
4. Leave install command as Vercel default, or set it explicitly to `npm install`.
5. Leave build command as `npm run build`.

## Required Environment Variables

Add these in Vercel Project Settings > Environment Variables:

### Preview

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Current Values From Local Setup

These are the values currently present in [.env.local](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/.env.local:1):

- `NEXT_PUBLIC_SUPABASE_URL=https://exifzqlvcmdlibkrvhui.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

Use the exact same project URL and anon key in Vercel unless you intentionally split preview and production backends.

## Recommended Environment Strategy

### Simpler path

Use the same Supabase project for both Preview and Production at first.

Choose this if:

- you are the only active testers
- real data volume is still low
- speed matters more than environment isolation

### Safer path

Use one Supabase project for Preview and another for Production.

Choose this if:

- preview deploys will be used often
- you want clean production data
- you want to test destructive flows safely

If you choose the safer path, use separate Vercel env var values per environment.

## First Preview Deployment Checklist

- [ ] Trigger a preview deployment from GitHub.
- [ ] Open the preview URL.
- [ ] Verify the app loads without an environment-variable error.
- [ ] Create or select a user.
- [ ] Open Dashboard, Transactions, Budget, Manage, Settings.
- [ ] Create one transaction and confirm it persists after refresh.
- [ ] Open `/manifest.json` on the deployed preview.
- [ ] Open `/icon` and `/apple-icon` on the deployed preview.

## Production Deployment Checklist

- [ ] Confirm preview works with the intended Supabase project.
- [ ] Confirm there are no test-only records you need to remove.
- [ ] Promote the tested commit to production.
- [ ] Open the production URL on iPhone Safari.
- [ ] Open the production URL on iPad Safari.
- [ ] Add to Home Screen on both devices.

## Current Known Gaps

- No service worker is configured yet.
- There is no offline-first caching flow yet.
- `next.config.ts` is minimal and does not contain extra Vercel-specific tuning yet.
- The app should still deploy normally on Vercel as a standard Next.js app.

## What Not To Add Yet

Avoid adding these until they are truly needed:

- `SUPABASE_SERVICE_ROLE_KEY`
- custom Edge config
- custom Vercel build overrides
- service worker plugins
- image remote config changes unrelated to a real requirement

Keeping Vercel simple right now will make debugging much easier.
