# Cloudflare deployment adapter

Cloudflare is the initial host for Five Minutes. It is **not** a core application dependency (ADR-0004). This directory is the only place for Cloudflare-specific configuration and runtime adapters.

## Boundary

```text
src/ (Astro, provider-neutral) --npm run build--> dist/ (plain static files)
                                                     |
                     any static host  <--------------+-------------->  Cloudflare static assets
                                                                            |
                                                /api/feedback only --> Worker adapter
                                                                       (Turnstile + GitHub)
```

- `npm run build` produces ordinary static HTML/assets in `dist/`. Nothing in `src/` imports Cloudflare APIs, and the build does not use a Cloudflare adapter.
- `wrangler.jsonc` deploys `dist/` as **Workers Static Assets** plus the narrow `worker.ts` adapter. Matching static assets are served without running Worker code; `run_worker_first` is limited to `/api/*`. Requests with no matching asset do invoke the Worker and then delegate to `ASSETS`, as Cloudflare's routing documentation specifies. The adapter implements only ADR-0010 feedback and does not render lessons.
- `assets.html_handling` remains `drop-trailing-slash`, so Cloudflare serves Astro's directory-style `index.html` output at the provider-neutral slash-less canonical URL. `preview_urls` is enabled only at this Cloudflare boundary so Worker Preview deployments receive testable `workers.dev` URLs.
- Replacing Cloudflare means deploying the same `dist/` elsewhere and reimplementing the two-path feedback contract, or disabling that optional feature. Lesson/content code does not change.

## Why Workers Static Assets

As of October 2026, Cloudflare recommends **Workers Static Assets** for new static sites. Pages continues to work, but new features go to Workers. Workers covers everything this project needs:

- production deploys from `main` through Workers Builds (Git integration);
- per-branch/PR **Worker Previews**, with the Preview URL posted on pull requests;
- custom domains later;
- free, unlimited static-asset requests.

This matches ADR-0002/ADR-0004 and `docs/ARCHITECTURE.md`, which treats Cloudflare limits "per Pages site or Worker version" as operational thresholds.

Official documentation:

- Astro on Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- Migrating from Pages to Workers: https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- Wrangler configuration (`assets`): https://developers.cloudflare.com/workers/wrangler/configuration/
- Limits: https://developers.cloudflare.com/workers/platform/limits/
- Increased static asset limits (Wrangler ≥ 4.34): https://developers.cloudflare.com/changelog/post/2025-09-02-increased-static-asset-limits/
- Static assets billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- Workers Builds GitHub integration: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
- Build branches: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Worker Previews (22 September 2026): https://developers.cloudflare.com/changelog/post/2026-09-22-worker-previews/
- Wrangler configuration (`previews`): https://developers.cloudflare.com/workers/wrangler/configuration/#previews
- Version URLs (older per-version mechanism, not used here): https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
- GitHub Actions alternative: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

## Relevant limits (check before relying on them; Cloudflare can change them)

The consolidated cross-platform limits reference is the "Platform limits" section of `docs/OPERATIONS.md`; keep both in step when a limit is re-verified.

| Limit (Workers Static Assets) | Workers Free | Workers Paid |
|---|---|---|
| Files per Worker version | 20,000 | 100,000 |
| Maximum size of one file | 25 MiB | 25 MiB |
| Static `_redirects` rules | 2,000 | 2,000 |
| Requests to static assets | free, unlimited | free, unlimited |

The 100,000-file limit requires Wrangler 4.34.0 or later, and Worker Previews require Wrangler 4.135.0 or later. Wrangler is pinned at **4.147.0** as a project `devDependency` (exact version, recorded in `package-lock.json`).

## File-count observability

- `CI / baseline` counts the final deployable `dist/` after Cloudflare artifacts are compiled and warns at **16,000 files** (80% of the current Free limit).
- `npm run cf:verify-capacity` enforces Cloudflare's current hard representation limits at the deployment boundary: at most 100,000 files, at most 25 MiB per file and at most 2,000 static redirect rules. It warns rather than fails between 20,001 and 100,000 files because choosing a paid plan versus another portable representation/provider is an Owner decision.
- `npm run cf:deploy` / `npm run cf:preview` run that capacity gate before upload. The generic `dist:count` script remains provider-neutral.
- Canonical lesson URLs are slash-less (`/adult/slug`, `/teen/slug`). The adapter explicitly uses `drop-trailing-slash`, so normal canonical links are served directly rather than redirected to a slash form.
- Cloudflare's trailing-slash normalization uses a 307 response. Canonical/alternate metadata and 404 `noindex` handling remain later SEO work; `/404` is currently a soft-200 URL at this hosting boundary.
- Historical aliases remain deliberately tolerant of both source forms. The adapter emits an Adult and Teen neutral redirect for each historical alias name, and each neutral redirect compiles to two static rules (slash and non-slash), both targeting the slash-less canonical URL. That remains **four Cloudflare rules per historical alias name**, so roughly **500 historical alias names** consume the 2,000-rule `_redirects` ceiling. The slash-form alias rules are required: Cloudflare's trailing-slash normalization applies to existing static assets, not retired redirect-source paths, which otherwise return 404. Before the ceiling becomes constraining, compare Bulk Redirects, another portable redirect representation or another host rather than silently dropping aliases.

## Commands

| Command | Use |
|---|---|
| `npm run build` | provider-neutral static build into `dist/` |
| `npm run dist:count` | provider-neutral report of deployable files |
| `npm run cf:verify-capacity` | verify the assembled artifact against Cloudflare hosting limits |
| `npm run cf:preview` | compile redirects, verify Cloudflare capacity, then `wrangler preview`: create/update a **Worker Preview** without touching production |
| `npm run cf:deploy` | compile redirects, verify Cloudflare capacity, then `wrangler deploy`: deploy the production Worker version |

Both `cf:*` scripts run the project's pinned Wrangler from `node_modules/.bin`, not a global or `npx`-downloaded copy. Cloudflare's Preview documentation recommends updating the project dependency because project commands do not use a newer global installation. Both commands need Cloudflare authentication and are meant to run inside Workers Builds.

**Terminology:**
- **Worker Previews** (`wrangler preview`) are Cloudflare's recommended mechanism for branch/PR testing. Each branch gets its own Preview, and Workers Builds posts the Preview URL on the GitHub PR. This adapter uses them.
- **Version URLs** (`wrangler versions upload`) are the older per-version deployment mechanism and are not used for branch/PR testing here. The `preview_urls` Wrangler setting is nevertheless enabled because Wrangler 4.147.0 requires it to expose Worker Preview deployments on `workers.dev` URLs.

## Preview path: Worker Previews for pull requests and branches

Use **Workers Builds** (Cloudflare's GitHub integration) rather than a GitHub Actions deploy job:

- No Cloudflare API token is stored in GitHub. Builds run on Cloudflare and use no GitHub Actions minutes.
- Per Cloudflare's docs, only the final deploy step receives secrets, so preview builds also work safely for fork PRs.
- Cloudflare creates a Worker Preview per branch and posts the Preview URL as a PR comment and a check run.

Cloudflare's current Worker Preview model does **not** inherit production settings. Variables and resource bindings must be declared under `previews`, while Preview secrets must be added separately to Previews Base or an individual Preview. This repository deliberately keeps `previews` empty: feedback configuration is absent, `/api/feedback/config` and `/api/feedback` return `503`, and ordinary static Preview pages still work. A second production-only hostname guard means an unmodified Preview cannot enable feedback merely by receiving the other bindings; because Preview code comes from the branch, that guard does not protect secrets from deliberately modified branch code. The primary control is therefore never placing production secrets in Previews Base or an individual Preview. Never import the production GitHub token, Turnstile secret, site key, repository or allowed hostname into Preview configuration.

Re-verify that isolation after any preview-model or build-command change against:

- https://developers.cloudflare.com/workers/previews/
- https://developers.cloudflare.com/workers/previews/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/

### One-time Owner setup

Nothing below changes DNS, billing or the existing public Five Minutes site.

1. In the Cloudflare dashboard, open **Workers & Pages → Create → Import a repository**.
   - Authorise the Cloudflare GitHub app for **only** `nunov00/five-minutes`.
2. Name the Worker **`five-minutes-v2`**.
   - It must match `name` in `wrangler.jsonc`.
   - The name is deliberately different from any existing Five Minutes project, so it cannot overwrite the current site.
3. Build settings:
   - Root directory: `/`
   - Build command: `npm run build`
   - Deploy command (production branch `main`): `npm run cf:deploy`
   - Enable **preview builds** for non-production branches, with Preview command `npm run cf:preview` (Cloudflare's default is `npx wrangler preview`; the project script adds the file count and uses the pinned Wrangler)
   - Build variable `NODE_VERSION=22`, if the build image does not pick up `.nvmrc`
4. Leave **Custom Domains and Routes** empty. Under **Worker URL**, keep the Production URL disabled until production activation is intentionally required, and enable the **Preview** URL. This allows branch previews at `*-five-minutes-v2.<account-subdomain>.workers.dev` without attaching a custom domain.
5. Open or update a pull request. Confirm the Workers Build succeeds; the active Preview URL is printed by `wrangler preview` in the build log. Open the stable branch Preview URL and verify the site.

> Integration note: the first preview build was intentionally triggered after connecting Workers Builds, so the Git integration could be verified against an already-open pull request.
> The first live setup also confirmed that Preview URLs must be enabled for the Worker before `wrangler preview` receives an active `workers.dev` URL.

### Alternative: GitHub Actions deploy (not chosen)

Use this only if Workers Builds is unsuitable. It needs:

- GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`;
- a token created from the **Edit Cloudflare Workers** template, restricted to the one account;
- a workflow on `push` (never `pull_request_target`), so fork PRs never receive the token.

## Production path

- Merges to `main` deploy `five-minutes-v2` to its `workers.dev` URL through Workers Builds. That is a production deploy of the Worker, but not of the public domain.
- Attaching the real Five Minutes domain (**Domains & Routes → Custom domain**) and retiring the existing site are deliberate later Owner decisions. They involve DNS and the live audience, so this adapter does not configure them.

## Cost

On the Workers Free plan, matching static-asset requests remain free and unlimited. Feedback API calls and requests with no matching asset execute the Worker and count against the active Workers request allowance; the expected initial volume does not require a paid service. If that allowance is exhausted, matching assets continue to serve while feedback and Worker-handled 404s fail.

- **Current usage:** CI reports the actual assembled build on every change; the repository does not hard-code a stale current count in documentation.
- **Builds:** Workers Builds has its own per-plan build allowances. Check Cloudflare's Builds limits if publication frequency grows.
- **Paid plan:** needed only if `dist/` approaches 20,000 files. That is an Owner cost decision (ARCHITECTURE.md, "Cloudflare deployment boundary").
