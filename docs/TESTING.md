# Jobwhistle — Quality Assurance & Testing Suite

---

## 1. Test Architecture

The testing suite verifies critical security controls, SSRF protections, Web Crypto operations, the incident state machine, and real end-to-end user workflows against a native in-memory SQLite engine without third-party mocks or paid infrastructure.

### Test Suites (`apps/api/tests/`)
- `integration.test.ts`: 25 end-to-end integration tests spanning:
  - **Workflow A (HTTP Monitoring)**: User registration, monitor creation, live probe execution, suspected state on 1st failure, confirmed open incident on 2nd failure, automatic recovery on 200 OK, downtime duration arithmetic, and pause/resume lifecycle.
  - **Workflow B (Heartbeat Monitoring)**: Heartbeat creation with secret token, cURL/HTTP check-in recording, missed check-in detection via deadline expiration, confirmed incident opening, automatic recovery upon check-in, and token rotation with immediate invalidation of old tokens.
  - **Workflow C (Multi-Tenant Workspace Security)**: Cross-tenant isolation verification ensuring User 2 receives 404 on attempting to view, patch, pause, or delete User 1's monitors or heartbeats, with overview metrics strictly isolated.
  - **Workflow D (Notification Reliability)**: Active channel registration, incident alert delivery logging, duplicate event suppression, and recovery alert dispatch.
  - **Workflow E (Cron Scheduler Security)**: Rejection of unauthenticated cron dispatches with 401, validation of `X-Jobwhistle-Cron-Secret` header, and authorized dispatch cycle execution.
- `ssrf.test.ts`: 10 comprehensive tests validating private IPv4 RFC 1918, private IPv6, NAT64 IPv4-mapped IPv6 (`64:ff9b::/96`), wildcard DNS services (`nip.io`, `sslip.io`, `localtest.me`), loopback, cloud metadata endpoints, restricted port matrix, and credential stripping.
- `crypto.test.ts`: 3 test cases validating PBKDF2 Web Crypto password hashing (100,000 iterations), timing-safe verification, cryptographically random token generation, and SHA-256 digests.
- `lifecycle.test.ts`: 3 test cases verifying incident confirmation thresholds, downtime duration calculations, and heartbeat deadline formulas.

### Executing Tests
```bash
# Run complete test suite (41 tests across 9 suites in ~1 second)
pnpm --filter @jobwhistle/api test

# Run strict monorepo TypeScript verification across all packages
pnpm -r run typecheck

# Run web production build (Next.js 16 App Router Turbopack)
pnpm --filter @jobwhistle/web build
```
