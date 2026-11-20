# Questions and blockers for the founder

Each entry: the question, what it blocks, and the agent's recommended default.
The agent keeps building around these using configuration placeholders; it
does not decide them. Mark an entry `ANSWERED` with the answer and date when
resolved.

## Open

### Q1 · What should happen to PR #5 (creator commerce demo)?

- **Blocks:** nothing in V2; the agent ignores it.
- **Context:** pre-pivot demo from 12 September; conflicts with V2 on the app
  entry, README and decisions log, and includes a multi-retailer bag that V2
  rules out.
- **Recommended default:** close it unmerged and keep the branch as a visual
  reference.

### Q2 · Can a Supabase development project be provisioned?

- **Blocks:** live verification of Supabase Auth and Storage (WP-05, WP-12).
  Everything else is tested against local Postgres.
- **Recommended default:** a separate dev project in the intended data region,
  never shared with production; keys added as environment secrets, not in chat.

### Q3–Q10 · Handover §18 decisions (unchanged)

Launch market and data region · meaning of "verified" and who reviews ·
affiliate operating model and commission split · subscription price ·
try-on provider · retailer/network agreements · retention periods and lawful
basis · pilot experiment thresholds. See
[`GLOWDESK_V2_IDE_HANDOVER.md`](../GLOWDESK_V2_IDE_HANDOVER.md) §18.

## Answered

None yet.
