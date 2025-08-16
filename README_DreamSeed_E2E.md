
# Dream Seed – E2E Publish (Supabase → Next.js/Vercel)

This folder contains:
- `dreamseed_profile.json` – API-ready profile JSON (store this in Supabase `sites.profile_json`).
- `supabase_upsert.sh` – curl script to upsert the site row and (optionally) upload images.
- `n8n_workflow_dreamseed_publish.json` – importable n8n workflow to publish via GitHub + Vercel.

## Prereqs
- Supabase project with `sites` and `images` tables created, and a public storage bucket `public`.
- GitHub repo with your Next.js template reading `/site.json`.
- Vercel project connected to the repo, with a Deploy Hook URL.

## 1) Upsert Dream Seed into Supabase
```
chmod +x supabase_upsert.sh
./supabase_upsert.sh
```
This inserts/updates the `sites` row. Optionally upload `hero.jpg`, `logo.png` etc. to Storage and record in `images` table (uncomment the lines in the script).

## 2) Import the n8n workflow
- In n8n, Import `n8n_workflow_dreamseed_publish.json`.
- Add these environment variables (n8n settings → Variables):
  - `SUPABASE_URL`
  - `GITHUB_REPO` (e.g., `youruser/yourrepo`)
  - `GITHUB_BRANCH` (e.g., `main`)
  - `VERCEL_DEPLOY_HOOK`
- Create two HTTP Header credentials:
  - **Supabase Service Role**: add headers `apikey` and `Authorization: Bearer <SERVICE_ROLE>`
  - **GitHub Token (Bearer)**: add header `Authorization: Bearer <GITHUB_TOKEN>`

## 3) Trigger a publish
- POST the payload below to the Webhook URL shown in the workflow:

```json
{
  "slug": "dream-seed",
  "company_name": "Dream Seed",
  "profile_json": (paste contents of dreamseed_profile.json here),
  "images": [
    { "label": "hero.jpg", "url": "https://YOUR_SUPABASE_URL/storage/v1/object/public/sites/{SITE_ID}/hero.jpg" },
    { "label": "logo.png", "url": "https://YOUR_SUPABASE_URL/storage/v1/object/public/sites/{SITE_ID}/logo.png" }
  ]
}
```

- The workflow will:
  1. Upsert the `sites` row.
  2. Build a combined `site.json` (profile + image URLs).
  3. Commit it to your repo.
  4. Hit Vercel’s Deploy Hook.

## 4) Next.js template
Your app should read `site.json` at build time (or runtime) and render sections/pages based on `pages.*.enabled` flags. Ensure alt text, contrast, and links are validated by your QA step.

## Notes
- If you want to push images fully via the workflow, add steps to download/generate images and upload to Supabase Storage, then write to `images` table (we've left placeholders in the shell script).
- When you’re ready to try Webflow, replace the last two nodes with Webflow CMS upsert + Publish calls.
