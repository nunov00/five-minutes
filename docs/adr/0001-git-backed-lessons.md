# ADR-0001: Git-backed structured lessons without an application database

Status: Proposed
Date: 2026-10-02

## Context

Five Minutes is primarily a publication. Lessons need independent history, AI/human review, validation and reproducible publication. Reader accounts and cross-device state are not initial requirements.

## Decision

Keep canonical lesson sources as individually addressable structured files in Git. Validate them at build/CI time. Do not introduce an application database for the initial product.

Build/runtime representations may be bundled, indexed or transformed independently of source representation.

## Consequences

Lesson changes are normal pull requests with history and review. AI workers can operate on discrete lessons. Backup/recovery follows Git. A future database remains possible if a concrete feature requires it, but it must not become the canonical lesson source accidentally.
