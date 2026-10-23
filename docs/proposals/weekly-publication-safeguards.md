# Weekly publication: safeguard inventory
**Draft implementation reference for [the proposal](weekly-publication.md).**

Assessment baseline: main `15724378d9cc459e28b46b36a04fe382bd4d12ac`, 22 October 2026. This preserves the reviewed responsibility inventory; it is not active policy or authorisation to change safeguards.

Consult relevant rows when preparing implementation changes. Routine scheduled writers/reviewers should use the resulting canonical role instructions, not load this entire reference. Exact state transitions and tests belong in the implementation ADR. The earlier assessment and source links remain in [the historical draft](https://github.com/nunov00/five-minutes/blob/9fef46b48fd454efd688afdd38d8e3b152c05f61/docs/proposals/weekly-publication.md#appendix-b-evidence-map).

## Responsibility decisions

“Keep” preserves the responsibility; “simplify” changes its mechanism under reviewed rules; “drop” removes a daily-specific obligation. No row itself grants implementation authority.

| Existing responsibility | Decision | Weekly treatment and reason |
| --- | --- | --- |
| Current-main policy loading; untrusted input handling | Keep | Candidate text, feedback and external pages remain data, not authority. |
| Off switch and paused-task controls | Keep | Stop before authoring or publication; preserve a simple emergency pause. |
| Lightweight completion entry | Simplify | Check the weekly release/checkpoint, not today's lesson; avoid full work after verified completion. |
| Seventeen daily dispatches | Drop | Replace with three purposeful weekly opportunities. |
| Midnight preparation, 02:00 review boundary, 14:00 cutoff | Drop | Replace with stage permissions and the weekly target. |
| One-per-day release slot and same-day expiry | Simplify | Weekly slot ownership and carry-forward follow the proposal's carry-forward principle; implementation ADR defines transitions. |
| Actual clock, timezone and clock-change handling | Keep | Europe/Zurich for targets; truthful timestamps. |
| Candidate discovery, duplicate checks and one active candidate | Keep | Resume actual work before creating anything new. |
| Evergreen/topic/source eligibility | Keep | Cadence does not itself broaden allowed subject risk. |
| Ranked selection and rationale | Keep | Selection remains reviewable and grounded in the catalogue. |
| Daily full-pool reranking and same-day assessment dates | Simplify | Refresh once per production cycle or on material new evidence. |
| Queue preservation, completion and duplicate protection | Keep | No lost records or completion before actual publication. |
| Daily queue additions/shortfall reporting | Simplify | Maintain a useful shortlist without forced weekly idea generation. |
| Clear-English self-edit and causal explanation | Keep | Rewrite into positive, concise editorial criteria. |
| Figure/activity assessment | Simplify | A planned visual package; optional useful activities; no template-first preference. |
| Asset scope, byte/container and provenance checks | Keep | Extend explicit bounds for three visuals under the reviewed new contract. |
| Trusted-main submission preflight and generated branch rules | Keep | Catch malformed submissions before remote CI. Adapt date/asset rules. |
| baseline, e2e, lesson-guard and privacy checks | Keep | Retain exact-head success and workflow-provenance verification. |
| Source and exact-head rendered inspection | Keep | Review artwork and complete reading experience, not metadata alone. |
| Writer/Reviewer role separation | Keep | Writer cannot turn its draft assessment into publication approval. |
| Advisory feedback retrieval and final refresh | Keep | Address substantive available feedback; absent optional reviewers do not block by themselves. |
| Delegate hand-off, overlap and interruption reconciliation | Simplify | Retain bounded ownership, fresh review context and real outcome evidence; consolidate duplicate ledgers where equivalent protection is demonstrated. |
| Execution-failure retry cap | Keep | One mitigated retry of the same cause, then diagnosis; no unchanged repeat attempts. |
| Three daily revision rounds and daily reservation ledger | Simplify | Use the proposal's candidate budgets and escalation rules, retaining durable head-linked history. |
| Immutable identity, provenance and prior dates | Keep | Target publication date is distinct from those immutable facts. |
| Stale-base handling | Simplify | Permit a documented normal refresh onto current main, stop on conflicts, verify scope and rerun checks/review. No silent force rewrite or stale approval. |
| Reviewer does not edit lesson content | Keep | Findings return to the Writer. |
| Expected-head merge and no saved-approval shortcut | Keep | Recheck actual head, base, slot, findings and checks immediately before merge. |
| Post-merge checks, deployment/live-route verification | Keep | Distinguish merged from demonstrably published. |
| Separate technical-recovery PRs and excluded high-risk repairs | Keep | A lesson run cannot widen its own permissions or weaken gates. |
| Technical retry/repair budgets tied to a day | Simplify | Bind documented budgets to the weekly candidate/incident; no reset on a new day. |
| Two failed-day queue parking | Simplify | Escalate recurring blocked causes/round-limit failures; non-editorial carry-forward preserves work and budgets without silently parking or replacing it. |
| Corrections outside routine candidate work | Keep | Prompt factual corrections need their normal reviewed path. |
| Anonymous feedback, aggregate analytics and privacy | Keep | Use existing facilities without additional personal tracking. |
| Branch cleanup | Keep | Disposable branches still have a defined lifecycle. |
| Activation, prompt readback, audits and rollback | Simplify | One concise canonical weekly contract, verified configuration, one documented rollback path. Do not re-enable daily publication as an unapproved rollback. |
| Historical timing amendments and duplicate role instructions | Drop | Archive history in Git; remove superseded active instructions after checking references. |
