# ADR-0005: Separate Adult and Teen presentation URLs

Status: Proposed
Date: 2026-10-02
Owner direction: approved for incorporation into the proposed architecture; final architecture approval remains pending.

## Context

Five Minutes has one underlying lesson identity with Adult and Teen presentations. The two presentations may have substantially different titles, descriptions, examples and body text.

Using one URL for both presentations creates ambiguity for document metadata, sharing, search indexing and non-JavaScript behaviour. Selecting the edition dynamically on the server would introduce runtime and cache complexity solely to avoid distinct URLs.

The edition-delivery choice also affects the rendering benchmark because two presentation URLs can produce approximately two HTML pages per lesson when both editions exist.

## Decision

Use one canonical lesson identity with separate presentation URLs for Adult and Teen editions.

The exact final URL syntax remains a later routing detail, but the semantic contract is:

- an explicit Adult URL renders the Adult presentation;
- an explicit Teen URL renders the Teen presentation;
- browser-local edition preference may improve navigation but never changes the meaning of an explicit URL;
- both Adult and Teen presentations are required for publication;
- drafts on branches may be temporarily incomplete while generation is in progress, but incomplete lessons are not publication-eligible and generate no production routes;
- Adult and Teen presentations share lesson identity, publication metadata, taxonomy, provenance and relationships;
- search/catalogue representations are edition-aware;
- Saved/Read state is keyed by immutable lesson identity, not slug or presentation URL, so editions do not become separate saved lessons.

Appropriate canonical/alternate metadata between presentations will be defined during routing/SEO implementation.

## Alternatives considered

### One URL containing both presentations

Rejected as the target model because it makes edition-specific metadata and sharing ambiguous, sends unnecessary content to readers, and makes the non-JavaScript representation less clear.

### One URL with dynamic server-side edition selection

Rejected because it introduces runtime/caching complexity and makes the URL itself insufficient to identify the shared presentation.

## Consequences

- Each edition has correct HTML metadata and a meaningful shareable URL.
- The architecture remains compatible with fully static rendering.
- The number of generated lesson pages may approach twice the number of lesson identities, so rendering/file-count benchmarks must model this decision explicitly.
- The lesson schema must separate immutable identity from mutable slug and model Adult/Teen presentations explicitly.
- Local reader state must use immutable lesson IDs.
- Search and catalogue generation must respect the selected edition.

## Follow-up

The two-presentation rendering benchmark has been completed and is reflected in ADR-0002. Exact route syntax and canonical/alternate metadata are bounded implementation details under this semantic contract.
