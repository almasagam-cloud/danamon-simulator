import type { NextApiRequest, NextApiResponse } from 'next';
import { appendLog } from '@/lib/helpers';

/**
 * POST /api/sim/callback
 *
 * Mock callback URL receiver.
 * API Gateway (or providers) hit this to send delivery reports.
 * We just log everything and return 200.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = Array.isArray(v) ? v[0] : (v ?? '');
  }

  // Detect DR type from body for labeling
  const note = (() => {
    if (body?.statuses?.[0]?.status === 'delivered') return 'Callback received: WA DELIVERED DR';
    if (body?.statuses?.[0]?.status === 'sent') return 'Callback received: WA SENT DR';
    if (body?.statuses?.[0]?.status === 'read') return 'Callback received: WA READ DR';
    if (body?.statuses?.[0]?.status === 'failed') return 'Callback received: WA FAILED DR';
    if (body?.channel === 'sms') return 'Callback received: SMS DR';
    return 'Callback received: unknown DR type';
  })();

  await appendLog({
    endpoint: 'callback',
    method: req.method || 'POST',
    path: req.url || '/api/sim/callback',
    request_headers: headers,
    request_body: body,
    response_status: 200,
    response_body: 'OK',
    note,
  });

  return res.status(200).json({ status: 'ok', message: 'Callback received' });
}
