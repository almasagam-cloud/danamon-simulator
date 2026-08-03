# Danamon API Gateway Simulator

Mock server untuk simulasi 3 URL provider yang di-hit oleh API Gateway:
- **Coster** → WhatsApp provider
- **JNS** → SMS provider (fallback)
- **Callback** → Delivery report receiver

## Quick Start (Lokal)

```bash
cd Simulator
npm install
npm run dev   # runs on http://localhost:3001
```

## Dashboard

Buka browser: **http://localhost:3001**

## Endpoints

| Path | Method | Keterangan |
|------|--------|-----------|
| `/api/sim/coster` | POST | Mock Coster WA provider |
| `/api/sim/jns` | POST | Mock JNS SMS provider |
| `/api/sim/callback` | POST | Mock callback receiver (log DRs) |
| `/api/admin/config` | GET/POST/DELETE | Get/set/reset simulator config |
| `/api/admin/logs` | GET/DELETE | Get/clear request logs |
| `/api/admin/trigger-dr` | POST | Manual trigger delivery report |

## Skenario WA

| Scenario | Description |
|----------|-------------|
| `wa_success` | WA sukses → auto kirim DR: SENT lalu DELIVERED |
| `wa_fail` | WA error (5xx) → API Gateway harus reroute ke JNS |
| `wa_delivered_before_sent` | WA sukses → DR: DELIVERED dulu baru SENT (out-of-order) |
| `wa_threshold_expire` | WA sukses → tidak ada DR → reroute setelah threshold |

## Skenario SMS

| Scenario | Description |
|----------|-------------|
| `sms_success` | SMS diterima → auto kirim SMS DR ke callback URL |
| `sms_fail` | SMS error (5xx) |

## Response Templates

Semua response template bisa diedit di Web UI Dashboard.

### Coster Success Placeholders
- `{{wamid}}` → auto-generated unique WA message ID
- `{{xid}}` → auto-generated 10-digit numeric ID
- `{{to}}` → nomor tujuan dari request

### JNS Success Placeholder
- `{{message_id}}` → auto-generated 22-char hex ID

## Deploy ke Vercel

1. Push folder `Simulator/` ke repo (atau subfolder)
2. Set environment variables di Vercel dashboard:
   ```
   MONGODB_URI=mongodb://root:rL9KE7U0mPndQR@43.173.59.247:27017/?authSource=admin
   MONGODB_DB=danamon
   ```
3. Setelah deploy, update `SIMULATOR_BASE_URL` di `Resource/variable/config.resource`:
   ```
   ${SIMULATOR_BASE_URL}     https://your-project.vercel.app
   ```
4. Update credentials MongoDB staging untuk pointing ke simulator:
   ```json
   {
     "whatsapp": { "url": "https://your-project.vercel.app/api/sim/coster" },
     "sms":      { "url": "https://your-project.vercel.app/api/sim/jns" },
     "callback_url": "https://your-project.vercel.app/api/sim/callback"
   }
   ```

## Rollback

Setelah testing selesai, restore credentials MongoDB ke URL asli:
```json
{
  "whatsapp": { "url": "https://sit2.jatismobile.com/v1/1ff8e236223511eebc01235690196577/messagesr" },
  "sms":      { "url": "https://webhook-config.vercel.app/api/webhook/danamon" },
  "callback_url": "https://sit2.jatismobile.com/sendmockapi/callback_url_danamon"
}
```

## Robot Framework Usage

TC025–TC028 di `ApiGatewayTests.robot` otomatis set skenario sebelum hit API Gateway.

Untuk run hanya TC simulator:
```bash
robot --test "TC025*" --test "TC026*" --test "TC027*" --test "TC028*" Robot/ApiGatewayTests.robot
```
