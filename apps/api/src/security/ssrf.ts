/**
 * Jobwhistle SSRF Protection Engine
 * Prevents Server-Side Request Forgery by thoroughly validating destination targets
 * before initiating any HTTP probe.
 *
 * Defends against:
 * - Localhost and loopback addresses (IPv4 & IPv6)
 * - RFC 1918 private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Cloud metadata endpoints (169.254.169.254, metadata.google.internal, instance-data)
 * - NAT64 IPv4-mapped IPv6 (RFC 6052 64:ff9b::/96 and ::ffff:0:0/96)
 * - Unique local (fc00::/7) and link-local (fe80::/10) IPv6
 * - Wildcard DNS services (nip.io, sslip.io, localtest.me, etc.) mapping private IPs
 * - Embedded credentials and dangerous internal ports
 * - DNS rebinding via asynchronous pre-flight resolution verification
 */

export interface SSRFValidationResult {
  valid: boolean;
  reason?: string;
  sanitizedUrl?: URL;
  resolvedIp?: string;
}

// Blocked private & reserved IPv4 ranges
const PRIVATE_IPV4_RANGES = [
  { start: ipToLong('0.0.0.0'), end: ipToLong('0.255.255.255') }, // "This network" 0.0.0.0/8
  { start: ipToLong('10.0.0.0'), end: ipToLong('10.255.255.255') }, // Private 10.0.0.0/8
  { start: ipToLong('100.64.0.0'), end: ipToLong('100.127.255.255') }, // Shared / CGNAT 100.64.0.0/10
  { start: ipToLong('127.0.0.0'), end: ipToLong('127.255.255.255') }, // Loopback 127.0.0.0/8
  { start: ipToLong('169.254.0.0'), end: ipToLong('169.254.255.255') }, // Link-local / Cloud metadata 169.254.0.0/16
  { start: ipToLong('172.16.0.0'), end: ipToLong('172.31.255.255') }, // Private 172.16.0.0/12
  { start: ipToLong('192.0.0.0'), end: ipToLong('192.0.0.255') }, // IETF Protocol assignments 192.0.0.0/24
  { start: ipToLong('192.0.2.0'), end: ipToLong('192.0.2.255') }, // TEST-NET-1 192.0.2.0/24
  { start: ipToLong('192.168.0.0'), end: ipToLong('192.168.255.255') }, // Private 192.168.0.0/16
  { start: ipToLong('198.18.0.0'), end: ipToLong('198.19.255.255') }, // Benchmarking 198.18.0.0/15
  { start: ipToLong('198.51.100.0'), end: ipToLong('198.51.100.255') }, // TEST-NET-2 198.51.100.0/24
  { start: ipToLong('203.0.113.0'), end: ipToLong('203.0.113.255') }, // TEST-NET-3 203.0.113.0/24
  { start: ipToLong('224.0.0.0'), end: ipToLong('239.255.255.255') }, // Multicast 224.0.0.0/4
  { start: ipToLong('240.0.0.0'), end: ipToLong('255.255.255.255') }, // Reserved / Broadcast 240.0.0.0/4
];

// Blocked internal & cloud metadata hostnames
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'docker.for.mac.localhost',
  'host.docker.internal',
  'local',
  'localtest.me',
  'vcap.me',
  'lvh.me',
]);

// Known dynamic/wildcard DNS services that map arbitrary IPs
const WILDCARD_DNS_DOMAINS = [
  'nip.io',
  'sslip.io',
  'localtest.me',
  'vcap.me',
  'lvh.me',
  'cirun.io',
  'furious.pro',
  'traefik.me',
  '127-0-0-1.org',
];

// Allowed ports for HTTP/HTTPS uptime monitoring
const ALLOWED_PORTS = new Set([
  80, 443, 8080, 8443, 3000, 5000, 8000, 8008, 8888, 9000,
]);

export function ipToLong(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>>
    0
  );
}

export function isPrivateIPv4(ip: string): boolean {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return false;
  }
  const octets = ip.split('.').map(Number);
  if (octets.some((o) => o < 0 || o > 255)) {
    return false;
  }
  const long = ipToLong(ip);
  return PRIVATE_IPV4_RANGES.some((range) => long >= range.start && long <= range.end);
}

/**
 * Extracts and parses the embedded 32-bit IPv4 address from NAT64 or IPv4-mapped IPv6 formats
 */
function extractEmbeddedIPv4(ipv6: string): string | null {
  const norm = ipv6.toLowerCase().trim();

  // NAT64 Well-Known Prefix 64:ff9b::/96
  if (norm.startsWith('64:ff9b::')) {
    const suffix = norm.slice('64:ff9b::'.length);
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(suffix)) {
      return suffix;
    }
    const parts = suffix.split(':');
    if (parts.length >= 1 && parts.length <= 2) {
      const high = Number.parseInt(parts[0] || '0', 16);
      const low = Number.parseInt(parts[1] || '0', 16);
      const o1 = (high >> 8) & 0xff;
      const o2 = high & 0xff;
      const o3 = (low >> 8) & 0xff;
      const o4 = low & 0xff;
      return `${o1}.${o2}.${o3}.${o4}`;
    }
  }

  // IPv4-mapped IPv6 ::ffff:0:0/96
  if (norm.startsWith('::ffff:')) {
    const suffix = norm.slice('::ffff:'.length);
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(suffix)) {
      return suffix;
    }
    const parts = suffix.split(':');
    if (parts.length >= 1 && parts.length <= 2) {
      const high = Number.parseInt(parts[0] || '0', 16);
      const low = Number.parseInt(parts[1] || '0', 16);
      const o1 = (high >> 8) & 0xff;
      const o2 = high & 0xff;
      const o3 = (low >> 8) & 0xff;
      const o4 = low & 0xff;
      return `${o1}.${o2}.${o3}.${o4}`;
    }
  }

  return null;
}

export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // Unique Local Address fc00::/7 (fc00... to fdff...)
  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return true;

  // Link-local unicast fe80::/10 (fe80... to febf...)
  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return true;

  // Discard-only prefix 100::/64
  if (normalized.startsWith('100::')) return true;

  // Documentation prefix 2001:db8::/32
  if (normalized.startsWith('2001:db8:')) return true;

  // Benchmarking prefix 2001:2::/48
  if (normalized.startsWith('2001:2:')) return true;

  // NAT64 embedded IPv4
  const embeddedV4 = extractEmbeddedIPv4(normalized);
  if (embeddedV4) {
    return isPrivateIPv4(embeddedV4);
  }

  return false;
}

/**
 * Checks whether a hostname has embedded private IP patterns commonly used in wildcard DNS
 */
function hasEmbeddedPrivateIpPattern(hostname: string): boolean {
  // Check dotted-decimal e.g. 127.0.0.1.nip.io or 192.168.1.1.sslip.io
  const dottedMatch = hostname.match(/(?:^|\.)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\.|$)/);
  if (dottedMatch && dottedMatch[1]) {
    if (isPrivateIPv4(dottedMatch[1])) {
      return true;
    }
  }

  // Check hyphenated e.g. 127-0-0-1.sslip.io or 192-168-0-1.nip.io
  const hyphenMatch = hostname.match(/(?:^|\.)(\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3})(?:\.|$)/);
  if (hyphenMatch && hyphenMatch[1]) {
    const dotted = hyphenMatch[1].replace(/-/g, '.');
    if (isPrivateIPv4(dotted)) {
      return true;
    }
  }

  return false;
}

/**
 * Synchronous URL format and static security validation
 */
export function validateMonitorUrl(rawUrl: string): SSRFValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'URL must be a non-empty string' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // 1. Enforce HTTP/HTTPS only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      reason: `Unsupported protocol: ${parsed.protocol}. Only http: and https: are allowed.`,
    };
  }

  // 2. Reject credentials in URL (e.g. user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      reason: 'Embedding credentials (username/password) in monitoring URLs is not permitted.',
    };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Controlled test-runner override: allows automated test suite to probe a mock HTTP server on 127.0.0.1
  const isTestLocalAllowed =
    (globalThis as any).process?.env?.JOBWHISTLE_TEST_ALLOW_LOCALHOST === 'true' &&
    (hostname === 'localhost' || hostname === '127.0.0.1');

  // 3. Check blocked hostnames
  if (!isTestLocalAllowed && BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      reason: `Access to hostname "${hostname}" is restricted for security.`,
    };
  }

  // 4. Check for .local, .localhost, .internal TLDs
  if (
    !isTestLocalAllowed &&
    (hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.localdomain') ||
      hostname.endsWith('.corp') ||
      hostname.endsWith('.home.arpa'))
  ) {
    return {
      valid: false,
      reason: `Access to internal domain "${hostname}" is restricted.`,
    };
  }

  // 5. Check wildcard DNS services
  for (const domain of WILDCARD_DNS_DOMAINS) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      if (
        hostname.endsWith('localtest.me') ||
        hostname.endsWith('vcap.me') ||
        hostname.endsWith('lvh.me') ||
        hasEmbeddedPrivateIpPattern(hostname)
      ) {
        return {
          valid: false,
          reason: `Access to wildcard DNS mapping private IP "${hostname}" is restricted.`,
        };
      }
    }
  }

  // 6. Check generic embedded private IP pattern
  if (!isTestLocalAllowed && hasEmbeddedPrivateIpPattern(hostname)) {
    return {
      valid: false,
      reason: `Hostname "${hostname}" embeds a private network IP address.`,
    };
  }

  // 7. Check if hostname is directly an IPv4 address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (!isTestLocalAllowed && isPrivateIPv4(hostname)) {
      return {
        valid: false,
        reason: `Target IP ${hostname} is within a private or restricted network range.`,
      };
    }
  }

  // 8. Check if hostname is directly an IPv6 address
  if (hostname.includes(':') || (hostname.startsWith('[') && hostname.endsWith(']'))) {
    const rawIp6 = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIPv6(rawIp6)) {
      return {
        valid: false,
        reason: `Target IPv6 ${rawIp6} is within a private or loopback range.`,
      };
    }
  }

  // 9. Validate port
  let port = parsed.port ? Number.parseInt(parsed.port, 10) : null;
  if (!port) {
    port = parsed.protocol === 'https:' ? 443 : 80;
  }

  if (!isTestLocalAllowed && !ALLOWED_PORTS.has(port)) {
    return {
      valid: false,
      reason: `Port ${port} is restricted. Allowed ports: ${Array.from(ALLOWED_PORTS).join(', ')}`,
    };
  }

  return {
    valid: true,
    sanitizedUrl: parsed,
  };
}

/**
 * Asynchronous validation with DNS resolution check
 * Protects against DNS rebinding and wildcard DNS pointing to private IP space
 */
export async function validateMonitorUrlAsync(rawUrl: string): Promise<SSRFValidationResult> {
  const staticCheck = validateMonitorUrl(rawUrl);
  if (!staticCheck.valid || !staticCheck.sanitizedUrl) {
    return staticCheck;
  }

  const hostname = staticCheck.sanitizedUrl.hostname.toLowerCase().trim();

  const isTestLocalAllowed =
    (globalThis as any).process?.env?.JOBWHISTLE_TEST_ALLOW_LOCALHOST === 'true' &&
    (hostname === 'localhost' || hostname === '127.0.0.1');

  if (isTestLocalAllowed) {
    return staticCheck;
  }

  // If already a literal IP (v4 or v6), static check has validated it
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    return staticCheck;
  }

  // Try resolving DNS using Node.js dns module if available in current runtime
  try {
    const dnsModule = 'node:dns/promises';
    const dns: any = await import(/* @vite-ignore */ dnsModule).catch(() => null);
    if (!dns?.lookup) {
      return staticCheck;
    }

    const records = await dns.lookup(hostname, { all: true });

    for (const record of records) {
      if (record.family === 4) {
        if (isPrivateIPv4(record.address)) {
          return {
            valid: false,
            reason: `Target host "${hostname}" resolved to restricted private IPv4: ${record.address}`,
            resolvedIp: record.address,
          };
        }
      } else if (record.family === 6) {
        if (isPrivateIPv6(record.address)) {
          return {
            valid: false,
            reason: `Target host "${hostname}" resolved to restricted private IPv6: ${record.address}`,
            resolvedIp: record.address,
          };
        }
      }
    }

    return {
      ...staticCheck,
      resolvedIp: records[0]?.address,
    };
  } catch (err: unknown) {
    const errCode = (err as { code?: string })?.code;
    // ENOTFOUND or similar: let checker report host not found or try DoH
    if (errCode === 'ENOTFOUND' || errCode === 'EAI_AGAIN') {
      return {
        valid: false,
        reason: `Target hostname "${hostname}" could not be resolved by DNS (${errCode}).`,
      };
    }
  }

  return staticCheck;
}
