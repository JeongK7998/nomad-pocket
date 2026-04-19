# Nomad Pocket Deployment Checklist

## 1. Supabase

- [ ] Open Supabase SQL Editor for the current project.
- [ ] Run [supabase/migrations/20260419_align_schema_with_current_app.sql](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/supabase/migrations/20260419_align_schema_with_current_app.sql:1).
- [ ] Confirm these objects exist after migration:
- [ ] `profiles` table
- [ ] `transactions.user_id`
- [ ] `fixed_items.user_id`
- [ ] `budgets.start_date`
- [ ] `budgets.is_system`
- [ ] `regions.is_active`
- [ ] `tags.is_active`
- [ ] Seed or verify at least one profile, one category, one subcategory, and one currency.
- [ ] Verify RLS still allows app access in the current MVP mode.

## 2. Local Verification

- [ ] Ensure `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Run `npm run dev`.
- [ ] Verify core routes load:
- [ ] `/`
- [ ] `/transactions`
- [ ] `/budget`
- [ ] `/manage`
- [ ] `/settings`

## 3. Functional Smoke Test

- [ ] Create a user profile.
- [ ] Add at least one expense category and subcategory.
- [ ] Add at least one payment method.
- [ ] Add at least one region and one tag.
- [ ] Add one expense transaction from the FAB.
- [ ] Add one income transaction from the FAB.
- [ ] Confirm Dashboard summary numbers update.
- [ ] Confirm Transactions list shows the created items.
- [ ] Confirm Manage lists reflect new master data.
- [ ] Confirm Budget page loads without query errors.
- [ ] Confirm Settings export actions render and do not crash.

## 4. GitHub

- [ ] Commit the schema alignment and PWA asset changes together.
- [ ] Push the branch to GitHub.
- [ ] Open a PR if you want preview review before production.
- [ ] Keep the migration SQL in the same PR as the related app code.

## 5. Vercel

- [ ] Import the GitHub repository into Vercel.
- [ ] Set environment variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Trigger a preview deployment first.
- [ ] After preview checks pass, promote to production.

## 6. PWA Verification

- [ ] Confirm `/manifest.json` resolves from the deployed app.
- [ ] Confirm app icon loads from `/icon` and `/apple-icon`.
- [ ] Confirm “Add to Home Screen” is available on iPhone/iPad Safari.
- [ ] Install the app to the home screen on both iPad and iPhone.
- [ ] Launch from the home screen and confirm standalone appearance.
- [ ] Confirm theme color and splash/icon appearance are acceptable.

## 7. iPad UX Checks

- [ ] Sidebar remains fixed and does not jitter while scrolling.
- [ ] Dashboard fits the target viewport without page scroll.
- [ ] Top Spending internal scroll works independently.
- [ ] FAB does not cover important content.
- [ ] Transactions sticky controls remain visible while scrolling.
- [ ] Budget charts stay readable in landscape.
- [ ] Manage left menu stays fixed while right content scrolls.
- [ ] Settings modals fit fully without clipped actions.

## 8. iPhone UX Checks

- [ ] Drawer opens and closes smoothly.
- [ ] No content is hidden behind the mobile top bar or browser UI.
- [ ] Modals fit within the viewport with the keyboard open.
- [ ] Transactions table remains usable with narrow width.
- [ ] FAB placement is reachable and not blocked by Safari bottom UI.
- [ ] Long pages scroll naturally with no nested scroll traps.

## 9. iOS-Specific Interaction Checks

- [ ] Date inputs are usable in Safari on iPhone and iPad.
- [ ] Sticky headers behave correctly after home screen install.
- [ ] `h-dvh` layouts do not crop content when browser chrome changes.
- [ ] Opening and closing the keyboard does not break modal layout.
- [ ] Pull-to-refresh or overscroll does not create broken spacing.

## 10. Recommended Rollout Order

1. Apply Supabase migration.
2. Finish the next chunk of feature work.
3. Push to GitHub.
4. Create a Vercel preview deployment.
5. Test preview on iPad and iPhone home-screen installs.
6. Fix UX issues found on real devices.
7. Ship production.

## Current Notes

- The app now has a generated manifest and app icons at:
- [src/app/manifest.ts](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/manifest.ts:1)
- [src/app/icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/icon.tsx:1)
- [src/app/apple-icon.tsx](/Users/jongiljeong/Library/Mobile%20Documents/com~apple~CloudDocs/프로젝트/AI/Vibe_Code/Nomad_Pocket/src/app/apple-icon.tsx:1)
- The current Next config does not include a service worker setup. Home-screen install can still work on iOS, but offline-first behavior is not configured yet.
