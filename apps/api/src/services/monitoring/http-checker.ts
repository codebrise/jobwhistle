import { validateMonitorUrl } from '../../security/ssrf';
import { productLimits } from '@jobwhistle/config';

export interface HttpCheckResult {
  isUp: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  errorMessage: string | null;
}

export async function executeHttpCheck(opts: {
  url: string;
  method: string;
  expectedStatusCode: number;
  timeoutSeconds: number;
}): Promise<HttpCheckResult> {
  const { url, method, expectedStatusCode, timeoutSeconds } = opts;

  // 1. SSRF Safety Check
  const ssrfCheck = validateMonitorUrl(url);
  if (!ssrfCheck.valid) {
    return {
      isUp: false,
      statusCode: null,
      responseTimeMs: 0,
      errorMessage: `SSRF Validation Blocked: ${ssrfCheck.reason}`,
    };
  }

  const effectiveTimeoutMs = Math.min(
    timeoutSeconds * 1000,
    productLimits.maxTimeoutSeconds * 1000
  );

  const startTime = performance.now();
  let currentUrl = url;
  let redirectCount = 0;
  const maxRedirects = productLimits.maxRedirects;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeoutMs);

    // Controlled redirect loop to validate SSRF on every hop
    while (redirectCount <= maxRedirects) {
      const response = await fetch(currentUrl, {
        method,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Jobwhistle-Monitor/1.0 (+https://jobwhistle.codebrise.com/docs/bot)',
          Accept: '*/*',
        },
      });

      // Handle Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          clearTimeout(timeoutId);
          const responseTimeMs = Math.round(performance.now() - startTime);
          return {
            isUp: false,
            statusCode: response.status,
            responseTimeMs,
            errorMessage: 'Redirect status received without Location header',
          };
        }

        const nextUrl = new URL(location, currentUrl).toString();
        const nextSsrf = validateMonitorUrl(nextUrl);
        if (!nextSsrf.valid) {
          clearTimeout(timeoutId);
          const responseTimeMs = Math.round(performance.now() - startTime);
          return {
            isUp: false,
            statusCode: response.status,
            responseTimeMs,
            errorMessage: `Redirect blocked by SSRF filter: ${nextSsrf.reason}`,
          };
        }

        redirectCount++;
        currentUrl = nextUrl;
        continue;
      }

      // Read response body up to max limit to prevent memory bloat
      if (response.body) {
        const reader = response.body.getReader();
        let bytesRead = 0;
        try {
          while (bytesRead < productLimits.maxResponseBodySizeBytes) {
            const { done, value } = await reader.read();
            if (done) break;
            bytesRead += value ? value.length : 0;
          }
        } finally {
          reader.cancel().catch(() => {});
        }
      }

      clearTimeout(timeoutId);
      const responseTimeMs = Math.round(performance.now() - startTime);
      const isUp = response.status === expectedStatusCode;

      return {
        isUp,
        statusCode: response.status,
        responseTimeMs,
        errorMessage: isUp
          ? null
          : `HTTP status ${response.status} did not match expected ${expectedStatusCode}`,
      };
    }

    clearTimeout(timeoutId);
    return {
      isUp: false,
      statusCode: null,
      responseTimeMs: Math.round(performance.now() - startTime),
      errorMessage: `Exceeded maximum redirect limit of ${maxRedirects}`,
    };
  } catch (err: unknown) {
    const responseTimeMs = Math.round(performance.now() - startTime);
    const isTimeout =
      (err as { name?: string })?.name === 'AbortError' ||
      responseTimeMs >= effectiveTimeoutMs;

    return {
      isUp: false,
      statusCode: null,
      responseTimeMs,
      errorMessage: isTimeout
        ? `Request timed out after ${timeoutSeconds}s`
        : (err as Error)?.message || 'Network connection failed',
    };
  }
}

