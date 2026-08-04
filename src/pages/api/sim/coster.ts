import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import {
  getConfig,
  appendLog,
  interpolateCosterSuccess,
  scheduleDR,
  generateXid,
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
  const { wamid: msgId, xid: responseXid, body: responseBody } = interpolateCosterSuccess(config.coster_success_body, to);
  // Extract xid from incoming request body/headers if present, else from response template or generated responseXid
  const incomingXid = body?.xid || body?.reference_id || body?.id || headers['x-reference-id'] || headers['x-id'] || headers['x-request-id-num'];
  const xid = (() => {
    if (incomingXid) return String(incomingXid);
    try {
      const r = JSON.parse(responseBody);
      return String(r?.messages?.[0]?.xid || r?.id || responseXid);
    } catch { return responseXid; }
  })();

  let parsedResponse: unknown;
  try { parsedResponse = JSON.parse(responseBody); } catch { parsedResponse = responseBody; }

  // If incoming xid was found in request, sync it into the coster success response body as well
  let finalResponseBody = responseBody;
  if (incomingXid && responseBody.includes(responseXid)) {
    finalResponseBody = responseBody.replace(new RegExp(responseXid, 'g'), String(incomingXid));
    try { parsedResponse = JSON.parse(finalResponseBody); } catch { parsedResponse = finalResponseBody; }
  }

  await appendLog({
    endpoint: 'coster',
    method: 'POST',
    path: req.url || '/api/sim/coster',
    request_headers: headers,
    request_body: body,
    response_status: 200,
    response_body: finalResponseBody,
    scenario,
    note: `WA send accepted — message id: ${msgId}, xid: ${xid}`,
  });

  // Send 200 first, then schedule DRs
  res.status(200).json(parsedResponse);

  const waWebhookUrl = config.wa_webhook_url || config.callback_url;

  if (scenario === 'wa_success') {
    // SENT DR → then DELIVERED DR
    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'sent',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: String(Math.floor(Date.now() / 1000) + 86400), origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds, 'WA DR: SENT');

    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'delivered',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: null, origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds + config.wa_delivered_delay_seconds, 'WA DR: DELIVERED');

  } else if (scenario === 'wa_delivered_before_sent') {
    // DELIVERED DR first (out-of-order), then SENT
    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'delivered',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: null, origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds, 'WA DR: DELIVERED (out-of-order, before SENT)');

    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'sent',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: String(Math.floor(Date.now() / 1000) + 86400), origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds + config.wa_delivered_delay_seconds, 'WA DR: SENT (after DELIVERED)');

  } else if (scenario === 'wa_read_before_delivered_sent') {
    // READ DR first (out-of-order), then DELIVERED, then SENT
    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'read',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: null, origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds, 'WA DR: READ (out-of-order, first)');

    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'delivered',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: null, origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds + config.wa_delivered_delay_seconds, 'WA DR: DELIVERED (after READ)');

    scheduleDR(waWebhookUrl, {
      headers: { 'X-Request-Id': uuidv4() },
      body: {
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '6283879329048', phone_number_id: '108020779027196' },
                  statuses: [
                    {
                      id: msgId,
                      recipient_id: to,
                      status: 'sent',
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      conversation: { id: uuidv4().replace(/-/g, ''), expiration_timestamp: String(Math.floor(Date.now() / 1000) + 86400), origin: { type: 'authentication' } },
                      pricing: { billable: true, category: 'authentication', pricing_model: 'PMP', type: 'regular' }
                    }
                  ]
                }
              }
            ],
            id: '101585793013515',
            time: Date.now()
          }
        ],
        object: 'whatsapp_business_account',
        xid: xid
      },
    }, config.wa_sent_delay_seconds + (config.wa_delivered_delay_seconds * 2), 'WA DR: SENT (after DELIVERED)');

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
