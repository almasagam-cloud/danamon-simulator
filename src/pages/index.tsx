import Head from 'next/head';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { SimulatorConfig, SimulatorLog, WaScenario, SmsScenario } from '@/lib/types';

const WA_SCENARIOS: { value: WaScenario; label: string; color: string; desc: string }[] = [
  { value: 'wa_success', label: 'WA Success', color: '#10b981', desc: 'WA berhasil → DR: SENT lalu DELIVERED' },
  { value: 'wa_fail', label: 'WA Fail', color: '#ef4444', desc: 'WA 200 → kirim DR Failed (Undeliverable)' },
  { value: 'coster_fail_500', label: 'Coster Fail 500', color: '#dc2626', desc: 'Coster API error 500 → Gateway reroute ke SMS' },
  { value: 'wa_delivered_before_sent', label: 'DR Out-of-Order (Delivered)', color: '#f59e0b', desc: 'WA berhasil → DR: DELIVERED dulu, baru SENT' },
  { value: 'wa_read_before_delivered_sent', label: 'DR Out-of-Order (Read First)', color: '#ec4899', desc: 'WA berhasil → DR: READ dulu, baru DELIVERED, lalu SENT' },
  { value: 'wa_threshold_expire', label: 'Threshold Expire', color: '#8b5cf6', desc: 'WA berhasil → tidak ada DR → reroute setelah TTL' },
];

const SMS_SCENARIOS: { value: SmsScenario; label: string; color: string; desc: string }[] = [
  { value: 'sms_success', label: 'SMS Success', color: '#10b981', desc: 'SMS diterima → auto kirim DR ke callback' },
  { value: 'sms_fail', label: 'SMS Fail', color: '#ef4444', desc: 'SMS error response' },
];

const ENDPOINT_COLORS: Record<string, string> = {
  coster: '#3b82f6',
  jns: '#f59e0b',
  callback: '#10b981',
  dr_sent: '#8b5cf6',
};

const ENDPOINT_LABELS: Record<string, string> = {
  coster: 'Coster (WA)',
  jns: 'JNS (SMS)',
  callback: 'Callback',
  dr_sent: 'DR Sent',
};

export default function Dashboard() {
  const [config, setConfig] = useState<SimulatorConfig | null>(null);
  const [logs, setLogs] = useState<SimulatorLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'trigger'>('config');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [triggerForm, setTriggerForm] = useState({ type: 'wa_sent', message_id: '', delay_seconds: 0 });
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConfig = useCallback(async () => {
    const r = await fetch('/api/admin/config');
    const data = await r.json();
    setConfig(data);
  }, []);

  const fetchLogs = useCallback(async () => {
    const r = await fetch('/api/admin/logs?limit=200');
    const data = await r.json();
    setLogs(data.logs || []);
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchConfig, fetchLogs]);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  };

  const resetConfig = async () => {
    if (!confirm('Reset ke default config?')) return;
    const r = await fetch('/api/admin/config', { method: 'DELETE' });
    const data = await r.json();
    setConfig(data.config);
  };

  const clearLogs = async () => {
    if (!confirm('Hapus semua logs?')) return;
    await fetch('/api/admin/logs', { method: 'DELETE' });
    setLogs([]);
  };

  const triggerDR = async () => {
    const r = await fetch('/api/admin/trigger-dr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(triggerForm),
    });
    const data = await r.json();
    setTriggerResult(JSON.stringify(data, null, 2));
  };

  const patch = (key: keyof SimulatorConfig, value: unknown) => {
    if (!config) return;
    setConfig({ ...config, [key]: value } as SimulatorConfig);
  };

  if (!config) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#a1a1aa', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
    </div>
  );

  const costerHits = logs.filter(l => l.endpoint === 'coster').length;
  const jnsHits = logs.filter(l => l.endpoint === 'jns').length;
  const callbackHits = logs.filter(l => l.endpoint === 'callback').length;
  const drSent = logs.filter(l => l.endpoint === 'dr_sent').length;

  return (
    <>
      <Head>
        <title>Danamon API Gateway Simulator</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid #1f1f2e', background: 'rgba(15,15,25,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Danamon Simulator</span>
              <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'JetBrains Mono, monospace', background: '#1a1a2e', padding: '2px 8px', borderRadius: 4 }}>v1.0</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['config', 'logs', 'trigger'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                  background: activeTab === tab ? '#3b82f6' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#71717a',
                }}>
                  {tab === 'config' ? '⚙️ Config' : tab === 'logs' ? '📋 Logs' : '🚀 Trigger DR'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Coster Hits', value: costerHits, color: '#3b82f6', icon: '📡' },
              { label: 'JNS Hits', value: jnsHits, color: '#f59e0b', icon: '📱' },
              { label: 'Callback Hits', value: callbackHits, color: '#10b981', icon: '🔔' },
              { label: 'DR Sent', value: drSent, color: '#8b5cf6', icon: '📨' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* ─── CONFIG TAB ──────────────────────────────── */}
          {activeTab === 'config' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* WA Scenario */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24, gridColumn: '1 / -1' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WhatsApp Scenario</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                  {WA_SCENARIOS.map(s => (
                    <button key={s.value} onClick={() => patch('wa_scenario', s.value)} style={{
                      padding: '14px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      border: `2px solid ${config.wa_scenario === s.value ? s.color : '#1f1f2e'}`,
                      background: config.wa_scenario === s.value ? `${s.color}18` : '#0d0d18',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: config.wa_scenario === s.value ? s.color : '#e4e4e7', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.4 }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SMS Scenario */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SMS Scenario</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  {SMS_SCENARIOS.map(s => (
                    <button key={s.value} onClick={() => patch('sms_scenario', s.value)} style={{
                      flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      border: `2px solid ${config.sms_scenario === s.value ? s.color : '#1f1f2e'}`,
                      background: config.sms_scenario === s.value ? `${s.color}18` : '#0d0d18',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: config.sms_scenario === s.value ? s.color : '#e4e4e7', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.4 }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delays */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delays (seconds)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {([
                    { key: 'wa_sent_delay_seconds', label: 'WA SENT DR Delay', desc: 'Delay sebelum kirim WA SENT DR' },
                    { key: 'wa_delivered_delay_seconds', label: 'WA DELIVERED DR Delay', desc: 'Delay tambahan setelah SENT DR' },
                    { key: 'sms_dr_delay_seconds', label: 'SMS DR Delay', desc: 'Delay sebelum kirim SMS DR' },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                          <div style={{ fontSize: 11, color: '#71717a' }}>{desc}</div>
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>
                          {config[key]}s
                        </span>
                      </div>
                      <input type="range" min={0} max={60} value={config[key]}
                        onChange={e => patch(key, parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#3b82f6' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gateway Webhook URLs */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>API Gateway Webhook URLs</h3>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>WA Webhook URL (POST - Coster DR)</div>
                  <input value={config.wa_webhook_url} onChange={e => patch('wa_webhook_url', e.target.value)}
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>SMS Webhook URL (GET Query Params - JNS DR)</div>
                  <input value={config.sms_webhook_url} onChange={e => patch('sms_webhook_url', e.target.value)}
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Coster Response Templates */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coster Response Templates</h3>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 16 }}>Placeholders: <code style={{ color: '#3b82f6' }}>{`{{wamid}}`}</code> <code style={{ color: '#3b82f6' }}>{`{{xid}}`}</code> <code style={{ color: '#3b82f6' }}>{`{{to}}`}</code></div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Success Response (JSON)</div>
                  <textarea rows={8} value={config.coster_success_body} onChange={e => patch('coster_success_body', e.target.value)}
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Error Response Body</div>
                    <textarea rows={4} value={config.coster_error_body} onChange={e => patch('coster_error_body', e.target.value)}
                      style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Error HTTP Status</div>
                    <input type="number" value={config.coster_error_status} onChange={e => patch('coster_error_status', parseInt(e.target.value))}
                      style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#ef4444', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              {/* JNS Response Templates */}
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>JNS Response Templates</h3>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 16 }}>Placeholder: <code style={{ color: '#f59e0b' }}>{`{{message_id}}`}</code> — auto-generated hex ID</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Success Response (URL-encoded)</div>
                  <input value={config.jns_success_body} onChange={e => patch('jns_success_body', e.target.value)}
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Error Response Body</div>
                    <input value={config.jns_error_body} onChange={e => patch('jns_error_body', e.target.value)}
                      style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Error HTTP Status</div>
                    <input type="number" value={config.jns_error_status} onChange={e => patch('jns_error_status', parseInt(e.target.value))}
                      style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#ef4444', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              {/* Save / Reset */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={resetConfig} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #2a2a3e', background: 'transparent', color: '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Reset Default
                </button>
                <button onClick={saveConfig} disabled={saving} style={{
                  padding: '10px 32px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
                  background: savedOk ? '#10b981' : '#3b82f6', color: '#fff',
                  boxShadow: `0 0 20px ${savedOk ? '#10b98140' : '#3b82f640'}`,
                }}>
                  {saving ? 'Saving...' : savedOk ? '✓ Saved!' : 'Save Config'}
                </button>
              </div>
            </div>
          )}

          {/* ─── LOGS TAB ─────────────────────────────────── */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: '#71717a' }}>
                  {logs.length} entries · auto-refresh every 3s
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={fetchLogs} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #2a2a3e', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
                  <button onClick={clearLogs} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #3f1a1a', background: '#1f0a0a', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>🗑 Clear Logs</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {logs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#52525b', background: '#111118', borderRadius: 12, border: '1px solid #1f1f2e' }}>
                    No logs yet. Run a test case to see requests here.
                  </div>
                )}
                {logs.map(log => (
                  <div key={log.id} style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 10, overflow: 'hidden' }}>
                    <div onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${ENDPOINT_COLORS[log.endpoint]}22`, color: ENDPOINT_COLORS[log.endpoint], minWidth: 80, textAlign: 'center' }}>
                        {ENDPOINT_LABELS[log.endpoint]}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 4, minWidth: 40, textAlign: 'center',
                        background: log.response_status >= 200 && log.response_status < 300 ? '#10b98122' : '#ef444422',
                        color: log.response_status >= 200 && log.response_status < 300 ? '#10b981' : '#ef4444',
                      }}>
                        {log.response_status || '—'}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa', flex: 1 }}>{log.path}</span>
                      {log.note && <span style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>{log.note}</span>}
                      <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span style={{ color: '#52525b', fontSize: 12 }}>{expandedLog === log.id ? '▲' : '▼'}</span>
                    </div>

                    {expandedLog === log.id && (
                      <div style={{ borderTop: '1px solid #1f1f2e', padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request Body</div>
                          <pre style={{ margin: 0, fontSize: 11, color: '#a1a1aa', background: '#0a0a0f', padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 200 }}>
                            {JSON.stringify(log.request_body, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Response Body</div>
                          <pre style={{ margin: 0, fontSize: 11, color: '#a1a1aa', background: '#0a0a0f', padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 200 }}>
                            {log.response_body}
                          </pre>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request Headers</div>
                          <pre style={{ margin: 0, fontSize: 11, color: '#71717a', background: '#0a0a0f', padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 150 }}>
                            {JSON.stringify(log.request_headers, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TRIGGER DR TAB ─────────────────────────── */}
          {activeTab === 'trigger' && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Manual Trigger Delivery Report</h3>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>DR Type</div>
                  <select value={triggerForm.type} onChange={e => setTriggerForm({ ...triggerForm, type: e.target.value })}
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="wa_sent">WA SENT</option>
                    <option value="wa_delivered">WA DELIVERED</option>
                    <option value="sms">SMS DELIVERED</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Message ID / WAMID</div>
                  <input value={triggerForm.message_id} onChange={e => setTriggerForm({ ...triggerForm, message_id: e.target.value })}
                    placeholder="wamid.HBgN... or 278ff10014af4e32..."
                    style={{ width: '100%', background: '#0d0d18', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Delay</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace' }}>{triggerForm.delay_seconds}s</span>
                  </div>
                  <input type="range" min={0} max={60} value={triggerForm.delay_seconds}
                    onChange={e => setTriggerForm({ ...triggerForm, delay_seconds: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#8b5cf6' }} />
                </div>

                <button onClick={triggerDR} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px #8b5cf640' }}>
                  🚀 Send DR to Callback URL
                </button>

                {triggerResult && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Result</div>
                    <pre style={{ margin: 0, fontSize: 12, color: '#10b981', background: '#0a0a0f', padding: 12, borderRadius: 8 }}>
                      {triggerResult}
                    </pre>
                  </div>
                )}

                <div style={{ marginTop: 24, padding: 16, background: '#0d0d18', borderRadius: 8, border: '1px solid #1f1f2e' }}>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>Current Callback URL target:</div>
                  <div style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{config.callback_url}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
