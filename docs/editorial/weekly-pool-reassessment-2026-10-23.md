# Weekly pool reassessment — 23 October 2026

**Draft decision record for independent review.** Implements the one-time assessment requested by [weekly topic selection](../proposals/weekly-topic-selection.md), following #188 and #189. Assessed main: `eb626c97d05c64cb815baf9b192a46e6119e2c03`.

## Recommendation

Use **Why a butterfly can be blue without blue pigment** for the calibration lesson, subject to source verification and the visual capability test. **Why a steel ship floats while a steel bolt sinks** is the first alternative; **How a hard kernel becomes a piece of popcorn** is the second. These are recommendations, not approved lessons or a publication date.

The butterfly topic asks whether we can make an arresting illustration and still teach a precise mechanism across scales. It is not selected merely because the animal is beautiful. The ship is more immediately familiar, but tests less of that range. Popcorn has a good transformation to explain, but needs full-text access resolved. Do not use a simpler special production path for the pilot: apply #188's setup and calibration limits, then demonstrate repeatability on a different topic within its regular limits.

The strongest legacy challenger is aircraft-window geometry, ranked fourth. Its mechanism and sources are strong; stress depiction and historical caveats make it less balanced as the first art-and-explanation test. Newness earns no priority. Imports have no migration quota or entitlement, and no deferred entry is promised a later release.

## Scope and counts

The original 75 records remain in order, with all original values preserved; assessment notes are appended to existing criteria. The 60 queued entries were screened: **5 keep, 2 develop as reserves, 51 defer, 2 defer for prompt correction**. Three fresh challengers bring the pool to **78 records / 63 queued**. Five retained candidates plus three fresh ones form the proposed eight; two reserves bring the developed set to ten.

The 12 accepted revisions and three completed records remain in their states. There are no parked records or other unfinished states. Accepted does not mean newly re-reviewed; completed does not mean reopened. The former Adult/Teen comparison is historical evidence, not a reason in itself to revise a single-version lesson. Its original criteria remain visible.

**Activation boundary:** this PR adds the three ideas and records assessment findings in `editorial/backlog.json`. Its existing ten-item daily `pipeline` is byte-for-byte equivalent as a parsed value. The proposed eight below do not become the active ranking. The coordinated policy/tooling PR must replace daily selection/refresh rules and validate the permanent six-to-eight rule before applying this order; no fabricated shortfall or unsupported JSON fields. Deferred means unranked in that proposed weekly list; old daily ranks are explicitly not reassessed production instructions. Schedules, off switches, publication rules, lesson files and routes are untouched.

## Proposed weekly shortlist

All eight have a distinct explanatory question, a connection to non-specialist understanding, accessible evidence for the central idea and a plausible 4–6-minute treatment. Source notes below distinguish abstract/extract reading from a full authoring audit. Each still needs the Writer's complete source and feasibility checks.

| Rank | Candidate / existing key | Why this position | Evidence |
| --- | --- | --- | --- |
| 1 | **Why a butterfly can be blue without blue pigment** — `idea-why-morpho-wings-look-blue` (new) | Best combined test of expressive illustration and a precise explanation across scales; the mechanism, not the butterfly alone, must carry the lesson. | [morpho](#source-morpho), [morpho-image](#source-morpho-image) |
| 2 | **Why a steel ship floats while a steel bolt sinks** — `idea-why-steel-ships-float` (new) | Clearest alternative and a real explanatory payoff; ranks second because it is a more familiar school example and tests the new visual range less strongly. | [ship](#source-ship) |
| 3 | **How a hard kernel becomes a piece of popcorn** — `idea-why-popcorn-pops` (new) | A familiar object with an unexpectedly physical mechanism; third because the source-access limitation must be resolved and a sequence can easily become decorative. | [popcorn](#source-popcorn) |
| 4 | **Why aircraft windows have rounded corners** — `legacy-aircraft-pressurisation` (import) | Strongest legacy challenger. Excellent causal stakes, but a precise stress illustration and historical caveats make it a less balanced first demonstration than the leading pair. | [aircraft](#source-aircraft) |
| 5 | **How some concrete cracks can seal themselves** — `legacy-roman-concrete` (import) | Strong surprise and visual opportunity; fifth because abstract-level research is not enough for a finished chemical diagram. | [concrete](#source-concrete) |
| 6 | **Why does a mirror seem to swap left and right?** — `idea-why-mirrors-seem-to-reverse-left-and-right` (new) | Strong everyday puzzle. Below concrete because its memorable distinction is valuable but the art treatment has less range; better after the pilot. | [mirror](#source-mirror) |
| 7 | **Why an unlikely message tells you more** — `legacy-shannon-information` (import) | Eligible under the broad reader promise. Seventh because mathematical setup consumes more of the five-minute experience and competes with recent probability coverage. | [shannon](#source-shannon) |
| 8 | **Why Greenland changes size when the map changes** — `lesson-b6fbc2e0-bcad-4ad7-8336-2fed9576e788` (revision) | Only shortlisted redevelopment. Substantial new explanation and exact maps would earn a weekly slot; lower priority than strong new lessons, rather than a compulsory archive upgrade. | [maps](#source-maps) |

Only rank 8 is a substantial redevelopment. It retains lesson ID `b6fbc2e0-bcad-4ad7-8336-2fed9576e788` and slug `why-every-flat-map-lies`. No weekly revision slots have yet been consumed because weekly publication has not started; it is provisionally slot-eligible, not scheduled. Recheck before selection: at most one redevelopment in every rolling four releases and at most one in the opening three. The leading three are new topics and do not need a revision slot.

**Reserves, not ranked:** `legacy-wifi-propagation` has a strong wall/coverage contrast, but frequency alone cannot explain every home's result; obtain primary propagation evidence and bound materials and distance. `idea-why-usb-c-cables-charge-differently` has a good connector-versus-capability puzzle; obtain current official negotiation/cable evidence without product recommendations. Neither gets through evidence eligibility on appeal alone.

**Why now / recent coverage:** this is an evergreen calibration choice, not a verified trend. The latest releases cover headphone cancellation, queues, condensation and QR codes. Structural colour shares a wave principle with headphones, but asks a different question about materials and visible colour; the overlap must be acknowledged, not sold as wholly unrelated physics. Ships revisit density but differ from ice packing and lake convection. Popcorn revisits heat but explains confinement and expansion rather than evaporation or condensation. The three pilot options lean towards physical mechanisms; this is not a commitment to a science-only calendar. Strong social, biological and mathematical topics remain in the pool.

No aggregate analytics or reader feedback was available in this assessment; rankings are AI-assisted editorial judgements, not measured demand. Before pilot reading, optionally ask the existing trial readers which of these three headlines they would open and why. That informs selection, not recall performance, and creates no additional panel or approval gate. Never put participant details in public planning.

## Three pilot briefs

These one-time review briefs are included here so selection can be reviewed with the reassessment. After acceptance, put the selected brief and later cycle notes in the single standing planning issue described in #188/#189; do not establish recurring brief-only PRs or a second operational queue.

### 1. Recommended — Why a butterfly can be blue without blue pigment

Key: `idea-why-morpho-wings-look-blue`. Sources: [morpho](#source-morpho), [morpho-image](#source-morpho-image).

Title: Why a butterfly can be blue without blue pigment. Description: Follow a blue morpho wing from its visible colour down to the tiny structures that shape reflected light.

The retellable idea is that colour can come from structure as well as dye. Start with the puzzle of a brilliant wing that looks brown when viewed using transmitted light. Move from the whole wing to overlapping scales, then explain how light reflected from their tiny features can reinforce some wavelengths. Acknowledge that the real structure also involves diffraction and irregularities; a neat stack of identical layers is only a limited teaching model. Brown pigment still helps the appearance.

Plan one expressive, naturalistic lead illustration and a separate, sourced cross-section. Labels, light paths and scale changes belong in an exact diagram, not in the generated artwork. Use a restrained palette so the blue is purposeful and the explanation remains legible on a phone.

End by asking what could change the colour without adding a different dye. Avoid implying all butterflies use this mechanism. The pilot succeeds only if a reader can explain structure versus pigment after the visual spectacle has passed.

### 2. Alternative — Why a steel ship floats while a steel bolt sinks

Key: `idea-why-steel-ships-float`. Sources: [ship](#source-ship).

Title: Why a steel ship floats while a steel bolt sinks. Description: The difference is not a special kind of steel: it is how the hull makes room for displaced water.

The retellable idea is that a floating ship displaces water with the same weight as the entire ship and its load. Begin with the apparently contradictory pair. Explain that water pressure increases with depth, producing a net upward force on an immersed body. Connect that force to displaced water, then show why a hollow hull can displace enough water before water spills inside. Use the same piece of foil as a compact lump and an open boat to keep material and mass fixed while shape changes.

Create an engaging harbour lead illustration, but use a separate exact cross-section for the explanation. Show a loaded and unloaded waterline, matched displacement and balanced forces at rest. No invented force magnitudes or decorative physics arrows.

Finish with a prediction about adding cargo. Avoid saying air pushes the ship upward, or that any wider shape is automatically stable. This is the fallback if the butterfly's optical diagram cannot be made clear within the agreed production budget.

### 3. Alternative — How a hard kernel becomes a piece of popcorn

Key: `idea-why-popcorn-pops`. Sources: [popcorn](#source-popcorn).

Title: How a hard kernel becomes a piece of popcorn. Description: A familiar snack hides a pressure vessel and a rapid change in structure.

The retellable idea is that a kernel's hull holds pressure until rupture lets its softened starch expand into a foam. Start with an unpopped kernel beside the expanded flake. Explain the sequence of heating its moisture, pressure building inside the enclosing hull, rupture and rapid expansion. Keep the expansion explanation separate from how the kernel jumps off a hot surface; the cited experiment observed a starch protrusion pushing against that surface.

Use a warm, detailed food illustration for the opening and a separately drawn cutaway for the mechanism. A compact state sequence should show what changes, rather than repeat the paragraph as boxes. Generated artwork must not pretend to be a scientific high-speed photograph or establish hidden anatomy.

End with a question about why the enclosing hull matters. Treat the reported popping temperatures as approximate experimental findings and any account of the sound with the paper's uncertainty. Before drafting, obtain readable full text beyond the search extract and verify the structural details.

## Treatments for the remaining shortlisted candidates

- **Why aircraft windows have rounded corners:** An opening's shape changes local stress under repeated pressure loading. Example: Compare identical cut-outs with sharp and rounded corners under the same illustrative loading. Visuals: Cabin illustration and a qualitative, labelled cut-out comparison; no fabricated numerical stress heatmap. Avoid: Fatigue, manufacturing and testing matter too; rounded windows are not a complete accident explanation.
- **How some concrete cracks can seal themselves:** Certain lime-rich inclusions can supply reactive material for crack filling when water enters. Example: Trace a crack that intersects a lime clast, distinguishing filling from full recovery of structural strength. Visuals: Evocative masonry lead and a carefully sourced chemical cross-section. Avoid: Do not generalise one mechanism to every Roman structure or confuse it with ordinary cement hydration.
- **Why does a mirror seem to swap left and right?:** Reflection reverses the direction perpendicular to the mirror; turning yourself around is a different transformation. Example: Keep a labelled hand fixed in world coordinates before comparing reflection with a physical turn. Visuals: Expressive mirror scene paired with an exact top-view orientation/ray diagram. Avoid: Generated scenes can silently reverse labels and hands; the geometric explanation must control the image.
- **Why an unlikely message tells you more:** Technical information measures reduced uncertainty, not a message's importance. Example: A deliberately specified four-outcome guessing game, then an unequal-probability event; state the model. Visuals: Editorial message illustration plus deterministic probability/choice diagrams. Avoid: Separate a single event's surprise from average entropy and avoid equating rarity with truth or meaning.
- **Why Greenland changes size when the map changes:** Keeping one map property accurate forces trade-offs in others. Example: Compare the same geography under Mercator and an equal-area projection using one verified dataset. Visuals: An illustrated globe opening, then exact matched projection panels and a simple local-distortion explanation. Avoid: Do not generate geographic outlines with imagegen, call conformal maps globally shape-preserving, or create a new identity.

## Evidence and research effort

Accessed 23 October 2026. These are selection-stage evidence notes, not permission to reuse source images or a completed factual review. A source failing later verification makes the candidate ineligible until resolved.

### Source morpho

[Kinoshita et al. (2002), original-paper abstract](https://forma.katachi-jp.com/abstract/1702/17020103.html)

Read abstract, not the linked full paper. Supports submicron scale structure, combined interference/diffraction and pigment's supporting role. Does not justify a perfectly regular multilayer model.

### Source morpho-image

[NISE Network, scientific-image record](https://www.nisenet.org/catalog/scientific-image-blue-morpho-butterfly-wing-non-reflected-light)

Read description: transmitted light reveals brown pigmentation. Use as a reference, not permission to copy the image.

### Source ship

[NOAA, Build a boat](https://www.noaa.gov/office-education/outreach-communication/hands-on-science-activities/build-a-boat)

Read transcript and buoyancy background. Supports displacement, pressure increasing with depth and a foil-boat example. At rest, buoyancy equals total weight.

### Source popcorn

[Virot and Ponomarenko (2015), original research, DOI 10.1098/rsif.2014.1247](https://pmc.ncbi.nlm.nih.gov/articles/PMC4345489/)

Search retrieval exposed abstract and experimental sections; direct open hit a bot check. Supports pressure-vessel rupture, starch expansion and observed jumping. Approximate temperature is an experimental result, not a universal exact threshold. Re-fetch full text before drafting.

### Source aircraft

[FAA, de Havilland Comet lessons learned](https://www.faa.gov/lessons_learned/transport_airplane/accidents/G-ALYV)

Read stress-concentration and testing sections. Supports local stresses around cut-outs, pressure cycling and misleading prior overload tests. Do not attribute every accident to passenger-window shape.

### Source concrete

[Original research repository, Hot mixing (2023), DOI 10.1126/sciadv.add1602](https://dspace.mit.edu/entities/publication/d114c164-bdc9-4faf-8cd2-bb5075acfc0e)

Read abstract only. Supports hot-mixing evidence and tested modern lime-clast mixtures' crack-filling potential; not proof all Roman concrete heals or fully regains strength. Full methods required before drafting.

### Source mirror

[OpenStax, University Physics Volume 3, 2.1](https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors)

Read image-formation explanation; search retrieval also exposed orientation discussion. Supports virtual-image geometry and front/back reflection. Diagram coordinates must be independently checked.

### Source shannon

[Shannon (1948), original paper reprint](https://www.princeton.edu/~wbialek/rome/refs/shannon_48.pdf)

Read introduction and logarithmic-measure discussion. Supports information as selection among possibilities and separation from semantics. Check the event-surprise/average-entropy derivation before drafting.

### Source maps

[Snyder, USGS Professional Paper 1395, NPS-hosted excerpts](https://www.oc.nps.edu/oc2902w/maps/synder.pdf)

Read general concepts, including area versus conformality. USGS landing page and full PDF returned 403; this government-hosted excerpt is accessible. Projection equations/dataset and generated maps still need verification.

Research work comprised manual AI-assisted screening of the 60 queued briefs, reading the 32 canonical lesson metadata/text pairs, developing three fresh challengers and comparing ten candidates using the source material above. No elapsed-time, token or monetary estimate was measured. **Image-generation requests used: zero.** This research does not spend or expand #188's four-request setup allowance. No external reader test, rendered visual audit or comprehensive source re-audit of the catalogue has been performed.

## Complete queued-pool screen

“Keep” means proposed shortlist, not publication approval. “Develop-reserve” is evidence-incomplete. “Defer” is an editorial choice with the identity and historical criteria preserved; no parked state or failed-day evidence is fabricated.

| Existing key | Screen | Reason |
| --- | --- | --- |
| `legacy-kidneys-urine` | defer | Near the published kidney-filtration lesson; establish a distinct concentration mechanism or redevelop that identity before ranking. |
| `legacy-habit-loops` | defer | The loop metaphor risks presenting a universal account of habits; needs a specific experiment and bounded causal claim. |
| `legacy-sleep-memory` | defer | Interesting, but broad memory-consolidation claims need a narrower mechanism and evidence brief. |
| `legacy-walking-creativity` | defer | An effect is easier to show than its cause; do not turn an unsettled mechanism into a confident walking prescription. |
| `legacy-pareto-principle` | defer | Too easily becomes an unsupported 80/20 rule; needs a real distribution and explanation of when it arises. |
| `legacy-circle-competence` | defer | Currently advice rather than a revealing mechanism; lacks a strong testable example. |
| `legacy-cognitive-offloading` | defer | Potentially useful, but GPS benefits and costs need a concrete, evidence-led distinction rather than a memory-loss story. |
| `legacy-time-perception` | defer | Several explanations of faster-feeling years compete; narrow the experience and uncertainty before developing. |
| `legacy-confirmation-bias` | defer | Familiar label needs a specific experiment and mechanism; abstract arrows would add little. |
| `legacy-predictive-processing` | defer | Self-tickling is promising, but the predictive-processing umbrella is broader than the claim; source the narrower mechanism. |
| `legacy-brooks-law` | defer | Needs explicit task-dependency conditions; a universal more-people-means-delay claim would mislead. |
| `legacy-diminishing-returns` | defer | A curve alone is not an explanation; find a concrete system that causes diminishing returns. |
| `legacy-smallpox-eradication` | defer | Strong historical story, but attribution and medical context require deeper sourcing than the current candidate brief. |
| `legacy-wifi-propagation` | develop-reserve | Everyday contrast and useful wall cross-section; not shortlist-eligible until primary propagation evidence bounds frequency, material and distance effects. |
| `legacy-roman-concrete` | keep | Specific crack-filling mechanism and cross-section potential; keep claims tied to lime clasts and the tested mixtures. |
| `legacy-aircraft-pressurisation` | keep | Strong familiar shape puzzle, primary FAA account and geometry/fatigue payoff; avoid a one-cause accident story. |
| `legacy-circadian-clocks` | defer | Good biological mechanism, but broad body-clock coverage needs a single synchronisation puzzle and source brief. |
| `legacy-queueing-theory` | defer-correction | Existing IMPORTANT comprehension finding remains actionable now; correct model-language outside the weekly redevelopment quota. |
| `legacy-simpsons-paradox` | defer | Worthwhile numerical reversal, but needs a credible example and careful causal limits; not just a paradox reveal. |
| `legacy-braess-paradox` | defer | Potentially strong route diagram; needs a small verified network and explicit behavioural assumptions. |
| `legacy-false-memories` | defer | Needs one bounded experimental result; avoid suggesting all recollections are equally unreliable. |
| `legacy-banana-monoculture` | defer | Strong biological stakes, but clone similarity, pathogen susceptibility and current disease evidence need separation. |
| `legacy-insurance-large-numbers` | defer | Needs an independent-risk example and correlated-loss limit; less immediate visual payoff than the leading candidates. |
| `legacy-shannon-information` | keep | Eligible abstract topic through a concrete message puzzle; distinguish event surprise, average uncertainty and meaning. |
| `legacy-shipping-container` | defer | Compelling history but diffuse causal chain; isolate one logistical constraint rather than claim containers alone caused global trade. |
| `legacy-haber-bosch` | defer | Strong industrial mechanism, but scope risks combining chemistry, agriculture and history; select one causal question. |
| `legacy-tail-latency` | defer | Too close to recent queueing coverage for the pilot; needs a distinct fan-out or percentile example. |
| `legacy-neural-networks` | defer | Overbroad; a single learning update with an honest limitation would be needed before ranking. |
| `legacy-cocktail-party` | defer | Attractive auditory puzzle, but overlaps recent headphone coverage and needs a bounded attention mechanism. |
| `legacy-antibiotic-resistance` | defer | Worthwhile evolutionary explanation; needs source-led treatment of selection without individual medical advice. |
| `legacy-signal-detection` | defer | Find a concrete decision and verified trade-off; avoid an abstract threshold diagram standing in for explanation. |
| `legacy-coriolis-effect` | defer | High diagram value but high frame-of-reference burden; source and test one moving-platform example first. |
| `legacy-concrete-hydration` | defer | Distinct from crack filling, but the stronger concrete candidate offers the clearer surprise; do not merge mechanisms. |
| `legacy-law-small-numbers` | defer | Useful sampling explanation, but recent coin lesson already treats small samples and probability intuitions. |
| `legacy-demographic-transition` | defer | Population momentum and demographic transition are different mechanisms; clarify which the headline promises. |
| `legacy-blood-type-matching` | defer | Needs a narrow red-cell compatibility explanation with component-specific medical caveats; not a generic donor chart. |
| `legacy-secret-ballot` | defer | Important institutional question, but historical and causal claims need a specific coercion mechanism and evidence. |
| `legacy-dark-adaptation` | defer | Strong future biological candidate; needs a sourced rod/cone mechanism and a diagram that goes beyond a dark-room scene. |
| `legacy-hidden-costs-externalities` | defer | Needs a concrete external cost and mechanism; generic private-versus-social-cost curves are not yet a distinctive lesson. |
| `legacy-regression-to-mean` | defer | Strong retellable idea, but needs a non-clinical worked example separating selection from causal improvement. |
| `legacy-tendon-springs` | defer | Promising anatomy and energy story; needs an accessible primary-source brief and tendon-versus-muscle distinction. |
| `legacy-pluralistic-ignorance` | defer | Recognisable social puzzle, but a specific study and limits are needed to avoid mind-reading groups. |
| `lesson-7cd5dca8-857f-49e5-8fd5-16a03658b0b7` | defer | Useful call-centre mechanism, but a redevelopment needs a richer causal example rather than extra terminology. |
| `lesson-99b24089-9f36-404c-8b44-8cb594115dac` | defer | Retain the working time-to-angle explanation; a future revision should demonstrate east and west explicitly. |
| `lesson-e38e6794-fa4d-466c-9aa8-b6c6f6e386e1` | defer | Existing error/response explanation works; former edition-depth comparison alone no longer warrants redevelopment. |
| `lesson-6bd86c0f-7cde-467c-abd1-ef6c8a2b51b1` | defer | Sound cycle already published recently; former edition comparison alone is insufficient reason for a new weekly slot. |
| `lesson-5d0eaefd-39c4-404e-9dbb-7e75e88474f6` | defer-correction | Needs a comprehension correction: bridge pixels to patterns with a concrete block example; do not wait for a weekly slot. |
| `lesson-3cebf076-45ac-49ea-9b01-bd0917fb1c13` | defer | Existing trophic chain is intelligible; improve only with a new explanatory contribution, not edition differentiation. |
| `lesson-a9181b9d-e382-44c1-9d61-a3913dd1eb70` | defer | Existing filtering/reabsorption account works; avoid adding a list of unexplained hormonal jobs. |
| `lesson-3d9b52ca-9082-4d28-9679-837e595df094` | defer | Existing free-fall explanation works; redevelopment must add a useful support-force example beyond the former edition comparison. |
| `lesson-c50774ec-4593-4557-b8df-ecc65e504566` | defer | Tilt and hemisphere contrast already teach the mechanism; equal edition depth is no longer a defect. |
| `lesson-b6fbc2e0-bcad-4ad7-8336-2fed9576e788` | keep | Keep for substantial redevelopment: an exact projection comparison can add explanation beyond the orange analogy; consumes a revision slot. |
| `lesson-1629895d-f11a-4bb7-afe5-8c8df5c07123` | defer | Existing doubling example works; require a new explanatory contribution before using a weekly revision slot. |
| `lesson-0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70` | defer | Below weekly explanatory depth: the clock-offset numbers outrun the account of position error; retain publicly and compete for substantial redevelopment. |
| `lesson-15944494-03f6-40a5-b7ab-2fd7192b6836` | defer | Open packing is intelligible; a deeper bond-geometry explanation must avoid duplicating the lake-freezing lesson. |
| `lesson-034c4a38-3d76-482a-83d8-ce1d8d59b5c2` | defer | Existing distinct-salt and costly-hash distinction works; former edition-depth comparison is insufficient. |
| `lesson-037395c2-7035-4e44-bf37-2e9c5c542da1` | defer | Existing numerical loss comparison works; a stronger visual would need to teach more than repeat the arithmetic. |
| `lesson-24b8d784-84b3-40ee-b873-40e9d67b52f9` | defer | Recognition-versus-recall account works; source limits and a concrete memory mechanism would be needed for redevelopment. |
| `idea-why-usb-c-cables-charge-differently` | develop-reserve | Strong practical puzzle; current official power-negotiation and cable-capability evidence is still required. No product recommendations. |
| `idea-why-mirrors-seem-to-reverse-left-and-right` | keep | Strong everyday puzzle with sourced reflection geometry; requires exact labelled orientation diagrams. |

## Published catalogue screen

This is an editorial **text screen** of all 32 current `adult.md` files with their metadata. “Sound” means no correction identified here, not certification against every new weekly criterion, fresh fact-checking or rendered/accessibility approval. Word count alone is not a defect. “Below minimum standard” concerns the proposed weekly explanatory experience and does not itself justify withdrawal.

**Prompt correction follow-ups:** queueing already has an IMPORTANT comprehension finding; JPEG also needs an accessible bridge into its central transform. Prepare separate lesson correction PRs through the existing path, outside the weekly quota; this PR neither fixes nor closes those findings. The retired Teen title finding remains historical, not work on an active edition. GPS stays publicly available while a substantial redevelopment competes on merit. No retirement is proposed.

Classifications are also appended to every existing revision record, including accepted records without reopening them. The three lessons without revision records are covered in this table; none needs a new correction record from this screen.

| Published slug | Classification | Observation |
| --- | --- | --- |
| `goodharts-law` | sound | The call-centre example connects target incentives to distorted measurement; no correction identified in this text screen. |
| `how-a-clock-found-longitude` | sound | Time difference is converted into longitude; an east/west worked pair would strengthen a future redevelopment. |
| `how-feedback-control-works` | sound | Error, corrective action and delay form a coherent causal explanation. |
| `how-heat-pumps-move-heat` | sound | Refrigerant cycle and electrical-input/heat-output distinction are present. |
| `how-jpeg-makes-photos-smaller` | needs correction | Pixels jump to discrete cosine transform and spatial-frequency patterns without an accessible bridge; add one small worked image. |
| `how-keystone-species-reshape-ecosystems` | sound | Otter/urchin/kelp chain explains indirect effects and includes a context limit. |
| `how-kidneys-filter-blood` | sound | Filtering followed by selective recovery explains why useful substances are not simply discarded. |
| `how-noise-cancelling-headphones-work` | sound | Opposing pressure waves, measurement and cancellation limits form a coherent mechanism. |
| `how-stainless-steel-renews-its-protection` | sound | Protective-film renewal and oxygen/chloride limits explain both resistance and failure. |
| `why-a-day-is-longer-than-earths-spin` | sound | Earth's orbital motion requires an extra turn to solar noon; the four-minute example develops it. |
| `why-astronauts-float-in-orbit` | sound | Shared free fall explains floating without claiming gravity disappears. |
| `why-bridges-need-room-to-move` | sound | Thermal expansion, a worked length change and restraint explain the gaps. |
| `why-damaged-qr-codes-can-still-work` | sound | Redundancy and error-correction limits explain partial damage tolerance. |
| `why-earth-has-seasons` | sound | Tilt, illumination and day length explain opposing hemispheres; brevity alone is not a correction. |
| `why-every-flat-map-lies` | sound | The curved-surface analogy explains unavoidable distortion; a projection comparison would justify redevelopment. |
| `why-every-rainbow-is-a-circle` | sound | Observer geometry and the horizon explain the visible arc and full-circle possibility. |
| `why-experts-skip-the-obvious-step` | sound | Concrete communication examples distinguish expert knowledge from a learner's missing step. |
| `why-exponential-growth-feels-sudden` | sound | Repeated doubling gives a retellable example and explains the misleading early appearance. |
| `why-gps-needs-einstein` | below minimum standard | For the proposed weekly experience, the clock-offset figures need a worked timing-to-position explanation; retain publicly, do not treat as a factual error. |
| `why-ice-floats-on-water` | sound | Open solid packing connects volume and density; deeper bond geometry is optional redevelopment. |
| `why-lakes-freeze-from-the-top-down` | sound | Water's density maximum and changing mixing behaviour explain the sequence. |
| `why-metal-feels-colder-than-wood` | sound | Rate of heat transfer is separated from temperature, with limits on contact and material behaviour. |
| `why-near-full-systems-make-you-wait` | needs correction | Carry forward the existing IMPORTANT finding: explain inter-arrival times, exponential distributions and steady state in plain English; calculations are not identified as erroneous. |
| `why-password-hashes-need-salt` | sound | Distinct salts defeat shared precomputation; expensive hashing addresses a different attack cost. |
| `why-power-lines-use-high-voltage` | sound | The same-power current comparison explains resistive loss; no correction identified in this screen. |
| `why-small-pushes-can-build-big-movements` | sound | Timed energy input and damping explain growth and its limit. |
| `why-sweat-needs-to-evaporate` | sound | Evaporation removes energy; humidity and the local air layer explain why sweat alone is insufficient. |
| `why-tails-is-not-due` | sound | Worked proportions distinguish dilution of an imbalance from repayment by future tosses. |
| `why-testing-yourself-works` | sound | Recognition and retrieval are distinguished with an explanatory study/example; extra edition depth is no longer required. |
| `why-the-moon-appears-in-daylight` | sound | Horizon overlap and phase-dependent timing explain daylight visibility. |
| `why-wastewater-plants-recycle-sludge` | sound | Separating water and solids residence times explains the return pipe and controlled wasting. |
| `why-windows-mist-up` | sound | Surface cooling and dew point explain condensation before the room feels damp. |

## Review and follow-through

Independent review should challenge the butterfly recommendation, source-to-claim limits, every keep/defer decision, actual overlap with existing lessons, and whether the planned visuals teach enough to justify production cost. Confirm exact coverage of the 60 old queued keys, preservation of all 75 original records and criteria, the three fresh identities, and the one-in-four redevelopment boundary.

After review, carry this assessment into the coordinated policy/tooling and visual-capability work. Apply the reviewed weekly order only when that activation is safe. Then research and produce the selected calibration lesson with its actual visuals, use the five-reader test in #188, and test the regular budget on another lesson. The next lesson PR must verify its complete causal chain; this document is not an authorisation to publish.
