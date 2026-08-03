import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getConfig,
  appendLog,
  interpolateJnsSuccess,
  scheduleDR,
} from '@/lib/helpers';

/**
 * POST /api/sim/jns
 *
 * Mock JNS SMS provider endpoint.
 * API Gateway hits this when falling back to SMS.
 *
 * Scenarios:
 *   sms_success → returns "Status=1&MessageId=..." and auto-sends SMS DR to callback
 *   sms_fail    → returns error status
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = await getConfig();
  const body = req.body || {};

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = Array.isArray(v) ? v[0] : (v ?? '');
  }

  const scenario = config.sms_scenario;

  // ── sms_fail ───────────────────────────────────────────────
  if (scenario === 'sms_fail') {
    await appendLog({
      endpoint: 'jns',
      method: 'POST',
      path: req.url || '/api/sim/jns',
      request_headers: headers,
      request_body: body,
      response_status: config.jns_error_status,
      response_body: config.jns_error_body,
      scenario,
      note: 'SMS provider returned error',
    });
    return res
      .status(config.jns_error_status)
      .setHeader('Content-Type', 'application/x-www-form-urlencoded')
      .send(config.jns_error_body);
  }

  // ── sms_success ────────────────────────────────────────────
  const responseBody = interpolateJnsSuccess(config.jns_success_body);

  // Extract the generated MessageId for DR
  const messageId = (() => {
    const match = responseBody.match(/MessageId=([^&]+)/);
    return match ? match[1] : 'unknown-sms-id';
  })();

  await appendLog({
    endpoint: 'jns',
    method: 'POST',
    path: req.url || '/api/sim/jns',
    request_headers: headers,
    request_body: body,
    response_status: 200,
    response_body: responseBody,
    scenario,
    note: `SMS send accepted — MessageId: ${messageId}`,
  });

  // Extract recipient number (msisdn) from body or query if available
  const msisdn = body?.to || body?.msisdn || '6287876780769';

  res.status(200).setHeader('Content-Type', 'application/x-www-form-urlencoded').send(responseBody);

  // Auto-send SMS delivery report to SMS webhook URL via GET request
  const smsWebhookUrl = config.sms_webhook_url || config.callback_url;
  const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }); // e.g. 01/02/2026 02:47:08 PM

  scheduleDR(smsWebhookUrl, {
    method: 'GET',
    query: {
      userid: 'Jatis',
      password: 'kkdmybri123',
      messageId: messageId,
      deliverystatus: '1',
      sender: 'BRI-OTP',
      description: 'SMS sent successfully',
      msisdn: msisdn,
      datereceived: nowStr,
      datehit: nowStr,
    },
  }, config.sms_dr_delay_seconds, `SMS DR: DELIVERED (MessageId: ${messageId})`);
}
