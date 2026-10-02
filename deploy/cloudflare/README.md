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
- `wrangler.jsonc` deploys `dist/` as **Workers Static Assets** with no Worker script (`main`), so there is no server-side runtime.
- Replacing Cloudflare means deploying the same `dist/` elsewhere and deleting this directory plus the `cf:*` npm scripts.

## Why Workers Static Assets

As of October 2026, Cloudflare recommends **Workers Static Assets** for new static sites. Pages continues to work, but new features go to Workers. Workers covers everything this project needs:

- production deploys from `main` through Workers Builds (Git integration);
- per-branch/PR preview URLs posted on pull requests;
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
- Version / preview URLs: https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
- GitHub Actions alternative: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

## Relevant limits (check before relying on them; Cloudflare can change them)

| Limit (Workers Static Assets) | Workers Free | Workers Paid |
|---|---|---|
| Files per Worker version | 20,000 | 100,000 |
| Maximum size of one file | 25 MiB | 25 MiB |
| Requests to static assets | free, unlimited | free, unlimited |

The 100,000-file limit requires Wrangler 4.34.0 or later. This adapter pins Wrangler 4.147.0.

## File-count observability

- `npm run dist:count` prints the number of files in `dist/` (and fails if `dist/` is missing). `CI / baseline` runs it after every build and adds the count to the job summary.
- `npm run cf:deploy` / `npm run cf:preview` run the same count with `--warn-at 16000`, about 80% of the current Free limit, before uploading.
- The threshold lives only in these deployment scripts, not in application code. Change it if the hosting plan or provider changes.

## Commands

| Command | Use |
|---|---|
| `npm run build` | provider-neutral static build into `dist/` |
| `npm run dist:count` | report deployable files |
| `npm run cf:preview` | count files, then `wrangler versions upload`: uploads a preview version without changing production |
| `npm run cf:deploy` | count files, then `wrangler deploy`: deploys the production version of the Worker |

Wrangler is run with `npx` at a pinned version rather than added to `devDependencies`. That keeps every `npm ci` (local, `CI / baseline`, `CI / e2e`) free of Wrangler's large runtime download. Both `cf:*` commands need Cloudflare authentication and are meant to run inside Workers Builds.

## Preview path (pull requests and branches)

Use **Workers Builds** (Cloudflare's GitHub integration) rather than a GitHub Actions deploy job:

- No Cloudflare API token is stored in GitHub. Builds run on Cloudflare and use no GitHub Actions minutes.
- Per Cloudflare's docs, only the final deploy step receives secrets, so preview builds also work safely for fork PRs.
- Cloudflare posts the preview URL as a PR comment and a check run.

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
   - Enable **non-production branch builds**, with preview/non-production command `npm run cf:preview`
   - Build variable `NODE_VERSION=22`, if the build image does not pick up `.nvmrc`
4. Leave **Domains & Routes** without a custom domain. The site is then reachable only at `five-minutes-v2.<account-subdomain>.workers.dev` and on preview URLs.
5. Open or update a pull request. Confirm that Cloudflare's PR comment shows a preview URL, then open it.

Cloudflare's newest Workers Builds default preview command is `npx wrangler preview` ("Worker Previews", open beta). `npm run cf:preview` uses the generally available `wrangler versions upload` instead. Either works for a static site. Switch to `wrangler preview` once it is GA if per-PR isolation matters.

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
