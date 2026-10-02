# Cloudflare deployment adapter

Cloudflare is the initial host for Five Minutes. It is **not** part of the application architecture (ADR-0004). This directory is the only place for Cloudflare-specific configuration.

## Boundary

```text
src/ (Astro, provider-neutral) --npm run build--> dist/ (plain static files)
                                                     |
                     any static host  <--------------+-------------->  Cloudflare (this adapter)
                     e.g. npm run preview                              deploy/cloudflare/wrangler.jsonc
```

- `npm run build` produces ordinary static HTML/assets in `dist/`. Nothing in `src/` imports Cloudflare APIs, and the build does not use a Cloudflare adapter.
- `wrangler.jsonc` deploys `dist/` as **Workers Static Assets** with no Worker script (`main`), so there is no server-side runtime. `preview_urls` is enabled only at this Cloudflare boundary so Worker Preview deployments receive testable `workers.dev` URLs.
- Replacing Cloudflare means deploying the same `dist/` elsewhere and deleting this directory plus the `cf:*` npm scripts.

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

| Limit (Workers Static Assets) | Workers Free | Workers Paid |
|---|---|---|
| Files per Worker version | 20,000 | 100,000 |
| Maximum size of one file | 25 MiB | 25 MiB |
| Requests to static assets | free, unlimited | free, unlimited |

The 100,000-file limit requires Wrangler 4.34.0 or later, and Worker Previews require Wrangler 4.135.0 or later. Wrangler is pinned at **4.147.0** as a project `devDependency` (exact version, recorded in `package-lock.json`).

## File-count observability

- `npm run dist:count` prints the number of files in `dist/` (and fails if `dist/` is missing). `CI / baseline` runs it after every build and adds the count to the job summary.
- `npm run cf:deploy` / `npm run cf:preview` run the same count with `--warn-at 16000`, about 80% of the current Free limit, before uploading.
- The threshold lives only in these deployment scripts, not in application code. Change it if the hosting plan or provider changes.

## Commands

| Command | Use |
|---|---|
| `npm run build` | provider-neutral static build into `dist/` |
| `npm run dist:count` | report deployable files |
| `npm run cf:preview` | count files, then `wrangler preview`: creates or updates a **Worker Preview** for the current branch without touching production |
| `npm run cf:deploy` | count files, then `wrangler deploy`: deploys the production version of the Worker |

Both `cf:*` scripts run the project's pinned Wrangler from `node_modules/.bin`, not a global or `npx`-downloaded copy. Cloudflare's Preview documentation recommends updating the project dependency because project commands do not use a newer global installation. Both commands need Cloudflare authentication and are meant to run inside Workers Builds.

**Terminology:**
- **Worker Previews** (`wrangler preview`) are Cloudflare's recommended mechanism for branch/PR testing. Each branch gets its own Preview, and Workers Builds posts the Preview URL on the GitHub PR. This adapter uses them.
- **Version URLs** (`wrangler versions upload`) are the older per-version deployment mechanism and are not used for branch/PR testing here. The `preview_urls` Wrangler setting is nevertheless enabled because Wrangler 4.147.0 requires it to expose Worker Preview deployments on `workers.dev` URLs.

## Preview path: Worker Previews for pull requests and branches

Use **Workers Builds** (Cloudflare's GitHub integration) rather than a GitHub Actions deploy job:

- No Cloudflare API token is stored in GitHub. Builds run on Cloudflare and use no GitHub Actions minutes.
- Per Cloudflare's docs, only the final deploy step receives secrets, so preview builds also work safely for fork PRs.
- Cloudflare creates a Worker Preview per branch and posts the Preview URL as a PR comment and a check run.

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

On the Workers Free plan, serving static assets costs nothing: asset requests are free and unlimited, and there is no Worker script to bill.

- **Current usage:** the build is 1 file today, so the file limit is not a constraint.
- **Builds:** Workers Builds has its own per-plan build allowances. Check Cloudflare's Builds limits if publication frequency grows.
- **Paid plan:** needed only if `dist/` approaches 20,000 files. That is an Owner cost decision (ARCHITECTURE.md, "Cloudflare deployment boundary").
