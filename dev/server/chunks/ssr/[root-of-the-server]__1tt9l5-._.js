module.exports = [
"[project]/src/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
;
const WA_SCENARIOS = [
    {
        value: 'wa_success',
        label: 'WA Success',
        color: '#10b981',
        desc: 'WA berhasil → DR: SENT lalu DELIVERED'
    },
    {
        value: 'wa_fail',
        label: 'WA Fail',
        color: '#ef4444',
        desc: 'WA error → API Gateway reroute ke SMS'
    },
    {
        value: 'wa_delivered_before_sent',
        label: 'DR Out-of-Order',
        color: '#f59e0b',
        desc: 'WA berhasil → DR: DELIVERED dulu, baru SENT'
    },
    {
        value: 'wa_threshold_expire',
        label: 'Threshold Expire',
        color: '#8b5cf6',
        desc: 'WA berhasil → tidak ada DR → reroute setelah TTL'
    }
];
const SMS_SCENARIOS = [
    {
        value: 'sms_success',
        label: 'SMS Success',
        color: '#10b981',
        desc: 'SMS diterima → auto kirim DR ke callback'
    },
    {
        value: 'sms_fail',
        label: 'SMS Fail',
        color: '#ef4444',
        desc: 'SMS error response'
    }
];
const ENDPOINT_COLORS = {
    coster: '#3b82f6',
    jns: '#f59e0b',
    callback: '#10b981',
    dr_sent: '#8b5cf6'
};
const ENDPOINT_LABELS = {
    coster: 'Coster (WA)',
    jns: 'JNS (SMS)',
    callback: 'Callback',
    dr_sent: 'DR Sent'
};
function Dashboard() {
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [savedOk, setSavedOk] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('config');
    const [expandedLog, setExpandedLog] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [triggerForm, setTriggerForm] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        type: 'wa_sent',
        message_id: '',
        delay_seconds: 0
    });
    const [triggerResult, setTriggerResult] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const fetchConfig = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async ()=>{
        const r = await fetch('/api/admin/config');
        const data = await r.json();
        setConfig(data);
    }, []);
    const fetchLogs = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async ()=>{
        const r = await fetch('/api/admin/logs?limit=200');
        const data = await r.json();
        setLogs(data.logs || []);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetchConfig();
        fetchLogs();
        intervalRef.current = setInterval(fetchLogs, 3000);
        return ()=>{
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [
        fetchConfig,
        fetchLogs
    ]);
    const saveConfig = async ()=>{
        if (!config) return;
        setSaving(true);
        await fetch('/api/admin/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        setSaving(false);
        setSavedOk(true);
        setTimeout(()=>setSavedOk(false), 2000);
    };
    const resetConfig = async ()=>{
        if (!confirm('Reset ke default config?')) return;
        const r = await fetch('/api/admin/config', {
            method: 'DELETE'
        });
        const data = await r.json();
        setConfig(data.config);
    };
    const clearLogs = async ()=>{
        if (!confirm('Hapus semua logs?')) return;
        await fetch('/api/admin/logs', {
            method: 'DELETE'
        });
        setLogs([]);
    };
    const triggerDR = async ()=>{
        const r = await fetch('/api/admin/trigger-dr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(triggerForm)
        });
        const data = await r.json();
        setTriggerResult(JSON.stringify(data, null, 2));
    };
    const patch = (key, value)=>{
        if (!config) return;
        setConfig({
            ...config,
            [key]: value
        });
    };
    if (!config) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            background: '#0a0a0f',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                color: '#a1a1aa',
                fontFamily: 'Inter, sans-serif'
            },
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/pages/index.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/pages/index.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
    const costerHits = logs.filter((l)=>l.endpoint === 'coster').length;
    const jnsHits = logs.filter((l)=>l.endpoint === 'jns').length;
    const callbackHits = logs.filter((l)=>l.endpoint === 'callback').length;
    const drSent = logs.filter((l)=>l.endpoint === 'dr_sent').length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        children: "Danamon API Gateway Simulator"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.googleapis.com"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.gstatic.com",
                        crossOrigin: "anonymous"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
                        rel: "stylesheet"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    background: '#0a0a0f',
                    minHeight: '100vh',
                    color: '#e4e4e7',
                    fontFamily: 'Inter, sans-serif'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            borderBottom: '1px solid #1f1f2e',
                            background: 'rgba(15,15,25,0.95)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 100,
                            backdropFilter: 'blur(12px)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                maxWidth: 1200,
                                margin: '0 auto',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                background: '#10b981',
                                                boxShadow: '0 0 8px #10b981'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 128,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 700,
                                                fontSize: 18,
                                                letterSpacing: '-0.02em'
                                            },
                                            children: "Danamon Simulator"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 12,
                                                color: '#52525b',
                                                fontFamily: 'JetBrains Mono, monospace',
                                                background: '#1a1a2e',
                                                padding: '2px 8px',
                                                borderRadius: 4
                                            },
                                            children: "v1.0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/pages/index.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: 8
                                    },
                                    children: [
                                        'config',
                                        'logs',
                                        'trigger'
                                    ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveTab(tab),
                                            style: {
                                                padding: '6px 16px',
                                                borderRadius: 6,
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                transition: 'all 0.15s',
                                                background: activeTab === tab ? '#3b82f6' : 'transparent',
                                                color: activeTab === tab ? '#fff' : '#71717a'
                                            },
                                            children: tab === 'config' ? '⚙️ Config' : tab === 'logs' ? '📋 Logs' : '🚀 Trigger DR'
                                        }, tab, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            maxWidth: 1200,
                            margin: '0 auto',
                            padding: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 16,
                                    marginBottom: 24
                                },
                                children: [
                                    {
                                        label: 'Coster Hits',
                                        value: costerHits,
                                        color: '#3b82f6',
                                        icon: '📡'
                                    },
                                    {
                                        label: 'JNS Hits',
                                        value: jnsHits,
                                        color: '#f59e0b',
                                        icon: '📱'
                                    },
                                    {
                                        label: 'Callback Hits',
                                        value: callbackHits,
                                        color: '#10b981',
                                        icon: '🔔'
                                    },
                                    {
                                        label: 'DR Sent',
                                        value: drSent,
                                        color: '#8b5cf6',
                                        icon: '📨'
                                    }
                                ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: '16px 20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#71717a',
                                                            marginBottom: 4
                                                        },
                                                        children: s.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 28,
                                                            fontWeight: 700,
                                                            color: s.color
                                                        },
                                                        children: s.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 28
                                                },
                                                children: s.icon
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, s.label, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/pages/index.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this),
                            activeTab === 'config' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 20
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24,
                                            gridColumn: '1 / -1'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "WhatsApp Scenario"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 172,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                                    gap: 10
                                                },
                                                children: WA_SCENARIOS.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>patch('wa_scenario', s.value),
                                                        style: {
                                                            padding: '14px 12px',
                                                            borderRadius: 10,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                            textAlign: 'left',
                                                            border: `2px solid ${config.wa_scenario === s.value ? s.color : '#1f1f2e'}`,
                                                            background: config.wa_scenario === s.value ? `${s.color}18` : '#0d0d18'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 600,
                                                                    fontSize: 13,
                                                                    color: config.wa_scenario === s.value ? s.color : '#e4e4e7',
                                                                    marginBottom: 4
                                                                },
                                                                children: s.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 180,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: '#71717a',
                                                                    lineHeight: 1.4
                                                                },
                                                                children: s.desc
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, s.value, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 173,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "SMS Scenario"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 189,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 10
                                                },
                                                children: SMS_SCENARIOS.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>patch('sms_scenario', s.value),
                                                        style: {
                                                            flex: 1,
                                                            padding: '14px 12px',
                                                            borderRadius: 10,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                            textAlign: 'left',
                                                            border: `2px solid ${config.sms_scenario === s.value ? s.color : '#1f1f2e'}`,
                                                            background: config.sms_scenario === s.value ? `${s.color}18` : '#0d0d18'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 600,
                                                                    fontSize: 13,
                                                                    color: config.sms_scenario === s.value ? s.color : '#e4e4e7',
                                                                    marginBottom: 4
                                                                },
                                                                children: s.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: '#71717a',
                                                                    lineHeight: 1.4
                                                                },
                                                                children: s.desc
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 198,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, s.value, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 190,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "Delays (seconds)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 206,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 16
                                                },
                                                children: [
                                                    {
                                                        key: 'wa_sent_delay_seconds',
                                                        label: 'WA SENT DR Delay',
                                                        desc: 'Delay sebelum kirim WA SENT DR'
                                                    },
                                                    {
                                                        key: 'wa_delivered_delay_seconds',
                                                        label: 'WA DELIVERED DR Delay',
                                                        desc: 'Delay tambahan setelah SENT DR'
                                                    },
                                                    {
                                                        key: 'sms_dr_delay_seconds',
                                                        label: 'SMS DR Delay',
                                                        desc: 'Delay sebelum kirim SMS DR'
                                                    }
                                                ].map(({ key, label, desc })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: 6
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: 13,
                                                                                    fontWeight: 500
                                                                                },
                                                                                children: label
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/pages/index.tsx",
                                                                                lineNumber: 216,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: 11,
                                                                                    color: '#71717a'
                                                                                },
                                                                                children: desc
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/pages/index.tsx",
                                                                                lineNumber: 217,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/pages/index.tsx",
                                                                        lineNumber: 215,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: 20,
                                                                            fontWeight: 700,
                                                                            color: '#3b82f6',
                                                                            fontFamily: 'JetBrains Mono, monospace'
                                                                        },
                                                                        children: [
                                                                            config[key],
                                                                            "s"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/pages/index.tsx",
                                                                        lineNumber: 219,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 214,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                type: "range",
                                                                min: 0,
                                                                max: 60,
                                                                value: config[key],
                                                                onChange: (e)=>patch(key, parseInt(e.target.value)),
                                                                style: {
                                                                    width: '100%',
                                                                    accentColor: '#3b82f6'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 223,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, key, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 207,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "API Gateway Webhook URLs"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 233,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#71717a',
                                                            marginBottom: 6
                                                        },
                                                        children: "WA Webhook URL (POST - Coster DR)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        value: config.wa_webhook_url,
                                                        onChange: (e)=>patch('wa_webhook_url', e.target.value),
                                                        style: {
                                                            width: '100%',
                                                            background: '#0d0d18',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: 8,
                                                            padding: '10px 12px',
                                                            color: '#e4e4e7',
                                                            fontSize: 13,
                                                            fontFamily: 'JetBrains Mono, monospace',
                                                            boxSizing: 'border-box'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 234,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#71717a',
                                                            marginBottom: 6
                                                        },
                                                        children: "SMS Webhook URL (GET Query Params - JNS DR)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        value: config.sms_webhook_url,
                                                        onChange: (e)=>patch('sms_webhook_url', e.target.value),
                                                        style: {
                                                            width: '100%',
                                                            background: '#0d0d18',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: 8,
                                                            padding: '10px 12px',
                                                            color: '#e4e4e7',
                                                            fontSize: 13,
                                                            fontFamily: 'JetBrains Mono, monospace',
                                                            boxSizing: 'border-box'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 241,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 239,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 4px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "Coster Response Templates"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 248,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: '#52525b',
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    "Placeholders: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                        style: {
                                                            color: '#3b82f6'
                                                        },
                                                        children: `{{wamid}}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 97
                                                    }, this),
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                        style: {
                                                            color: '#3b82f6'
                                                        },
                                                        children: `{{xid}}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 153
                                                    }, this),
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                        style: {
                                                            color: '#3b82f6'
                                                        },
                                                        children: `{{to}}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 207
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 249,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#71717a',
                                                            marginBottom: 6
                                                        },
                                                        children: "Success Response (JSON)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                        rows: 8,
                                                        value: config.coster_success_body,
                                                        onChange: (e)=>patch('coster_success_body', e.target.value),
                                                        style: {
                                                            width: '100%',
                                                            background: '#0d0d18',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: 8,
                                                            padding: '10px 12px',
                                                            color: '#e4e4e7',
                                                            fontSize: 12,
                                                            fontFamily: 'JetBrains Mono, monospace',
                                                            resize: 'vertical',
                                                            boxSizing: 'border-box'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 250,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 2
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#71717a',
                                                                    marginBottom: 6
                                                                },
                                                                children: "Error Response Body"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 257,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                                rows: 4,
                                                                value: config.coster_error_body,
                                                                onChange: (e)=>patch('coster_error_body', e.target.value),
                                                                style: {
                                                                    width: '100%',
                                                                    background: '#0d0d18',
                                                                    border: '1px solid #2a2a3e',
                                                                    borderRadius: 8,
                                                                    padding: '10px 12px',
                                                                    color: '#e4e4e7',
                                                                    fontSize: 12,
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    resize: 'vertical',
                                                                    boxSizing: 'border-box'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#71717a',
                                                                    marginBottom: 6
                                                                },
                                                                children: "Error HTTP Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 262,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                value: config.coster_error_status,
                                                                onChange: (e)=>patch('coster_error_status', parseInt(e.target.value)),
                                                                style: {
                                                                    width: '100%',
                                                                    background: '#0d0d18',
                                                                    border: '1px solid #2a2a3e',
                                                                    borderRadius: 8,
                                                                    padding: '10px 12px',
                                                                    color: '#ef4444',
                                                                    fontSize: 14,
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    fontWeight: 700,
                                                                    boxSizing: 'border-box'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 263,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 255,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#111118',
                                            border: '1px solid #1f1f2e',
                                            borderRadius: 12,
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    margin: '0 0 4px',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#a1a1aa',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "JNS Response Templates"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 271,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: '#52525b',
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    "Placeholder: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                        style: {
                                                            color: '#f59e0b'
                                                        },
                                                        children: `{{message_id}}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 272,
                                                        columnNumber: 96
                                                    }, this),
                                                    " — auto-generated hex ID"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 272,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 16
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#71717a',
                                                            marginBottom: 6
                                                        },
                                                        children: "Success Response (URL-encoded)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 274,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        value: config.jns_success_body,
                                                        onChange: (e)=>patch('jns_success_body', e.target.value),
                                                        style: {
                                                            width: '100%',
                                                            background: '#0d0d18',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: 8,
                                                            padding: '10px 12px',
                                                            color: '#e4e4e7',
                                                            fontSize: 13,
                                                            fontFamily: 'JetBrains Mono, monospace',
                                                            boxSizing: 'border-box'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 275,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 273,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 2
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#71717a',
                                                                    marginBottom: 6
                                                                },
                                                                children: "Error Response Body"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 280,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                value: config.jns_error_body,
                                                                onChange: (e)=>patch('jns_error_body', e.target.value),
                                                                style: {
                                                                    width: '100%',
                                                                    background: '#0d0d18',
                                                                    border: '1px solid #2a2a3e',
                                                                    borderRadius: 8,
                                                                    padding: '10px 12px',
                                                                    color: '#e4e4e7',
                                                                    fontSize: 13,
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    boxSizing: 'border-box'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 281,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#71717a',
                                                                    marginBottom: 6
                                                                },
                                                                children: "Error HTTP Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 285,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                value: config.jns_error_status,
                                                                onChange: (e)=>patch('jns_error_status', parseInt(e.target.value)),
                                                                style: {
                                                                    width: '100%',
                                                                    background: '#0d0d18',
                                                                    border: '1px solid #2a2a3e',
                                                                    borderRadius: 8,
                                                                    padding: '10px 12px',
                                                                    color: '#ef4444',
                                                                    fontSize: 14,
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    fontWeight: 700,
                                                                    boxSizing: 'border-box'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/pages/index.tsx",
                                                                lineNumber: 286,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 284,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 278,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 270,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            gridColumn: '1 / -1',
                                            display: 'flex',
                                            gap: 12,
                                            justifyContent: 'flex-end'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: resetConfig,
                                                style: {
                                                    padding: '10px 24px',
                                                    borderRadius: 8,
                                                    border: '1px solid #2a2a3e',
                                                    background: 'transparent',
                                                    color: '#71717a',
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                },
                                                children: "Reset Default"
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 294,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: saveConfig,
                                                disabled: saving,
                                                style: {
                                                    padding: '10px 32px',
                                                    borderRadius: 8,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    transition: 'all 0.15s',
                                                    background: savedOk ? '#10b981' : '#3b82f6',
                                                    color: '#fff',
                                                    boxShadow: `0 0 20px ${savedOk ? '#10b98140' : '#3b82f640'}`
                                                },
                                                children: saving ? 'Saving...' : savedOk ? '✓ Saved!' : 'Save Config'
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 297,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 293,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/pages/index.tsx",
                                lineNumber: 168,
                                columnNumber: 13
                            }, this),
                            activeTab === 'logs' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 14,
                                                    color: '#71717a'
                                                },
                                                children: [
                                                    logs.length,
                                                    " entries · auto-refresh every 3s"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 312,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: fetchLogs,
                                                        style: {
                                                            padding: '8px 16px',
                                                            borderRadius: 8,
                                                            border: '1px solid #2a2a3e',
                                                            background: 'transparent',
                                                            color: '#a1a1aa',
                                                            cursor: 'pointer',
                                                            fontSize: 13
                                                        },
                                                        children: "↻ Refresh"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: clearLogs,
                                                        style: {
                                                            padding: '8px 16px',
                                                            borderRadius: 8,
                                                            border: '1px solid #3f1a1a',
                                                            background: '#1f0a0a',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            fontSize: 13
                                                        },
                                                        children: "🗑 Clear Logs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/pages/index.tsx",
                                                        lineNumber: 317,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 315,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 311,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8
                                        },
                                        children: [
                                            logs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '60px',
                                                    color: '#52525b',
                                                    background: '#111118',
                                                    borderRadius: 12,
                                                    border: '1px solid #1f1f2e'
                                                },
                                                children: "No logs yet. Run a test case to see requests here."
                                            }, void 0, false, {
                                                fileName: "[project]/src/pages/index.tsx",
                                                lineNumber: 323,
                                                columnNumber: 19
                                            }, this),
                                            logs.map((log)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: '#111118',
                                                        border: '1px solid #1f1f2e',
                                                        borderRadius: 10,
                                                        overflow: 'hidden'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            onClick: ()=>setExpandedLog(expandedLog === log.id ? null : log.id),
                                                            style: {
                                                                padding: '12px 16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 12,
                                                                cursor: 'pointer',
                                                                userSelect: 'none'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                        padding: '3px 8px',
                                                                        borderRadius: 4,
                                                                        background: `${ENDPOINT_COLORS[log.endpoint]}22`,
                                                                        color: ENDPOINT_COLORS[log.endpoint],
                                                                        minWidth: 80,
                                                                        textAlign: 'center'
                                                                    },
                                                                    children: ENDPOINT_LABELS[log.endpoint]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 331,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        fontWeight: 700,
                                                                        padding: '3px 8px',
                                                                        borderRadius: 4,
                                                                        minWidth: 40,
                                                                        textAlign: 'center',
                                                                        background: log.response_status >= 200 && log.response_status < 300 ? '#10b98122' : '#ef444422',
                                                                        color: log.response_status >= 200 && log.response_status < 300 ? '#10b981' : '#ef4444'
                                                                    },
                                                                    children: log.response_status || '—'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 334,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        fontFamily: 'JetBrains Mono, monospace',
                                                                        color: '#a1a1aa',
                                                                        flex: 1
                                                                    },
                                                                    children: log.path
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 341,
                                                                    columnNumber: 23
                                                                }, this),
                                                                log.note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: '#71717a',
                                                                        fontStyle: 'italic'
                                                                    },
                                                                    children: log.note
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 342,
                                                                    columnNumber: 36
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: '#52525b',
                                                                        fontFamily: 'JetBrains Mono, monospace'
                                                                    },
                                                                    children: new Date(log.timestamp).toLocaleTimeString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 343,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: '#52525b',
                                                                        fontSize: 12
                                                                    },
                                                                    children: expandedLog === log.id ? '▲' : '▼'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 21
                                                        }, this),
                                                        expandedLog === log.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                borderTop: '1px solid #1f1f2e',
                                                                padding: 16,
                                                                display: 'grid',
                                                                gridTemplateColumns: '1fr 1fr',
                                                                gap: 16
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: 11,
                                                                                color: '#71717a',
                                                                                marginBottom: 8,
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.06em'
                                                                            },
                                                                            children: "Request Body"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 350,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                                                            style: {
                                                                                margin: 0,
                                                                                fontSize: 11,
                                                                                color: '#a1a1aa',
                                                                                background: '#0a0a0f',
                                                                                padding: 12,
                                                                                borderRadius: 8,
                                                                                overflow: 'auto',
                                                                                maxHeight: 200
                                                                            },
                                                                            children: JSON.stringify(log.request_body, null, 2)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 351,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 349,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: 11,
                                                                                color: '#71717a',
                                                                                marginBottom: 8,
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.06em'
                                                                            },
                                                                            children: "Response Body"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 356,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                                                            style: {
                                                                                margin: 0,
                                                                                fontSize: 11,
                                                                                color: '#a1a1aa',
                                                                                background: '#0a0a0f',
                                                                                padding: 12,
                                                                                borderRadius: 8,
                                                                                overflow: 'auto',
                                                                                maxHeight: 200
                                                                            },
                                                                            children: log.response_body
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 357,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 355,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        gridColumn: '1 / -1'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: 11,
                                                                                color: '#71717a',
                                                                                marginBottom: 8,
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.06em'
                                                                            },
                                                                            children: "Request Headers"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 362,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                                                            style: {
                                                                                margin: 0,
                                                                                fontSize: 11,
                                                                                color: '#71717a',
                                                                                background: '#0a0a0f',
                                                                                padding: 12,
                                                                                borderRadius: 8,
                                                                                overflow: 'auto',
                                                                                maxHeight: 150
                                                                            },
                                                                            children: JSON.stringify(log.request_headers, null, 2)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/pages/index.tsx",
                                                                            lineNumber: 363,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/pages/index.tsx",
                                                                    lineNumber: 361,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, log.id, true, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/pages/index.tsx",
                                        lineNumber: 321,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/pages/index.tsx",
                                lineNumber: 310,
                                columnNumber: 13
                            }, this),
                            activeTab === 'trigger' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    maxWidth: 600
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#111118',
                                        border: '1px solid #1f1f2e',
                                        borderRadius: 12,
                                        padding: 24
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            style: {
                                                margin: '0 0 20px',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#a1a1aa',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em'
                                            },
                                            children: "Manual Trigger Delivery Report"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 379,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#71717a',
                                                        marginBottom: 6
                                                    },
                                                    children: "DR Type"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 382,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                    value: triggerForm.type,
                                                    onChange: (e)=>setTriggerForm({
                                                            ...triggerForm,
                                                            type: e.target.value
                                                        }),
                                                    style: {
                                                        width: '100%',
                                                        background: '#0d0d18',
                                                        border: '1px solid #2a2a3e',
                                                        borderRadius: 8,
                                                        padding: '10px 12px',
                                                        color: '#e4e4e7',
                                                        fontSize: 14,
                                                        boxSizing: 'border-box'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "wa_sent",
                                                            children: "WA SENT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "wa_delivered",
                                                            children: "WA DELIVERED"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 386,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "sms",
                                                            children: "SMS DELIVERED"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 387,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 381,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#71717a',
                                                        marginBottom: 6
                                                    },
                                                    children: "Message ID / WAMID"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 392,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    value: triggerForm.message_id,
                                                    onChange: (e)=>setTriggerForm({
                                                            ...triggerForm,
                                                            message_id: e.target.value
                                                        }),
                                                    placeholder: "wamid.HBgN... or 278ff10014af4e32...",
                                                    style: {
                                                        width: '100%',
                                                        background: '#0d0d18',
                                                        border: '1px solid #2a2a3e',
                                                        borderRadius: 8,
                                                        padding: '10px 12px',
                                                        color: '#e4e4e7',
                                                        fontSize: 13,
                                                        fontFamily: 'JetBrains Mono, monospace',
                                                        boxSizing: 'border-box'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 393,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 391,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 6
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: '#71717a'
                                                            },
                                                            children: "Delay"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: 14,
                                                                fontWeight: 700,
                                                                color: '#8b5cf6',
                                                                fontFamily: 'JetBrains Mono, monospace'
                                                            },
                                                            children: [
                                                                triggerForm.delay_seconds,
                                                                "s"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/pages/index.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "range",
                                                    min: 0,
                                                    max: 60,
                                                    value: triggerForm.delay_seconds,
                                                    onChange: (e)=>setTriggerForm({
                                                            ...triggerForm,
                                                            delay_seconds: parseInt(e.target.value)
                                                        }),
                                                    style: {
                                                        width: '100%',
                                                        accentColor: '#8b5cf6'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 403,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 398,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: triggerDR,
                                            style: {
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: 8,
                                                border: 'none',
                                                background: '#8b5cf6',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                boxShadow: '0 0 20px #8b5cf640'
                                            },
                                            children: "🚀 Send DR to Callback URL"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 408,
                                            columnNumber: 17
                                        }, this),
                                        triggerResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#71717a',
                                                        marginBottom: 6
                                                    },
                                                    children: "Result"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                                    style: {
                                                        margin: 0,
                                                        fontSize: 12,
                                                        color: '#10b981',
                                                        background: '#0a0a0f',
                                                        padding: 12,
                                                        borderRadius: 8
                                                    },
                                                    children: triggerResult
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 413,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 24,
                                                padding: 16,
                                                background: '#0d0d18',
                                                borderRadius: 8,
                                                border: '1px solid #1f1f2e'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#71717a',
                                                        marginBottom: 6
                                                    },
                                                    children: "Current Callback URL target:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#3b82f6',
                                                        fontFamily: 'JetBrains Mono, monospace',
                                                        wordBreak: 'break-all'
                                                    },
                                                    children: config.callback_url
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.tsx",
                                                    lineNumber: 423,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.tsx",
                                            lineNumber: 421,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/pages/index.tsx",
                                    lineNumber: 378,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/pages/index.tsx",
                                lineNumber: 377,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1tt9l5-._.js.map