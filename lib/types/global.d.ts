/**
 * Global type augmentations for the Smart Event Experience platform.
 * RULE CQ-9: All global augmentations declared here.
 */

/** In-memory mock data store available in test/fallback mode */
interface MockAlertRecord {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  zone: string;
  timestamp: string;
  isActive: boolean;
}

/** In-memory mock session store available in test/fallback mode */
interface MockSessionRecord {
  id: string;
  title: string;
  speaker: string;
  zone: string;
  category: string;
  startTime: string;
  endTime: string;
  description: string;
  tags: string[];
  capacity: number;
  registered: number;
}

/** In-memory mock crowd data */
interface MockCrowdRecord {
  zone: string;
  occupancy: number;
  capacity: number;
  updatedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __db: import("better-sqlite3").Database | undefined;
  // eslint-disable-next-line no-var
  var mockAlerts: MockAlertRecord[];
  // eslint-disable-next-line no-var
  var mockSessions: MockSessionRecord[];
  // eslint-disable-next-line no-var
  var mockCrowd: MockCrowdRecord[];
  // eslint-disable-next-line no-var
  var rateLimitStore: Map<string, { count: number; resetAt: number }>;
}

export type { MockAlertRecord, MockSessionRecord, MockCrowdRecord };
