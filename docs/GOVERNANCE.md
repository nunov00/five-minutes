# Five Minutes — Project Governance

## 1. Purpose

This document defines how the Five Minutes project is managed, developed and maintained.

The repository is the authoritative source for project governance, architecture, code and technical documentation. All contributors — human or AI — must follow the rules documented in the repository rather than relying on assumptions or previous conversations.

The objective is to maintain a simple, reliable and adaptable system that can evolve without unnecessary architectural complexity or technical debt.

## 2. Roles

### Owner

The project Owner has final authority over product direction, priorities, significant architectural decisions, material user-facing changes, production strategy, significant external services or costs, privacy decisions and project governance.

The Owner may delegate implementation and routine technical decisions without giving up final authority.

### Manager

The Manager maintains the overall coherence of the project. ChatGPT normally performs this role.

Responsibilities include:
- Translating Owner objectives into technical work.
- Planning and decomposing work.
- Maintaining architectural consistency.
- Coordinating contributors.
- Assigning or recommending work to appropriate Workers.
- Reviewing proposed architectural changes.
- Ensuring documentation remains current.
- Ensuring appropriate testing and review.
- Integrating completed work.
- Identifying decisions requiring Owner approval.

The Manager may also act as a Worker or Reviewer.

### Worker

Workers perform bounded project tasks. Workers may include ChatGPT, Claude, other AI systems and human contributors.

Workers must understand the relevant repository documentation before making changes. They should implement within the established architecture rather than redesigning the system as part of an unrelated task.

If a Worker identifies a better architectural approach, it should be proposed rather than silently introduced.

### Reviewer

The Reviewer independently evaluates proposed changes for correctness, maintainability, architectural consistency, security, performance where relevant, test coverage, regressions and unnecessary complexity.

Worker and Reviewer are roles, not permanently assigned systems. Claude may implement a change and ChatGPT review it, or vice versa.

## 3. Source of Truth

The GitHub repository is the authoritative project record.

Repository documentation takes precedence over assumptions made by individual contributors. Important decisions should not exist only inside conversations with ChatGPT, Claude or another contributor.

Decisions that materially affect the project should be captured in repository documentation, Issues, Pull Requests or Architecture Decision Records (ADRs), as appropriate.

If repository documentation conflicts with a current explicit instruction from the Owner, the Owner's instruction takes precedence and the repository should subsequently be updated.

## 4. Authority Boundaries

The project uses three authority levels. The Manager has broad technical autonomy within an approved architecture, but narrow product autonomy.

### Level 1 — Routine: Manager decides

The Manager may decide and execute routine technical work without Owner approval when the change:
- Remains within the documented architecture.
- Does not materially change user-facing product behaviour.
- Does not introduce a significant dependency or external service.
- Does not materially increase operating cost.
- Does not weaken security, privacy or reliability.
- Is reasonably straightforward to reverse.

Examples include bug fixes, refactoring, tests, dependency patch updates, internal APIs, CI improvements and routine implementation choices.

Workers may make bounded implementation choices within their assigned task and these same constraints.

### Level 2 — Significant: Manager proposes, Owner approves

Owner approval is required before implementation for changes such as:
- A new major module or subsystem.
- Database or persistent-data schema changes with material consequences.
- A significant new dependency or service.
- A substantial cross-component refactor.
- Material changes to deployment or infrastructure.
- Changes that significantly constrain future development.
- Destructive or difficult-to-reverse technical changes.

The Manager should present the recommendation, relevant alternatives and trade-offs rather than passing every underlying technical question to the Owner.

### Level 3 — Product or strategic: Owner decides

The Owner decides:
- New product features or material changes to existing features.
- Product and UX direction.
- Major architectural changes.
- Collection or storage of additional user data.
- Monetisation strategy.
- New paid services or material recurring costs.
- Significant privacy or security policy changes.
- Changes to governance.

### Architecture mandate

Manager autonomy increases once architecture has been explicitly approved.

During architecture design, important choices should be discussed carefully with the Owner. Once an architecture or ADR is approved, it becomes the Manager's mandate to coordinate and implement work within those boundaries without repeatedly requesting approval for routine implementation details.

The Manager should protect the Owner from unnecessary technical decisions by resolving routine questions and escalating only decisions with meaningful product, architectural, cost, privacy, security or long-term consequences.

When genuinely uncertain about the appropriate authority level, escalate rather than silently assume approval.

### Standing merge authorisation (Owner instruction, 2026-10-03)

The Owner authorises the Manager to merge qualifying Pull Requests without a separate final approval request and to inform the Owner afterwards. This delegation also covers bounded technical clarifications to an existing ADR, such as PR #52's canonical URL amendment, when they remain within the agreed project direction.

Before merging, the Manager must verify that:
- all required automated checks have passed on the exact current PR head; required tests must actually run, not be skipped;
- any preview/deployment verification required by the change's scope and risk has succeeded for that head;
- the required independent review is complete for that head, with no unresolved BLOCKER or IMPORTANT findings;
- remaining MINOR findings are explicitly non-blocking and are resolved or recorded as follow-up work;
- the change stays within the Owner-authorised scope and does not introduce an unapproved product, major architecture, cost, privacy, security or destructive decision.

Record the readiness evidence and use an expected-head SHA guard when merging. A changed head requires fresh checks and appropriate re-review. After merging, inform the Owner concisely of what merged, the validation result and any remaining follow-ups; verify the resulting production checks/deployment where applicable and report failures.

This is standing authorisation for the final merge gate, not permission to bypass quality checks or expand project scope. Decisions reserved to the Owner still require approval before implementation unless already explicitly delegated. Once that decision or scope is authorised and the gates above pass, do not ask for the same approval again.

## 5. Development Workflow

Substantial development should normally follow:

**Objective → Issue/Task → Implementation → Tests → Review → Preview → Merge authorisation → Merge → Production**

Merge authorisation may come from the standing delegation in section 4; a separate Owner confirmation is needed only for a decision outside existing authorisation.

Changes should normally be associated with a clearly defined task or GitHub Issue and implemented on a dedicated branch.

Changes to `main` should normally happen through a Pull Request.

Pull Requests should explain:
- What changed.
- Why it changed.
- Important implementation decisions.
- Tests performed.
- Known limitations or risks.

Automated checks must pass before merging unless an explicit exception is approved.

## 6. Architecture

Architecture should be deliberate rather than emerging accidentally from individual implementation tasks.

The documented architecture is the default constraint for contributors. Workers must not introduce significant architectural changes merely because another approach appears preferable during implementation.

A proposed architectural change should describe the problem, proposed change, alternatives considered, benefits, costs and complexity, migration implications, and future constraints created by the decision.

Significant decisions should be recorded using an ADR or equivalent documentation.

Architecture should favour modularity, clear interfaces, low coupling, maintainability, testability, portability where practical, and simple solutions over unnecessary complexity.

Premature complexity should be avoided, but short-term convenience should not create unnecessary long-term constraints.

## 7. AI Collaboration

AI contributors are project participants, not independent authorities.

Before substantial work, an AI contributor should review the relevant governance, architecture, contributor instructions, existing implementation and relevant Issues or ADRs.

AI contributors should clearly distinguish between existing project decisions, Owner requirements, and their own recommendations or assumptions.

AI contributors must not silently reinterpret project requirements. When ambiguity could materially affect the result, clarification should be requested or the assumption explicitly documented.

AI contributors are encouraged to challenge existing approaches when they identify genuine problems, but architectural or product changes should be proposed before being introduced.

Different AI systems may deliberately be used for implementation and review to provide independent perspectives. No AI-generated change is exempt from normal project quality requirements.

## 8. Quality Gates

A change is not complete merely because it works in the contributor's immediate test.

Depending on scope and risk, quality checks may include:
- Build validation.
- Static analysis.
- Unit and integration tests.
- Playwright end-to-end tests.
- Desktop and mobile behaviour.
- Accessibility checks.
- Broken-link checks.
- Performance checks.
- Security checks.
- Cloudflare preview deployment.

Critical user journeys should eventually be represented by automated Playwright tests.

A regression discovered in production should, where practical, result in a test that prevents recurrence.

## 9. Reviews

Reviews should evaluate the change rather than simply confirm that it runs.

Reviewers should challenge unnecessary complexity, architecture violations, fragile implementations, undocumented behavioural changes, missing tests, unnecessary dependencies, and solutions that solve the immediate task while creating avoidable future constraints.

Minor changes may use proportionally lighter review. For significant changes, independent review by a contributor other than the implementer is preferred.

### Review communication and record

For Pull Request work, technical review communication should be recorded directly on the Pull Request whenever practical. Reviewers should post actionable findings there, using inline comments for code-specific findings and a summary comment or review for the overall result. Findings should be classified consistently when useful (for example BLOCKER, IMPORTANT and MINOR).

Workers should respond to review findings on the Pull Request, push fixes to the existing branch, and record enough context for a later contributor to understand how significant findings were resolved. Re-review results should likewise be recorded on the Pull Request.

The Owner should receive concise summaries and make decisions that require Owner authority, but should not normally have to relay technical messages between Workers, Reviewers and the Manager. Repository discussion is the authoritative engineering record; chat conversations are coordination surfaces rather than a substitute for that record.

## 10. Documentation

Documentation is part of implementation.

A change that makes relevant documentation incorrect or incomplete should update that documentation in the same Pull Request.

Documentation should describe the current system rather than preserve obsolete implementation history. Important historical architectural decisions should be retained through ADRs.

## 11. Production

`main` represents the authoritative production-ready state of the project.

Production deployments should originate from the repository rather than undocumented local changes. Cloudflare production should therefore be reproducible from the repository.

Where practical, Pull Requests should receive preview deployments so changes can be evaluated before merging.

Direct manual modifications to production should be avoided. Emergency changes should subsequently be reconciled with the repository immediately.

## 12. Simplicity Principle

Five Minutes should remain understandable.

A contributor should not introduce additional frameworks, services, abstractions or infrastructure unless they solve a concrete problem.

The preferred solution is generally the simplest solution that:
1. Meets the current requirement reliably.
2. Fits the established architecture.
3. Can reasonably accommodate foreseeable requirements.
4. Can be tested and maintained.
5. Does not create unnecessary future constraints.

Complexity must justify itself.

## 13. Governance Changes

This document should evolve as the project evolves.

Governance changes require Owner approval. Changes should improve the project's ability to deliver reliable software rather than add process for its own sake.
