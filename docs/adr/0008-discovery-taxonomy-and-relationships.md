# ADR-0008: Controlled discovery taxonomy and related lessons

Status: Accepted
Date: 2026-10-03
Owner approval: existing six-topic product direction confirmed for M5 on 2026-10-03.

## Context

M5 introduces Library, Topics, Search, Related and Surprise Me. These consumers need stable controlled values and useful connections without turning display labels, slugs or a search engine into canonical identity.

The representative corpus also showed that broad scientific labels alone hide useful reader distinctions: learning belongs under Human Mind, kidneys under Health & Human Body, and mathematical patterns under Mathematics & Thinking.

## Decision

The initial broad topics are:

- `science` — Science;
- `technology` — Technology;
- `human-mind` — Human Mind;
- `health-human-body` — Health & Human Body;
- `society` — Society;
- `mathematics-thinking` — Mathematics & Thinking.

`src/lib/taxonomy.ts` owns topic/subtopic tokens, display labels and descriptions. Canonical validation rejects an unknown topic or a subtopic used under the wrong parent. Empty topics are not rendered. Display copy may improve without changing lesson identity; changing the broad topic model is a product decision.

Related lessons continue to use immutable lesson IDs. Explicit editorial relationships and their specific reasons take priority. The application may then infer additional candidates deterministically from shared concepts, subtopic and topic, while respecting exclusions. A reading page shows two to four results, never itself, and keeps the reader's explicit Adult or Teen edition.

Search remains edition-specific compact metadata search under ADR-0003. The application-owned ranking interface may change without changing canonical lesson sources or public URLs.

## Consequences

- Library counts, Topics and search labels share one controlled vocabulary.
- A typo cannot silently create a new public topic.
- Editorially important connections can be explained rather than exposed as opaque scores.
- Related scoring remains replaceable and can evolve from measured catalogue behaviour.
- Taxonomy additions require coordinated validation, display and content updates, but not new infrastructure.
