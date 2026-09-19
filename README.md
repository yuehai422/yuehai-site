# yuehai-site (Phase A · No-VPS)

Hugo static site + Sveltia CMS, destined for **Cloudflare Pages**.  
Custom domain DNS cutover is **deferred** while Aliyun ECS trial credit remains; production `yuehai.space` stays on Ghost/ECS until then.

Spec: `../docs/superpowers/specs/2026-09-18-no-vps-phase3-design.md`  
Plan: `../docs/superpowers/plans/2026-09-19-no-vps-phase3-implementation.md`

## Local preview

```bash
cd yuehai-site
hugo server -D
```

- Home: http://localhost:1313/
- Sample post: http://localhost:1313/posts/vue-component-visibility/
- CMS shell: http://localhost:1313/admin/  
  (GitHub login needs a published repo + PAT; local file edits still work without CMS.)

## GitHub + Cloudflare Pages

1. Create a GitHub repo (suggested: `yuehai422/yuehai-site`).
2. Push this folder as the repo root (`main` branch).
3. Edit `static/admin/config.yml` → `backend.repo` to match `owner/repo`.
4. Cloudflare Dashboard → Workers & Pages → Create → Connect GitHub → this repo.
5. Build settings:
   - **Framework preset:** Hugo (or None)
   - **Build command:** `hugo --gc --minify`
   - **Build output directory:** `public`
   - **Environment variable:** `HUGO_VERSION` = `0.146.0` or newer (extended not required for this theme)
6. After first deploy, open `https://<project>.pages.dev` and `/admin/`.
7. In `/admin/`, use **Sign in with Token** (GitHub PAT with `repo` scope). Solo use is fine; OAuth Worker is optional later.

Do **not** commit dumps, Staff tokens, or `.env` files.

## Content conventions (Phase B import-friendly)

| Field | Required |
|-------|----------|
| `title` | yes |
| `date` | yes |
| `slug` | yes |
| `tags` | optional |
| `draft` | optional |

Posts live in `content/posts/*.md`. Images go under `static/images/uploads/` (CMS media folder). Avoid Yuque CDN hotlinks.

## When trial ends (DNS — not this pass)

1. Run offline Ghost backup (see `docs/ghost-offline-backup.md`).
2. Bind `yuehai.space` / `www` to the Pages project in Cloudflare.
3. Switch DNS away from ECS `101.200.175.208`.
4. Soak 3–7 days, then stop/release ECS.
