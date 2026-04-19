# Platform Inputs

This file lists the exact things you still need to enter manually in Supabase, GitHub, and Vercel.

## 1. Supabase

You still need to manually run SQL in the Supabase SQL Editor.

### What to input

Run the full contents of:

- [supabase/migrations/20260419_align_schema_with_current_app.sql](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/supabase/migrations/20260419_align_schema_with_current_app.sql:1)

### Why

Your current app code expects:

- `profiles` table
- `transactions.user_id`
- `fixed_items.user_id`
- `budgets.start_date`
- `budgets.is_system`
- `regions.is_active`
- `tags.is_active`

Without that SQL, the app can deploy but some features will break against the current DB.

## 2. Vercel

You still need to manually add environment variables in the Vercel dashboard.

### Environment variable names

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Current values from local setup

From [.env.local](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/.env.local:1):

- `NEXT_PUBLIC_SUPABASE_URL=https://exifzqlvcmdlibkrvhui.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aWZ6cWx2Y21kbGlia3J2aHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDg2NDYsImV4cCI6MjA5MTgyNDY0Nn0.jKWQz3eU_WW8hBzNP-rm9mKntwXyHKJGO1wVuGZMZa4`

### Where to input

Add both values to:

- Preview
- Production

If you later split Preview and Production into separate Supabase projects, replace the values per environment then.

## 3. GitHub

You still need to manually create or choose a GitHub repository if this project is not already in one.

### Suggested repository metadata

- Repository name: `nomad-pocket`
- Description: `Nomad Pocket — Financial Precision, a personal finance PWA for iPad and iPhone`

### What to push

Make sure these files are included in the first deployment-ready push:

- [supabase/schema.sql](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/supabase/schema.sql:1)
- [supabase/migrations/20260419_align_schema_with_current_app.sql](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/supabase/migrations/20260419_align_schema_with_current_app.sql:1)
- [src/app/manifest.ts](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/manifest.ts:1)
- [src/app/icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/icon.tsx:1)
- [src/app/apple-icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/apple-icon.tsx:1)
- [DEPLOYMENT_CHECKLIST.md](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/DEPLOYMENT_CHECKLIST.md:1)
- [VERCEL_DEPLOYMENT.md](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/VERCEL_DEPLOYMENT.md:1)

### Suggested first commit message

- `chore: align supabase schema and prepare vercel pwa deployment`

## 4. Things You Do Not Need To Enter Yet

You do not need these yet:

- `SUPABASE_SERVICE_ROLE_KEY`
- custom Vercel build settings
- service worker config
- custom domain settings
- App Store metadata

## 5. Short Answer

Yes, there are still a few manual inputs:

1. Run the Supabase migration SQL
2. Add the two public Supabase env vars in Vercel
3. Create/select the GitHub repo and push this code

Everything else is already being prepared inside the project.
