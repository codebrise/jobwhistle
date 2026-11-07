/**
 * Jobwhistle SSRF Protection Engine
 * Prevents Server-Side Request Forgery by thoroughly validating destination targets
 * before initiating any HTTP probe.
 */

export interface SSRFValidationResult {
  valid: boolean;
  reason?: string;
  sanitizedUrl?: URL;
}

// Blocked private IPv4 ranges
const PRIVATE_IPV4_RANGES = [
  { start: ipToLong('0.0.0.0'), end: ipToLong('0.255.255.255') }, // Current network
  { start: ipToLong('10.0.0.0'), end: ipToLong('10.255.255.255') }, // 10.0.0.0/8
  { start: ipToLong('100.64.0.0'), end: ipToLong('100.127.255.255') }, // Shared / CGNAT
  { start: ipToLong('127.0.0.0'), end: ipToLong('127.255.255.255') }, // Loopback 127.0.0.0/8
  { start: ipToLong('169.254.0.0'), end: ipToLong('169.254.255.255') }, // Link-local / Cloud metadata 169.254.169.254
  { start: ipToLong('172.16.0.0'), end: ipToLong('172.31.255.255') }, // 172.16.0.0/12
  { start: ipToLong('192.0.0.0'), end: ipToLong('192.0.0.255') }, // IETF Protocol assignments
  { start: ipToLong('192.168.0.0'), end: ipToLong('192.168.255.255') }, // 192.168.0.0/16
  { start: ipToLong('198.18.0.0'), end: ipToLong('198.19.255.255') }, // Benchmarking
  { start: ipToLong('224.0.0.0'), end: ipToLong('239.255.255.255') }, // Multicast
  { start: ipToLong('240.0.0.0'), end: ipToLong('255.255.255.255') }, // Reserved
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
]);

// Allowed ports for HTTP/HTTPS uptime monitoring
const ALLOWED_PORTS = new Set([
  80, 443, 8080, 8443, 3000, 5000, 8000, 8008, 8888, 9000,
]);

function ipToLong(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>>
    0
  );
}

function isPrivateIPv4(ip: string): boolean {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return false;
  }
  const long = ipToLong(ip);
  return PRIVATE_IPV4_RANGES.some((range) => long >= range.start && long <= range.end);
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();
  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
  // Unique Local Address fc00::/7 (fc00... to fdff...)
  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return true;
  // Link-local unicast fe80::/10 (fe80... to febf...)
  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.slice(7);
    return isPrivateIPv4(v4Part);
  }
  return false;
}

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

  // 3. Check blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      reason: `Access to hostname "${hostname}" is restricted for security.`,
    };
  }

  // 4. Check for .local, .localhost, .internal TLDs
  if (
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.localdomain')
  ) {
    return {
      valid: false,
      reason: `Access to internal domain "${hostname}" is restricted.`,
    };
  }

  // 5. Check if hostname is directly an IPv4 address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return {
        valid: false,
        reason: `Target IP ${hostname} is within a private or restricted network range.`,
      };
    }
  }

  // 6. Check if hostname is directly an IPv6 address
  if (hostname.includes(':') || (hostname.startsWith('[') && hostname.endsWith(']'))) {
    const rawIp6 = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIPv6(rawIp6)) {
      return {
        valid: false,
        reason: `Target IPv6 ${rawIp6} is within a private or loopback range.`,
      };
    }
  }

  // 7. Validate port
  let port = parsed.port ? Number.parseInt(parsed.port, 10) : null;
  if (!port) {
    port = parsed.protocol === 'https:' ? 443 : 80;
  }

  if (!ALLOWED_PORTS.has(port)) {
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
