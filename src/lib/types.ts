// ─── Scenarios ─────────────────────────────────────────────
export type WaScenario =
  | 'wa_success'                // WA success, DR: SENT → DELIVERED
  | 'wa_fail'                   // WA error (5xx), no DR
  | 'wa_delivered_before_sent'  // WA success, DR: DELIVERED first, then SENT
  | 'wa_threshold_expire';      // WA success, no DR at all (trigger threshold reroute)

export type SmsScenario =
  | 'sms_success'   // SMS accepted, auto send DR after delay
  | 'sms_fail';     // SMS error (5xx)

// ─── Simulator Config ──────────────────────────────────────
export interface SimulatorConfig {
  // Scenario
  wa_scenario: WaScenario;
  sms_scenario: SmsScenario;

  // Delays (seconds)
  wa_sent_delay_seconds: number;       // delay before sending WA SENT DR
  wa_delivered_delay_seconds: number;  // delay before sending WA DELIVERED DR (after SENT)
  sms_dr_delay_seconds: number;        // delay before sending SMS delivery report

  // Coster response template (supports placeholders: {{wamid}}, {{xid}}, {{to}})
  coster_success_body: string;
  coster_error_body: string;
  coster_error_status: number;

  // JNS response template (supports placeholders: {{message_id}})
  jns_success_body: string;
  jns_error_body: string;
  jns_error_status: number;

  // Gateway Webhook URLs
  wa_webhook_url: string;
  sms_webhook_url: string;

  // Updated timestamp
  updated_at: string;
}

// ─── Default Config ────────────────────────────────────────
export const DEFAULT_CONFIG: SimulatorConfig = {
  wa_scenario: 'wa_success',
  sms_scenario: 'sms_success',

  wa_sent_delay_seconds: 2,
  wa_delivered_delay_seconds: 5,
  sms_dr_delay_seconds: 3,

  coster_success_body: JSON.stringify({
    meta: { author: 'jatis mobile', meta: '0.0.1' },
    contacts: [{ input: '{{to}}', wa_id: '{{to}}' }],
    messages: [{ id: '{{wamid}}', xid: '{{xid}}' }],
  }, null, 2),

  coster_error_body: JSON.stringify({
    meta: { author: 'jatis mobile', meta: '0.0.1' },
    errors: [{ code: 1006, title: 'Required parameter is missing or invalid', details: 'Unknown Contact' }],
  }, null, 2),
  coster_error_status: 500,

  jns_success_body: 'Status=1&MessageId={{message_id}}',
  jns_error_body: 'Status=0&ErrorMessage=Provider+unavailable',
  jns_error_status: 500,

  callback_url: 'https://stg-otpdanamon.devmobilejatis.com/v1/callback',
  wa_webhook_url: process.env.API_GATEWAY_WA_WEBHOOK_URL || 'https://stg-otpdanamon.devmobilejatis.com/v1/wa/webhook',
  sms_webhook_url: process.env.API_GATEWAY_SMS_WEBHOOK_URL || 'https://stg-otpdanamon.devmobilejatis.com/v1/sms/webhook',

  updated_at: new Date().toISOString(),
};

// ─── Log Types ─────────────────────────────────────────────
export type EndpointType = 'coster' | 'jns' | 'callback' | 'dr_sent';

export interface SimulatorLog {
  id: string;
  timestamp: string;
  endpoint: EndpointType;
  method: string;
  path: string;
  request_headers: Record<string, string>;
  request_body: unknown;
  response_status: number;
  response_body: string;
  scenario?: string;
  note?: string;
}
