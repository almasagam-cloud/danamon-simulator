import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { getConfig, scheduleDR } from '@/lib/helpers';

/**
 * POST /api/admin/trigger-dr
 *
 * Manually trigger a delivery report to the configured callback URL.
 * Body: { type: 'wa_sent' | 'wa_delivered' | 'wa_read' | 'wa_failed' | 'sms', message_id: string, delay_seconds?: number }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = await getConfig();
  const { type, message_id, delay_seconds = 0, xid: reqXid } = req.body || {};

  if (!type || !message_id) {
    return res.status(400).json({ error: 'type and message_id are required' });
  }

  const xid = reqXid || req.body?.xid || message_id;

  const waWebhookUrl = config.wa_webhook_url || config.callback_url;
  const smsWebhookUrl = config.sms_webhook_url || config.callback_url;

  switch (type) {
    case 'wa_sent':
      scheduleDR(waWebhookUrl, {
        body: { statuses: [{ id: message_id, status: 'sent', timestamp: String(Date.now()) }] },
      }, delay_seconds, `Manual DR: WA SENT (message_id: ${message_id})`);
      break;
    case 'wa_delivered':
      scheduleDR(waWebhookUrl, {
        body: { statuses: [{ id: message_id, status: 'delivered', timestamp: String(Date.now()) }] },
      }, delay_seconds, `Manual DR: WA DELIVERED (message_id: ${message_id})`);
      break;
    case 'wa_read':
      scheduleDR(waWebhookUrl, {
        body: { statuses: [{ id: message_id, status: 'read', timestamp: String(Date.now()) }] },
      }, delay_seconds, `Manual DR: WA READ (message_id: ${message_id})`);
      break;
    case 'wa_failed':
      scheduleDR(waWebhookUrl, {
        headers: { 'X-Request-Id': uuidv4() },
        body: {
          entry: [
            {
              changes: [
                {
                  field: 'messages',
                  value: {
                    ban_info: null,
                    contacts: null,
                    current_limit: '',
                    decision: '',
                    disable_date: '',
                    disable_info: null,
                    display_phone_number: '',
                    errors: null,
                    event: '',
                    max_daily_conversation_per_phone: 0,
                    max_phone_number_per_business: 0,
                    message_template_id: 0,
                    message_template_language: '',
                    message_template_name: '',
                    messages: null,
                    messaging_product: 'whatsapp',
                    metadata: {
                      display_phone_number: '6283879329048',
                      phone_number_id: '108020779027196',
                    },
                    old_limit: '',
                    phone_number: '',
                    rejection_reason: '',
                    requested_verified_name: '',
                    statuses: [
                      {
                        conversation: null,
                        errors: [
                          {
                            code: 131026,
                            title: 'Message undeliverable',
                            message: 'Message undeliverable',
                            error_data: {
                              details: 'Message failed to send because more than 24 hours have passed since the customer last replied to this number.',
                            },
                          },
                        ],
                        id: message_id,
                        pricing: {
                          billable: true,
                          category: 'authentication',
                          pricing_model: 'PMP',
                          type: 'regular',
                        },
                        recipient_id: '6282134163747',
                        status: 'failed',
                        timestamp: String(Math.floor(Date.now() / 1000)),
                      },
                    ],
                  },
                },
              ],
              id: '101585793013515',
              time: 0,
            },
          ],
          object: 'whatsapp_business_account',
          xid: xid,
          outbound: {
            type: 'template',
            recipient: '6282134163747',
            data: {
              to: '6282134163747',
              type: 'template',
              template: {
                name: 'otp_alter_table',
                language: {
                  code: 'id',
                  policy: 'deterministic',
                },
                namespace: null,
                components: [
                  {
                    type: 'body',
                    cards: null,
                    index: null,
                    sub_type: null,
                    parameters: [
                      {
                        text: '123456',
                        type: 'text',
                      },
                    ],
                  },
                  {
                    type: 'button',
                    cards: null,
                    index: 0,
                    sub_type: 'url',
                    parameters: [
                      {
                        text: '123456',
                        type: 'text',
                      },
                    ],
                  },
                ],
              },
              messaging_product: 'whatsapp',
            },
          },
        },
      }, delay_seconds, `Manual DR: WA FAILED (message_id: ${message_id})`);
      break;
    case 'sms':
      scheduleDR(smsWebhookUrl, {
        method: 'GET',
        query: {
          userid: 'Jatis',
          password: 'kkdmybri123',
          messageId: message_id,
          deliverystatus: '1',
          sender: 'BRI-OTP',
          description: 'SMS sent successfully',
          msisdn: '6287876780769',
          datereceived: new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
          datehit: new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
        },
      }, delay_seconds, `Manual DR: SMS DELIVERED (MessageId: ${message_id})`);
      break;
    default:
      return res.status(400).json({ error: `Unknown type: ${type}. Use: wa_sent, wa_delivered, wa_read, wa_failed, sms` });
  }

  return res.status(200).json({
    ok: true,
    message: `DR of type '${type}' scheduled in ${delay_seconds}s`,
    target_url: type === 'sms' ? smsWebhookUrl : waWebhookUrl,
  });
}
