# Security & AI Governance

## Threat model highlights

### Unauthorized order discovery
A person may know products purchased but not be the customer.

**Control:** purchase context may identify candidate records, but the system does not disclose protected details until step-up verification succeeds.

### Prompt injection / tool misuse
A user may attempt to convince the agent to bypass controls.

**Control:** authorization exists in the deterministic tool/API layer, not only in the prompt.

### Hallucinated transactional facts
An LLM may invent a payment, ETA, pickup status, or invoice.

**Control:** transactional statements must originate from approved system tools. If data is missing, respond that it cannot be confirmed.

### Excessive data exposure
Search results could expose other customers or multiple candidate orders.

**Control:** minimize results, mask contact information, and never enumerate unrelated candidates to the representative/customer flow.

## Human-in-the-loop triggers

Escalate when:

- identity cannot be verified;
- more than one candidate order remains after approved disambiguation;
- transactional services disagree;
- payment correction/refund is requested;
- address modification is requested after shipment;
- order cancellation requires approval;
- an invoice or financial record requires correction.

## Audit events

Minimum events:

- user request
- intent/tool selection
- authorization decision
- identity challenge and result
- each tool invocation
- data disclosure decision
- human escalation
- action completion/failure
