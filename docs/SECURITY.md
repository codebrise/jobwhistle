# Jobwhistle — Security Architecture & SSRF Defense

**Target:** Zero SSRF vulnerability, multi-tenant IDOR isolation, cryptographic secret storage, and scheduler access control.

---

## 1. SSRF Mitigation Matrix

| Attack Vector | Countermeasure in Jobwhistle | Implementation |
|---|---|---|
| **Loopback probing** | Reject `127.0.0.0/8`, `::1`, `localhost`, `0.0.0.0` | `validateMonitorUrl()` check |
| **Private RFC 1918 LANs** | Block `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Bitwise IPv4 CIDR range checker |
| **Shared / CGNAT** | Block `100.64.0.0/10` | Pre-flight CIDR check |
| **Cloud Metadata** | Block `169.254.169.254`, `metadata.google.internal`, `instance-data` | Hardcoded blocklist |
| **NAT64 IPv4-Mapped IPv6** | Extract lower 32-bit IPv4 from `64:ff9b::/96` and `::ffff:0:0/96` and check against private IPv4 | `isPrivateIPv6()` parser |
| **Unique Local / Link-Local IPv6** | Block `fc00::/7`, `fe80::/10`, `100::/64`, `2001:db8::/32` | Regex & prefix checker |
| **Wildcard DNS Services** | Block `nip.io`, `sslip.io`, `localtest.me`, `vcap.me`, `lvh.me`, `cirun.io`, `traefik.me` mapping private IP ranges | Regex embedded IP inspection |
| **DNS Rebinding & Spoofing** | Asynchronous pre-flight DNS resolution revalidates all resolved IPv4 & IPv6 records before connection | `validateMonitorUrlAsync()` with `node:dns` / DoH |
| **Intranet Port Scanning** | Restrict probe destinations strictly to approved web ports | Allowed: 80, 443, 8080, 8443, 3000, 5000, 8000, 8008, 8888, 9000 |
| **Credential Exfiltration** | Disallow embedded credentials (`user:pass@host`) | URL parser credential check |
| **Redirect Loop / Rebinding** | Manual redirect tracing up to 5 hops; re-validates destination with `validateMonitorUrlAsync()` on every hop | Manual redirect loop in `http-checker.ts` |
| **Probe Memory Starvation** | Strict response body reader boundary | Aborts read stream after 512 KB |

---

## 2. Multi-Tenant Authorization & IDOR Defense

1. **Workspace Boundary Scoping:** Every query, update, deletion, pause, resume, and check-now action for monitors, heartbeat tokens, incidents, notification channels, and preferences explicitly requires matching `workspaceId`.
2. **Object ID Obfuscation:** ID manipulation cannot access resources of another tenant. When a user requests a resource ID that does not belong to their active workspace, the API returns a strict `404 Not Found` without disclosing the existence or attributes of the resource.
3. **Session Revocation:** Sessions can be revoked instantly upon logout or password change by deleting the corresponding token hash from the `sessions` table.

---

## 3. Cryptographic Security Standards

1. **Password Storage:** Handled via Web Crypto `crypto.subtle.deriveBits` using **PBKDF2-HMAC-SHA256** with 100,000 iterations and 16-byte cryptographically random salts. Plaintext passwords are never stored or logged.
2. **Heartbeat Secrets:** Generated using 192 bits of entropy (`crypto.getRandomValues`). The database exclusively stores the **SHA-256 hash**, eliminating token recovery from database dumps. A preview snippet (e.g. `whistle_hb_9a8f...4e2d`) is stored for user identification.
3. **Session Tokens:** 192-bit random tokens stored as SHA-256 digests in the `sessions` table.

---

## 4. Scheduler & Cron Security

1. **Secret Token Verification:** The `/api/v1/cron/dispatch` endpoint requires the `X-Jobwhistle-Cron-Secret` header matching `CRON_SECRET`. Calls without or with incorrect secrets are rejected with `401 Unauthorized`.
2. **Atomic Lease Forwarding:** Scheduler workers advance `nextCheckAt` forward upon claiming due monitors, eliminating concurrent execution race conditions and double-probing.
3. **Idempotent Incident Transitions:** If an open incident already exists for a target, subsequent failures update failure telemetry without generating duplicate incidents or alert spam.
