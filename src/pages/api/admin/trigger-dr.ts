import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfig, scheduleDR } from '@/lib/helpers';

/**
 * POST /api/admin/trigger-dr
 *
 * Manually trigger a delivery report to the configured callback URL.
 * Body: { type: 'wa_sent' | 'wa_delivered' | 'sms', message_id: string, delay_seconds?: number }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = await getConfig();
  const { type, message_id, delay_seconds = 0 } = req.body || {};

  if (!type || !message_id) {
    return res.status(400).json({ error: 'type and message_id are required' });
  }

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
      return res.status(400).json({ error: `Unknown type: ${type}. Use: wa_sent, wa_delivered, sms` });
  }

  return res.status(200).json({
    ok: true,
    message: `DR of type '${type}' scheduled in ${delay_seconds}s`,
    target_url: type === 'sms' ? smsWebhookUrl : waWebhookUrl,
  });
}
