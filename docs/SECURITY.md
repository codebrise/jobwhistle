# Jobwhistle — Security Architecture & SSRF Defense

**Target:** Zero SSRF vulnerability, robust session isolation, cryptographic secret storage.

---

## 1. SSRF Mitigation Matrix

| Attack Vector | Countermeasure in Jobwhistle | Implementation |
|---|---|---|
| **Loopback probing** | Reject `127.0.0.0/8`, `::1`, `localhost`, `0.0.0.0` | `validateMonitorUrl()` check |
| **Private RFC 1918 LANs** | Block `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Bitwise IPv4 CIDR range checker |
| **Carrier Grade NAT** | Block `100.64.0.0/10` | Pre-flight CIDR check |
| **Cloud Metadata** | Block `169.254.169.254`, `metadata.google.internal` | Hardcoded blocklist |
| **Intranet Port Scanning** | Restrict probe destinations to approved web ports | Allowed: 80, 443, 8080, 8443, 3000, 5000 |
| **Credential Exfiltration** | Disallow embedded credentials (`user:pass@host`) | URL parser credential check |
| **Redirect Loop / Rebinding** | Manual redirect tracing up to 5 hops | Re-validates destination on every hop |
| **Probe Memory Starvation** | Strict response body reader boundary | Aborts read stream after 512 KB |

---

## 2. Cryptographic Security Standards

1. **Password Storage:** Handled via Web Crypto `crypto.subtle.deriveBits` using **PBKDF2-HMAC-SHA256** with 100,000 iterations and 16-byte cryptographically random salts. Plaintext passwords are never stored or logged.
2. **Heartbeat Secrets:** Generated using 192 bits of entropy (`crypto.getRandomValues`). The database exclusively stores the **SHA-256 hash**, eliminating token recovery from database dumps.
3. **Session Tokens:** 192-bit random tokens stored as SHA-256 digests in the `sessions` table.

