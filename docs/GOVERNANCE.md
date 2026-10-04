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

The Manager may also act as a Worker or Reviewer, subject to the independence requirements in sections 7 and 9.

### Worker

Workers perform bounded project tasks. Workers may include ChatGPT, Claude, other AI systems and human contributors.

Workers must understand the relevant repository documentation before making changes. They should implement within the established architecture rather than redesigning the system as part of an unrelated task.

If a Worker identifies a better architectural approach, it should be proposed rather than silently introduced.

### Reviewer

The Reviewer independently evaluates proposed changes for correctness, maintainability, architectural consistency, security, performance where relevant, test coverage, regressions and unnecessary complexity.

Worker and Reviewer are roles, not permanently assigned systems. Claude (Anthropic) may implement a change and ChatGPT/Codex (OpenAI) review it, or vice versa. ChatGPT reviewing Codex work does not count as independent AI review.

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

### Maximise autonomous progress within approved scope (Owner instruction, 2026-10-03)

Owner attention is a scarce resource. Once the Owner approves a goal, scope, plan or PR direction, the Manager should carry out as many safe, in-scope steps as practical before returning control. Prefer one substantial Manager cycle over repeated requests to approve routine intermediate steps.

Implementation, tests, documentation updates, CI/deployment checks, in-scope failure fixes, review remediation, re-testing and merging when authorised do not require repeated Owner approval. Wait for required jobs to finish, inspect their results and resolve in-scope failures before reporting completion. A status update is not a request for further approval.

Escalate only when a material decision changes scope, architecture or risk; an external dependency requires Owner action; governance requires an approval not already given; or safe progress is otherwise blocked. Prepare a concrete, reviewable result and complete independent work before escalating. If an available different AI reviewer needs an Owner-relayed prompt, prepare one self-contained hand-off for the completed work and keep the merge pending.

This principle does not waive quality gates or authorise new product, architectural, cost, privacy, security or destructive decisions. The Owner's approval covers the agreed direction and its routine execution; do not ask for the same approval again.

### Standing merge authorisation (Owner instruction, 2026-10-03)

The Owner authorises the Manager to merge qualifying Pull Requests without a separate final approval request and to inform the Owner afterwards. This delegation also covers bounded technical clarifications to an existing ADR, such as PR #52's canonical URL amendment, when they remain within the agreed project direction.

Before merging, the Manager must verify that:
- all required automated checks have passed on the exact current PR head; required tests must actually run, not be skipped;
- any preview/deployment verification required by the change's scope and risk has succeeded for that head;
- the review required by section 9 for the PR's recorded classification is complete, with no unresolved BLOCKER or IMPORTANT findings;
- remaining MINOR findings are explicitly non-blocking and are resolved or recorded as follow-up work;
- the change stays within the Owner-authorised scope and does not introduce an unapproved product, major architecture, cost, privacy, security or destructive decision.

Record the readiness evidence and use an expected-head SHA guard when merging. A changed head always requires fresh checks; section 9 determines whether independent re-review is also required. After merging, inform the Owner concisely of what merged, the validation result and any remaining follow-ups; verify the resulting production checks/deployment where applicable and report failures.

This is standing authorisation for the final merge gate, not permission to bypass quality checks or expand project scope. Decisions reserved to the Owner still require approval before implementation unless already explicitly delegated. Once that decision or scope is authorised and the gates above pass, do not ask for the same approval again.

## 5. Development Workflow

Substantial development should normally follow:

**Objective → Issue/Task → Implementation → Tests → Risk-classified review → Preview → Merge authorisation → Merge → Production**

Merge authorisation may come from the standing delegation in section 4; a separate Owner confirmation is needed only for a decision outside existing authorisation.

Changes should normally be associated with a clearly defined task or GitHub Issue and implemented on a dedicated branch. Every Pull Request records one section 9 review classification and the reason it qualifies.

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

For this rule, independence is defined at the provider/model-family level: OpenAI products (including ChatGPT and Codex) count as one reviewer family; Anthropic products (including Claude and Claude Code) count as another. Different products, models, sessions or sub-agents from the same provider do not qualify as independent from one another.

When independent AI review is required by section 9, the Reviewer must use a different AI system from the implementer (for example, Claude reviews Codex work, or Codex reviews Claude work). A separate session, sub-agent or model within the same AI system does not by itself satisfy this requirement. Risk classification never exempts AI-generated work from normal project quality requirements.

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

### Review classification

Every Pull Request records exactly one classification in its description or as a repository label, together with a short reason:

#### `review:routine`

Independent different-provider review is not required when all of the following are true:

- the change stays within approved architecture and product behaviour;
- it is narrow, reversible and does not alter a public or stored-data contract;
- it does not change a security/privacy boundary, content trust boundary, canonical routing, publication/deployment behaviour, significant dependency/service/cost, or material factual content;
- focused tests and normal CI provide proportionate evidence.

Typical examples are tests, documentation corrections, mechanical migrations with verified identical output, small regression fixes, internal refactors with unchanged behaviour, and styling/accessibility corrections within an approved design. The Manager performs a focused diff review, records the evidence and may merge under the standing authorisation without a second AI reviewer.

#### `review:integration`

Related work inside an Owner-approved feature or ADR may be implemented in stages and receive one different-provider review at the integration gate rather than one review per staging PR. An intermediate PR may use `review:routine` only when it is independently production-safe, behaviour-neutral or inactive, reversible, and does not cross a mandatory-review boundary. A PR that activates material user-facing behaviour is itself the integration gate.

The integration Reviewer evaluates the cumulative feature range and the resulting system, not merely the final small diff. The review must complete before activation or milestone closure. This classification is useful for approved feature work whose individual scaffolding changes would otherwise create repetitive review ceremony.

#### `review:mandatory`

A different-provider review is required before merge for:

- governance changes and new or materially amended architecture/ADRs;
- security, privacy, authentication, authorisation or executable-content boundaries;
- stored-data formats or migrations that could lose or reinterpret reader data;
- canonical content parsing/validation, canonical URLs, redirects, publication automation or material deployment/infrastructure behaviour;
- significant dependencies, external services, recurring costs, destructive operations or difficult-to-reverse changes;
- material factual/editorial content or batches requiring review under `docs/EDITORIAL.md`;
- any change the Owner or Manager explicitly elevates because uncertainty or impact warrants another perspective.

Classification is based on the highest-risk part of the change. Splitting a high-risk change into small PRs does not turn it into routine work. When uncertain, elevate the classification or ask the Owner to resolve the boundary.

### Different-AI review and exceptions

When `review:integration` or `review:mandatory` requires independent AI review, use a different provider/model family from the implementer. The purpose is a genuinely different perspective, not another pass by the same system. Same-system verification may supplement the review but cannot silently replace it.

Exceptions are allowed only when a different AI system genuinely cannot perform the required review, or the Owner explicitly requests an alternative. Record the implementer and reviewer systems, the reason and any applicable Owner instruction on the PR. Needing an Owner-relayed prompt or lacking direct reviewer tooling does not by itself make review impossible; prepare one self-contained hand-off and keep the gate pending.

The independent Reviewer evaluates the relevant exact head or cumulative integration range, records actionable findings on the PR and distinguishes their own checks from implementer evidence.

### Review remediation

Every changed head must pass the required automated checks. Independent re-review is required when remediation:

- resolves a BLOCKER or IMPORTANT finding;
- changes security, privacy, factual/editorial, architecture, stored-data, content-validation, routing, publication or deployment behaviour; or
- materially broadens or redesigns the implementation.

The Manager may verify and merge a narrow MINOR-only remediation without returning it to the independent Reviewer when the fix is straightforward, covered by focused tests, introduces no new risk boundary and the PR records the verification. If the fix grows beyond those limits, reclassify it and obtain re-review on the final head.

### Periodic integration audit

At milestone integration gates, the different-provider Reviewer should sample recent `review:routine` PRs while evaluating the combined system. This is a check for classification drift and accumulated interactions, not a reason to replay every already-green routine review. Any actual defect or misclassification discovered is handled normally and may block milestone closure.

### Review communication and record

For Pull Request work, technical review communication should be recorded directly on the Pull Request whenever practical. Reviewers should post actionable findings there, using inline comments for code-specific findings and a summary comment or review for the overall result. Findings should be classified consistently when useful (for example BLOCKER, IMPORTANT and MINOR).

Workers should respond to review findings on the Pull Request, push fixes to the existing branch, and record enough context for a later contributor to understand how significant findings were resolved. When section 9 requires re-review, its result should likewise be recorded on the Pull Request.

### Risk-proportionate depth

Review depth follows the classification and likely impact. Mandatory architecture, security, content loading/validation, canonical URL, deployment and publication changes receive adversarial review: inspect implementation and tests, exercise important failure modes and verify the relevant head independently. Material lesson batches receive factual and editorial review under `docs/EDITORIAL.md`.

Routine review checks the focused diff, relevant tests and architectural fit. Integration review concentrates on cross-component behaviour and the cumulative feature. Reviewers should not repeat expensive unrelated checks merely to create ceremony.

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
