# Jobwhistle — Quality Assurance & Testing Suite

---

## 1. Test Architecture

The testing suite verifies critical security controls, SSRF protections, Web Crypto operations, and the incident state machine.

### Test Suites (`apps/api/tests/`)
- `ssrf.test.ts`: 8 test cases validating private IPv4, private IPv6, loopback, cloud metadata, port matrix, and credential stripping.
- `crypto.test.ts`: 3 test cases validating PBKDF2 password hashing (100k iterations), timing-safe verification, high-entropy token generation, and SHA-256.
- `lifecycle.test.ts`: 3 test cases verifying incident confirmation thresholds (2 failures), downtime duration arithmetic, and heartbeat deadline formulas.

### Executing Tests
```bash
# Run backend test suite
pnpm --filter @jobwhistle/api test

# Run monorepo typecheck
pnpm -r run typecheck

# Run web production build
pnpm --filter @jobwhistle/web build
```

