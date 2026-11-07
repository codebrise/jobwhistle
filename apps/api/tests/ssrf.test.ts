import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateMonitorUrl } from '../src/security/ssrf';

describe('SSRF Protection Engine', () => {
  it('allows valid public HTTP and HTTPS URLs', () => {
    const urls = [
      'https://example.com',
      'https://api.github.com/status',
      'http://my-service.org/health',
      'https://subdomain.domain.co.uk:443/ping?key=val',
      'https://status.codebrise.com:8443/metrics',
    ];

    for (const url of urls) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, true, `Expected valid for ${url}: ${res.reason}`);
    }
  });

  it('rejects unsupported protocols (ftp, file, gopher, etc.)', () => {
    const invalidProtocols = [
      'ftp://example.com',
      'file:///etc/passwd',
      'gopher://evil.com',
      'javascript:alert(1)',
      'data:text/plain;base64,SGVsbG8=',
      'ws://example.com',
    ];

    for (const url of invalidProtocols) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected invalid for ${url}`);
    }
  });

  it('blocks loopback and localhost hostnames', () => {
    const loopbacks = [
      'http://localhost',
      'http://localhost:80',
      'http://sub.localhost',
      'https://local',
      'http://127.0.0.1',
      'http://127.0.0.1:8080',
      'http://127.12.34.56',
      'http://0.0.0.0',
    ];

    for (const url of loopbacks) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected blocked for ${url}`);
    }
  });

  it('blocks cloud metadata endpoints', () => {
    const metadataUrls = [
      'http://169.254.169.254/latest/meta-data/',
      'http://169.254.169.254:80',
      'http://metadata.google.internal/computeMetadata/v1/',
      'http://instance-data',
    ];

    for (const url of metadataUrls) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected blocked for metadata URL: ${url}`);
    }
  });

  it('blocks private IPv4 RFC 1918 ranges', () => {
    const privateIps = [
      'http://10.0.0.1/status',
      'http://10.255.255.254',
      'http://172.16.0.5',
      'http://172.31.255.255',
      'http://192.168.1.1',
      'http://192.168.0.100:8080',
      'http://100.64.0.1', // Carrier Grade NAT
    ];

    for (const url of privateIps) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected blocked for private IPv4: ${url}`);
    }
  });

  it('blocks private and loopback IPv6 addresses', () => {
    const privateIp6s = [
      'http://[::1]/status',
      'http://[fe80::1ff:fe23:4567:890a]',
      'http://[fc00::1]',
      'http://[fd12:3456:789a:1::1]',
    ];

    for (const url of privateIp6s) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected blocked for private IPv6: ${url}`);
    }
  });

  it('blocks dangerous internal infrastructure ports', () => {
    const dangerousPorts = [
      'http://example.com:22', // SSH
      'http://example.com:25', // SMTP
      'http://example.com:3306', // MySQL
      'http://example.com:5432', // PostgreSQL
      'http://example.com:6379', // Redis
      'http://example.com:27017', // MongoDB
      'http://example.com:2375', // Docker
      'http://example.com:9200', // Elasticsearch
    ];

    for (const url of dangerousPorts) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected blocked for dangerous port in ${url}`);
    }
  });

  it('rejects URLs with embedded credentials', () => {
    const urlsWithCreds = [
      'http://admin:secret@example.com/api',
      'https://user:password@example.com:443',
    ];

    for (const url of urlsWithCreds) {
      const res = validateMonitorUrl(url);
      assert.strictEqual(res.valid, false, `Expected rejected for credentials in ${url}`);
    }
  });
});
