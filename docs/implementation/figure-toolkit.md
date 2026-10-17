# Reusable explanatory figures

Owner approved the direction on 17 October 2026; implementation/review evidence is tracked in #149. This adds optional schema-v2 figure variants without migrating existing content, adding dependencies/services or changing the two publication schedules.

## Choose the representation

Start with the explanatory relationship, not a decorative picture. Existing seasons, filter/reclaim, feedback/heat-transfer cycles and doubling-growth styles remain compatible. New reusable choices are:

| Type/style | Relationship and bounds |
| --- | --- |
| `concept-flow`, `pattern: sequence` | An ordered path of 2–4 illustrated stages. |
| `concept-flow`, `pattern: cycle` | 3–4 illustrated stages connected in a loop; the final stage returns to the first. |
| `concept-flow`, `pattern: branch` | Exactly one source and two outcomes; not a causal chain between outcomes. |
| `comparison-bars`, `style: proportional` | 2–6 non-negative values, at least one positive, all measured from zero on the same scale. Values up to 1 billion; no artificial minimum length. |
| `orbital-motion`, `style: shared-free-fall` | A specific station/astronaut/pencil scene for orbital free fall, with tangent motion and inward gravity. Its fixed artwork and wording are unsuitable for other mechanisms or cabin examples; use another toolkit type or the raster fallback. Not a general orbit simulator. |
| `image` | A local, reviewed, non-animated PNG/WebP when the structured toolkit is insufficient. |

Concept nodes contain only `{label, symbol}`. Labels are unique, bounded plain text (28 characters). The application owns all geometry and a closed symbol set: `source`, `filter`, `container`, `output`, `energy`, `clock`, `sensor`, `adjustment`, `person`, `object`, `document`, `decision`. Choose symbols that convey the mechanism; a chain of arbitrary icons or generic text labels is not an adequate diagram. Layout coordinates, CSS, SVG paths, arbitrary icons, links and executable drawing instructions are rejected. The visible legend is part of the figure, not its collapsed full description.

```yaml
figure:
  type: concept-flow
  data:
    pattern: cycle
    nodes:
      - {label: Sense the result, symbol: sensor}
      - {label: Compare with the goal, symbol: decision}
      - {label: Adjust the system, symbol: adjustment}
  alt: A sensor measures the result, a decision compares it with the goal, and an adjustment feeds into the next measurement.
  caption: Feedback closes the loop between action and its measured result.
  description: The sensor measures the result. Comparison identifies a difference from the goal. Adjustment changes the system, and the sensor measures the new result.
```

Proportional items retain the existing `{label, value, display}` fields, with labels up to 24, display text up to 16 and an optional unit up to 40 characters. Editorial review must verify that displayed values and units agree with the numeric values; schema checks cannot establish factual accuracy. All types retain alt/caption/description and validated paragraph placement.

## Static fallback and trust boundary

The Writer may add at most two images to an automated lesson PR, including one shared by both editions. Allowed paths are `public/lesson-media/<slug>.png|webp`, `<slug>-adult.png|webp` and `<slug>-teen.png|webp`. Each new asset must be referenced by Adult and/or Teen, and every automated image reference must resolve to one of these newly added files. Existing assets cannot be overwritten, extra non-image files cannot be added, and unrelated filenames are rejected. Check existing filenames before authoring: a slug ending in `-adult` or `-teen` may collide with another lesson's edition asset. Such a collision fails closed; choose another permitted unused filename for this slug or use the structured toolkit. The daily slot and immutable identity checks still apply.

Limits remain 500 KiB per asset, 2400 pixels per dimension and 4 million pixels; a candidate has a separate aggregate 1 MiB image budget. Its three text files retain the original individual/aggregate text limits. The only extra files allowed by the guard are these zero to two images: the candidate still has exactly three new lesson files and the single append-only route-owner entry, totalling 4–6 files.

The guard runs trusted current-main code only. It reads pinned GitHub content responses as strict bounded base64, checks regular-file mode/type, signatures/containers, non-animation and intrinsic versus declared dimensions using the same parser as the normal loader. PNG permits only IHDR, PLTE, IDAT, IEND, tRNS and bounded rendering parameters gAMA, cHRM, sRGB, pHYs, sBIT. WebP permits only VP8, VP8L, VP8X and ALPH; VP8X permits only the alpha flag. Text/EXIF/XMP, unknown/private chunks, animation and opaque ICC profiles are rejected. Convert artwork to sRGB and strip metadata before submitting it. Existing archive PNGs have had their text chunks removed without changing decoded pixels. Repeated rendering chunks (except PNG IDAT) are rejected. These checks restrict container metadata; they cannot detect information encoded in the pixels or codec stream.

The guard never runs a candidate script, follows a remote image URL or checks out the candidate. Parsing does not verify PNG CRCs or decode pixels; exact-head browser decoding plus human/AI rendered editorial inspection are required, including actual load success and natural dimensions. Those are complementary checks, not replaced by the container parser.

Every automated and non-archive raster requires a persistent `imageRights` record in `lesson.yaml`, exactly one per distinct referenced asset, shared when both editions use the same image. The canonical loader and guard share validation: 1–2 records; no duplicates, unused records or unknown keys; local `src`; `origin` from `original-code`, `generated`, `licensed`; plain `creator` (120 characters), `licence` or reuse basis (160), `evidence` (600); and an absolute HTTPS `sourceUrl` without credentials (512) required for licensed artwork, optional otherwise. These strings record reviewable evidence, not machine proof of ownership: the Reviewer must verify the actual origin and rights, and reject unverifiable claims. Factual support still belongs in the lesson's sources. Legacy archive lessons retain their existing reviewed provenance without a metadata migration; any provided rights records must match their assets too.

```yaml
imageRights:
  - src: /lesson-media/example-slug.png
    origin: original-code
    creator: Publication illustrator
    licence: Original artwork owned by the publication
    evidence: Drawn from the lesson sources without third-party artwork; creation method and ownership verified by the Reviewer.
```

Also state in the PR why a toolkit figure was unsuitable. Prefer original code-drawn scientific artwork when appropriate. No paid image API or new subscription is introduced. If generation, rights verification or exact-head rendered inspection cannot be completed, no unsupported image is published.

## Visual gaps and review

When a useful diagram remains unavailable after assessing both structured and image options, record `VISUAL GAP` in the PR with the relationship to explain, a proposed diagram and the precise missing capability or evidence. The Reviewer searches for an existing matching follow-up and creates/updates one ordinary issue rather than generating duplicates. This is a record of missing capability, not authority to expand the renderer/schema/guard in the scheduled task. Normal technical review is still required for such changes.

Review every included figure at 320/393/1440 px in both editions: source support, meaningful symbols/relationships, readable text, no overlap/clipping/overflow, captions/alt/full-text equivalence and correct placement. Check light/dark and no-JavaScript behaviour. For a raster, verify successful decoding and exact natural dimensions. A confused, inaccurate or decorative diagram is an IMPORTANT finding, even when every geometry test passes. The existing `FIGURE: PASS/OMIT/REWORK` record remains required.

## Verification

Canonical validation and the trusted guard share toolkit-data and raster-container checks. Hostile tests cover unknown fields/styles/symbols, markup/layout instructions, invalid counts/numbers, missing or unreferenced assets, unrelated slugs, executable/symlink modes, disguised SVG, wrong dimensions/sizes and noncanonical/oversized base64. The adapter test exercises pinned binary reads without candidate execution.

`/figure-fixtures/toolkit` is emitted only in the existing browser-fixture build (`FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE` set), never the normal production build. It exercises every new treatment and a reviewed PNG through the actual reading component. Browser tests capture exact-head phone/wide light/dark screenshots and verify proportional lengths, accessibility, label geometry, no-script reading and WebKit rendering. Daily raster lessons are also discovered through the canonical loader and checked individually. Production build/static integrity still rejects unexpected outputs; the fixture is not added to discovery or any lesson catalogue.
