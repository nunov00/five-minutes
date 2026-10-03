# Joint design prototype: one publication, two voices

Status: isolated design preview, not an accepted production design or implementation ADR.
Task: #61. Implementer: Codex / OpenAI. Baseline: b819529ce582f03b9d09529cd4b5288a71407385.
Independent proposal review: Claude / Anthropic, relayed by the Owner on 3 October 2026. That review is not approval of this implementation.

## Entry and scope

Open `/design-preview` on this branch's Cloudflare Worker Preview. The root `/` and all current production routes continue to render the existing site. This branch must remain a draft until design selection and independent implementation review; the preview namespace is not intended to merge wholesale.

The prototype renders all 12 real lessons in both editions through the existing validated content loader. Titles, descriptions, bodies, recall fields, sources and relationship reasons come from canonical content. The only source additions are application-owned prototype components and clearly marked activity/data fixtures. Canonical Markdown, schema, sanitiser, route ownership, PWA manifest and existing reader state are unchanged.

Today deliberately features the real seasons lesson to compare long titles and the two visual voices. It is a design fixture, not a change to production's newest-publication selector. Publication dates on normal rows are real. The sparse-date review control is explicitly synthetic.

## Surfaces

Both editions provide Today, every lesson, Library, Topics, subtopic shelves, Search, Saved and preferences. Adult uses a restrained green accent with serif reading type; Teen uses a stronger purple accent, sans-serif type and an optional prediction. Global control and navigation positions are shared. Mobile tabs are Today / Library / Search / Saved; Topics is a separate page reached through Library. Desktop navigation lives in the header.

The seasons lesson has a proposed explanatory inline SVG and equivalent text. Adult uses a precise line style; Teen uses a warmer, bolder figure. Goodhart has no figure in either edition. Answer and takeaway are hidden together in a native details reveal. Source notes and manual relationship reasons are preserved. No reading-time promises, topic colour system or mandatory Hook/Explain/Recall/Keep steps are added.

Review controls compare Teen typography alone with typography plus prediction, explanatory figures with no figure, and the default first-visit offer with a non-blocking choice prompt. They also expose storage denial, preference mismatch, search error/slow loading, synthetic catalogue sizes, a 90-character title, sparse publication dates and a saved-identity fixture. These are review tools outside the product chrome.

## Delivery and local state

Routes under the preview prefix mirror the proposal: `/design-preview/editions/<edition>/…` for discovery and `/design-preview/<edition>/<slug>` for lessons. Canonical lesson syntax is still constructed by the shared production URL generator before adding the preview prefix.

Four neutral preview entries supply full Adult fallback HTML. A synchronous external head script validates stored edition, catches storage errors and uses location.replace to preserve query/hash while restoring a deliberately selected edition. Explicit edition routes never restore over the URL. Merely opening a shared link never writes the preferred edition. Navigation follows the open page; a mismatch bridge offers return or adoption. Search queries and pagination survive edition switching. Back/Forward query changes re-run search with a generation guard.

Prototype state uses `five-minutes-prototype-v1`; Saved and Read use immutable lesson IDs. Preference and reader actions are local. Denied storage leaves useful HTML and explicitly describes ephemeral changes. Predictions keep the selected option only in memory, never score or persist it. Their correct answer uses a stable option ID.

Without JavaScript, reading, navigation, edition links, native recall/prediction reveals, Topics and archive pagination remain usable. Search, Saved and persisted preferences explain their limitations. Share offers an ordinary lesson link as fallback.

## Scale fixtures and measurements

The static archive fixture has 1,000 synthetic records, 24 per page across 42 pages per edition. Two subtopic examples have 96 records over four static pages each. Empty canonical subtopics are hidden from shelves. Search lazily loads either 12 real records or a labelled 1,000/10,000-record synthetic catalogue, with 24 visible results per page. Synthetic records open an explanation rather than inventing an article.

Measured initial artifact (uncompressed): CSS about 16.4 KB, main enhancement script about 14.3 KB, synchronous restore about 1.1 KB, real metadata catalogue about 18.7 KB. The 10,000-record fixture containing both presentations is about 6.67 MB. No font files are downloaded; system serif/sans stacks are provisional. The large JSON is fetched only when its search fixture is selected. These figures are prototype sizes, not an edition-sharded production search design or phone performance evidence.

Normal build before final visual polish: 236 files / 8.96 MiB, including the unchanged site and this preview. This is not a 10,000-lesson delivery benchmark: it has 24 real lesson pages per namespace and synthetic discovery metadata/rows, not 20,000 real lesson pages. Cloudflare Free's 20,000-file boundary remains an Owner hosting decision at production scale.

## Verification and remaining work

Local Astro/TypeScript check: zero diagnostics. Existing unit/integration suite: 105 tests. Browser suite including nine new prototype journeys per project: 62 passed, desktop and iPhone-class Chromium. The existing intentional page-error guard tests are expected failures and count as passed. Static completeness/link, Cloudflare redirect and capacity checks are retained unchanged. CI repeats the normal pinned-browser checks on the PR head.

The browser journeys cover explicit shared links, mismatch/adoption, neutral replace/query/hash/Back, page and query preservation, recall, Saved/Read identity, search history/no results/retry/overlap, 10,000-record bounded results, denied storage, no-JS navigation/reveals/pagination, 320px widths, 200% root text and four edition/appearance combinations. Local Chromium was temporarily obtained outside the repository because the standard browser download failed in the execution environment. No browser dependency was added to the project. Node 22 is used for final local checks. Environment proxy warnings are disabled only for local offline checks because an existing test asserts empty stderr.

Paired mobile/desktop Today, seasons, Goodhart, Library and Search captures were produced for visual inspection; no horizontal overflow was observed. The explanatory mechanism was checked against the canonical NASA source: https://spaceplace.nasa.gov/seasons/en/. New figure and prediction editorial review is still pending.

Known limits and deliberate boundaries:
- No real iPhone/WebKit or installed-app cold-start test has been performed. A no-flash guarantee is not claimed. The prototype neutral entry exercises the restore mechanism; actual PWA start_url stays `/` on the current site.
- No production ADR/schema/editorial amendment, wildcard legacy redirect, preference storage abstraction or cutover is implemented here.
- The first-visit alternative is a non-blocking prompt, not a forced gate. Whether predictions are allowed outside Teen remains an Owner decision.
- The renamed-Saved example seeds an ID with an obsolete slug hint; it checks ID lookup, not a production alias migration.
- The 404 fixture is labelled and serves 200; invalid URLs use the existing actual 404 route.
- Preview pages are noindex. The current absent-origin sitemap passes the existing gate; a SITE_URL build's sitemap completeness is not claimed for this isolated draft. Preview routes must be removed or explicitly handled before any production implementation.
- No full accessibility audit, real-phone search memory/timing, font selection/subsetting, 5,000-lesson build benchmark or production CSP validation is claimed.

## Claude review hand-off

Review the exact current PR head independently. Read AGENTS.md and governance before starting. This is Codex/OpenAI implementation following your Anthropic proposal review, so different-system review is still required. Do not merge, change main, approve production architecture or assume supplied test results prove correctness.

Inspect the actual preview on mobile and desktop in both editions, including seasons and Goodhart. Challenge the shared shell/two voices boundary, real long titles, figure geometry/accessibility, recall ordering, optional prediction, navigation visibility, archive/shelf scale and Search/Saved failure states. Review prototype source, not only screenshots. Exercise explicit URL versus preference, neutral restore/replace/query/hash/history, denial/corruption of storage, query persistence, asynchronous search and no-JS reading/reveals. Verify canonical source use and the safety boundary: no schema/sanitiser changes or arbitrary executable content.

Report BLOCKER / IMPORTANT / MINOR findings with file evidence, required fixes, independently run checks and remaining uncertainty. Post findings on this PR where practical. Separate prototype defects from production work deliberately deferred above. Provide a design judgement and a short list of Owner decisions; do not require unrelated production features to call the isolated preview reviewable. Re-review any fixes on the final head. The Owner's design choice and actual-device test still precede the production implementation plan.
