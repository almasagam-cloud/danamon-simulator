import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getConfig,
  appendLog,
  interpolateCosterSuccess,
  scheduleDR,
} from '@/lib/helpers';

/**
 * POST /api/sim/coster
 *
 * Mock Coster WhatsApp provider endpoint.
 * API Gateway hits this to send a WhatsApp message.
 *
 * Scenarios:
 *   wa_success              → 200, auto-send SENT then DELIVERED DR
 *   wa_fail                 → error status, no DR
 *   wa_delivered_before_sent → 200, send DELIVERED first, then SENT
 *   wa_threshold_expire     → 200, send no DR (trigger threshold reroute)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = await getConfig();
  const body = req.body || {};
  const to: string = body?.to || body?.contacts?.[0]?.input || 'unknown';

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = Array.isArray(v) ? v[0] : (v ?? '');
  }

  const scenario = config.wa_scenario;

  // ── wa_fail ────────────────────────────────────────────────
  if (scenario === 'wa_fail') {
    const responseBody = config.coster_error_body;
    await appendLog({
      endpoint: 'coster',
      method: 'POST',
      path: req.url || '/api/sim/coster',
      request_headers: headers,
      request_body: body,
      response_status: config.coster_error_status,
      response_body: responseBody,
      scenario,
      note: 'WA provider returned error — expecting API Gateway to reroute to SMS',
    });
    return res
      .status(config.coster_error_status)
      .setHeader('Content-Type', 'application/json')
      .send(responseBody);
  }

  // ── wa_success / wa_delivered_before_sent / wa_threshold_expire ─
  const responseBody = interpolateCosterSuccess(config.coster_success_body, to);
  let parsedResponse: unknown;
  try { parsedResponse = JSON.parse(responseBody); } catch { parsedResponse = responseBody; }

  // Extract the generated message id from response for DR
  const msgId = (() => {
    try {
      const r = JSON.parse(responseBody);
      return r?.messages?.[0]?.id || 'unknown-wamid';
    } catch { return 'unknown-wamid'; }
  })();

  await appendLog({
    endpoint: 'coster',
    method: 'POST',
    path: req.url || '/api/sim/coster',
    request_headers: headers,
    request_body: body,
    response_status: 200,
    response_body: responseBody,
    scenario,
    note: `WA send accepted — message id: ${msgId}`,
  });

  // Send 200 first, then schedule DRs
  res.status(200).json(parsedResponse);

  const waWebhookUrl = config.wa_webhook_url || config.callback_url;

  if (scenario === 'wa_success') {
    // SENT DR → then DELIVERED DR
    scheduleDR(waWebhookUrl, {
      body: { statuses: [{ id: msgId, status: 'sent', timestamp: String(Date.now()) }] },
    }, config.wa_sent_delay_seconds, 'WA DR: SENT');

    scheduleDR(waWebhookUrl, {
      body: { statuses: [{ id: msgId, status: 'delivered', timestamp: String(Date.now()) }] },
    }, config.wa_sent_delay_seconds + config.wa_delivered_delay_seconds, 'WA DR: DELIVERED');

  } else if (scenario === 'wa_delivered_before_sent') {
    // DELIVERED DR first (out-of-order), then SENT
    scheduleDR(waWebhookUrl, {
      body: { statuses: [{ id: msgId, status: 'delivered', timestamp: String(Date.now()) }] },
    }, config.wa_sent_delay_seconds, 'WA DR: DELIVERED (out-of-order, before SENT)');

    scheduleDR(waWebhookUrl, {
      body: { statuses: [{ id: msgId, status: 'sent', timestamp: String(Date.now()) }] },
    }, config.wa_sent_delay_seconds + config.wa_delivered_delay_seconds, 'WA DR: SENT (after DELIVERED)');

  } else if (scenario === 'wa_threshold_expire') {
    // No DR sent — API Gateway should reroute to SMS after threshold
    await appendLog({
      endpoint: 'coster',
      method: 'POST',
      path: req.url || '/api/sim/coster',
      request_headers: {},
      request_body: null,
      response_status: 0,
      response_body: '(no DR will be sent — waiting for threshold to trigger reroute)',
      scenario,
      note: 'wa_threshold_expire: intentionally not sending any DR',
    });
  }
}
