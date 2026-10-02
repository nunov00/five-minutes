# ADR-0004: Provider and technology portability

Status: Accepted
Date: 2026-10-02

## Context

Cloudflare is an attractive initial deployment target, but Five Minutes should not become expensive to move merely because of early infrastructure convenience. The same concern applies to search engines and AI providers.

## Decision

Treat provider-specific technologies as adapters, not domain foundations.

Core content, UI, lesson logic, publication rules and reader-state contracts must not directly depend on Cloudflare-specific APIs. Cloudflare-specific runtime/deployment code belongs at the adapter/configuration boundary.

Search is accessed through an application-owned interface. AI workers produce the repository's standard content/schema/PR outputs rather than provider-specific production state.

## Consequences

Changing hosting provider may require deployment configuration/adapter work but should not require rewriting content or core application logic. Replacing search or AI providers should similarly preserve the surrounding contracts. Provider-specific services may still be adopted later when their concrete benefit justifies the portability cost; such adoption requires an ADR.
