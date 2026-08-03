import { v4 as uuidv4 } from 'uuid';
import { SimulatorConfig, SimulatorLog, DEFAULT_CONFIG } from './types';
import { getDb } from './mongodb';

const COLLECTION_CONFIG = 'simulator_config';
const COLLECTION_LOGS = 'simulator_logs';
const CONFIG_DOC_ID = 'active';

// ─── Dynamic ID generators ─────────────────────────────────

/** Generates a WhatsApp message ID like: wamid.HBgN6285117170886UCABEYEjNF1P25VRFXA= */
export function generateWamid(to: string): string {
  const rand = Buffer.from(uuidv4().replace(/-/g, '')).toString('base64').replace(/=/g, '');
  return `wamid.HBgN${to}UCABEYE${rand.substring(0, 8)}=`;
}

/** Generates a 10-digit numeric xid */
export function generateXid(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

/** Generates a JNS-style hex message ID */
export function generateJnsMessageId(): string {
  return Array.from({ length: 22 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// ─── Template interpolation ────────────────────────────────

export function interpolateCosterSuccess(template: string, to: string): string {
  const wamid = generateWamid(to);
  const xid = generateXid();
  return template
    .replace(/\{\{wamid\}\}/g, wamid)
    .replace(/\{\{xid\}\}/g, xid)
    .replace(/\{\{to\}\}/g, to);
}

export function interpolateJnsSuccess(template: string): string {
  const messageId = generateJnsMessageId();
  return template.replace(/\{\{message_id\}\}/g, messageId);
}


// ─── Config store (MongoDB) ────────────────────────────────

export async function getConfig(): Promise<SimulatorConfig> {
  const db = await getDb();
  const doc = await db.collection(COLLECTION_CONFIG).findOne({ _id: CONFIG_DOC_ID as unknown as any });
  if (!doc) {
    return DEFAULT_CONFIG;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...config } = doc;
  return config as unknown as SimulatorConfig;
}

export async function saveConfig(config: Partial<SimulatorConfig>): Promise<SimulatorConfig> {
  const db = await getDb();
  const existing = await getConfig();
  const updated: SimulatorConfig = {
    ...existing,
    ...config,
    updated_at: new Date().toISOString(),
  };
  await db.collection(COLLECTION_CONFIG).replaceOne(
    { _id: CONFIG_DOC_ID as unknown as any },
    { _id: CONFIG_DOC_ID, ...updated },
    { upsert: true }
  );
  return updated;
}

// ─── Log store (MongoDB) ────────────────────────────────────

export async function appendLog(log: Omit<SimulatorLog, 'id' | 'timestamp'>): Promise<SimulatorLog> {
  const db = await getDb();
  const entry: SimulatorLog = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...log,
  };
  await db.collection(COLLECTION_LOGS).insertOne(entry as any);
  return entry;
}

export async function getLogs(limit = 100): Promise<SimulatorLog[]> {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION_LOGS)
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  return docs.map(({ _id, ...rest }) => rest as unknown as SimulatorLog);
}

export async function clearLogs(): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION_LOGS).deleteMany({});
}

// ─── DR Sender ─────────────────────────────────────────────

/**
 * Send a delivery report (DR) to the API Gateway webhook URL after a delay.
 * Supports both POST (WA) and GET (SMS query params).
 */
export function scheduleDR(
  targetUrl: string,
  drData: { method?: 'GET' | 'POST'; headers?: Record<string, string>; body?: object; query?: Record<string, string> },
  delaySeconds: number,
  label: string
): void {
  setTimeout(async () => {
    try {
      const method = drData.method || 'POST';
      let fullUrl = targetUrl;
      let reqBody: string | undefined = undefined;
      const headers = drData.headers || {};

      if (method === 'GET' && drData.query) {
        const params = new URLSearchParams(drData.query);
        fullUrl = `${targetUrl}?${params.toString()}`;
      } else if (drData.body) {
        reqBody = JSON.stringify(drData.body);
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(fullUrl, {
        method,
        headers,
        body: reqBody,
      });

      const text = await res.text();
      await appendLog({
        endpoint: 'dr_sent',
        method,
        path: fullUrl,
        request_headers: headers,
        request_body: drData.body || drData.query || {},
        response_status: res.status,
        response_body: text,
        note: label,
      });
    } catch (err: unknown) {
      await appendLog({
        endpoint: 'dr_sent',
        method: drData.method || 'POST',
        path: targetUrl,
        request_headers: drData.headers || {},
        request_body: drData.body || drData.query || {},
        response_status: 0,
        response_body: String(err),
        note: `${label} — FAILED`,
      });
    }
  }, delaySeconds * 1000);
}
