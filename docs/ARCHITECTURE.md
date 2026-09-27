# Architecture

## Architecture decision

The portfolio demo separates **agent reasoning** from **transactional truth**.

The agent may interpret intent and decide which tool to call, but it may not invent order status, payment registration, pickup readiness, shipment events, or invoice state.

## Production logical layers

1. **Experience layer** — call-center workspace.
2. **API layer** — Python FastAPI.
3. **Agent orchestration** — intent/tool selection, prompt/policy context, response composition.
4. **Policy enforcement** — authorization, data minimization, allowed tools, step-up verification.
5. **Integration layer** — ERP/order APIs, payment, warehouse/store, carriers, invoice service.
6. **Data layer** — PostgreSQL via SQLAlchemy where direct governed SQL access is justified.
7. **Observability layer** — audit events, latency, tool success/failure, escalation and unsupported-response metrics.

## Why Python + SQLAlchemy + PostgreSQL

- Python is a natural fit for AI orchestration and API services.
- SQLAlchemy abstracts database access and supports parameterized ORM/Core queries.
- PostgreSQL is the proposed relational target for the portfolio architecture.
- FastAPI provides typed service contracts and OpenAPI documentation.

## Agent tools

Suggested allow-listed tools:

- `order.search_candidates()`
- `order.get()`
- `payment.get_status()`
- `fulfillment.get_pickup_status()`
- `shipment.get_tracking()`
- `invoice.get_status()`
- `invoice.send()`
- `identity.request_otp()`
- `identity.verify_otp()`
- `case.escalate()`

Each tool should perform its own authorization checks; agent instructions alone are not a security boundary.

## Production deployment options

The portfolio repo does not require cloud spend. In a real implementation, these components could run in AWS, Azure, GCP, on-premises, or another governed platform according to enterprise standards.
