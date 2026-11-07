export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };

export interface OverviewMetrics {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  totalHeartbeats: number;
  healthyHeartbeats: number;
  missedHeartbeats: number;
  openIncidents: number;
  uptimePercentage24h: number;
  avgResponseTimeMs: number;
}
