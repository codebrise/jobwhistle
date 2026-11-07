/**
 * Jobwhistle API Client
 * Authentic HTTP client connecting to the Jobwhistle Cloudflare Workers API.
 * Adheres strictly to the "No Fake Functionality" principle: all telemetry,
 * uptime percentages, monitors, and heartbeats reflect real backend state.
 */

import { brandConfig } from '@jobwhistle/config';
import type { AuthSession } from '@jobwhistle/contracts';

const API_BASE =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || brandConfig.apiUrl
    : brandConfig.apiUrl;

const TOKEN_KEY = 'jobwhistle_auth_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const session = getStoredSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  try {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || {
          code: `HTTP_${response.status}`,
          message: data?.message || `Request failed with HTTP status ${response.status}`,
        },
      };
    }

    return data as ApiResponse<T>;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network connection failure';
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Could not connect to Jobwhistle API (${message}). Verify network connection and API server status.`,
      },
    };
  }
}
