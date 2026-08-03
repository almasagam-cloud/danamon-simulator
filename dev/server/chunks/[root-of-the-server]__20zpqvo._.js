module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/types.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Scenarios ─────────────────────────────────────────────
__turbopack_context__.s([
    "DEFAULT_CONFIG",
    ()=>DEFAULT_CONFIG
]);
const DEFAULT_CONFIG = {
    wa_scenario: 'wa_success',
    sms_scenario: 'sms_success',
    wa_sent_delay_seconds: 2,
    wa_delivered_delay_seconds: 5,
    sms_dr_delay_seconds: 3,
    coster_success_body: JSON.stringify({
        meta: {
            author: 'jatis mobile',
            meta: '0.0.1'
        },
        contacts: [
            {
                input: '{{to}}',
                wa_id: '{{to}}'
            }
        ],
        messages: [
            {
                id: '{{wamid}}',
                xid: '{{xid}}'
            }
        ]
    }, null, 2),
    coster_error_body: JSON.stringify({
        meta: {
            author: 'jatis mobile',
            meta: '0.0.1'
        },
        errors: [
            {
                code: 1006,
                title: 'Required parameter is missing or invalid',
                details: 'Unknown Contact'
            }
        ]
    }, null, 2),
    coster_error_status: 500,
    jns_success_body: 'Status=1&MessageId={{message_id}}',
    jns_error_body: 'Status=0&ErrorMessage=Provider+unavailable',
    jns_error_status: 500,
    callback_url: 'https://stg-otpdanamon.devmobilejatis.com/v1/callback',
    updated_at: new Date().toISOString()
};
}),
"[project]/src/lib/mongodb.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs, [project]/node_modules/mongodb)");
;
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'danamon';
let client;
let clientPromise;
if ("TURBOPACK compile-time truthy", 1) {
    if (!/*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise) {
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__["MongoClient"](uri);
        /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise = client.connect();
    }
    clientPromise = /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise;
} else //TURBOPACK unreachable
;
async function getDb() {
    const c = await clientPromise;
    return c.db(dbName);
}
const __TURBOPACK__default__export__ = clientPromise;
}),
"[project]/src/lib/helpers.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "appendLog",
    ()=>appendLog,
    "clearLogs",
    ()=>clearLogs,
    "generateJnsMessageId",
    ()=>generateJnsMessageId,
    "generateWamid",
    ()=>generateWamid,
    "generateXid",
    ()=>generateXid,
    "getConfig",
    ()=>getConfig,
    "getLogs",
    ()=>getLogs,
    "interpolateCosterSuccess",
    ()=>interpolateCosterSuccess,
    "interpolateJnsSuccess",
    ()=>interpolateJnsSuccess,
    "saveConfig",
    ()=>saveConfig,
    "scheduleDR",
    ()=>scheduleDR
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$uuid$29$__ = __turbopack_context__.i("[externals]/uuid [external] (uuid, esm_import, [project]/node_modules/uuid)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$uuid$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$uuid$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const COLLECTION_CONFIG = 'simulator_config';
const COLLECTION_LOGS = 'simulator_logs';
const CONFIG_DOC_ID = 'active';
function generateWamid(to) {
    const rand = Buffer.from((0, __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$uuid$29$__["v4"])().replace(/-/g, '')).toString('base64').replace(/=/g, '');
    return `wamid.HBgN${to}UCABEYE${rand.substring(0, 8)}=`;
}
function generateXid() {
    return String(Math.floor(1000000000 + Math.random() * 9000000000));
}
function generateJnsMessageId() {
    return Array.from({
        length: 22
    }, ()=>Math.floor(Math.random() * 16).toString(16)).join('');
}
function interpolateCosterSuccess(template, to) {
    const wamid = generateWamid(to);
    const xid = generateXid();
    return template.replace(/\{\{wamid\}\}/g, wamid).replace(/\{\{xid\}\}/g, xid).replace(/\{\{to\}\}/g, to);
}
function interpolateJnsSuccess(template) {
    const messageId = generateJnsMessageId();
    return template.replace(/\{\{message_id\}\}/g, messageId);
}
async function getConfig() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getDb"])();
    const doc = await db.collection(COLLECTION_CONFIG).findOne({
        _id: CONFIG_DOC_ID
    });
    if (!doc) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...config } = doc;
    return config;
}
async function saveConfig(config) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getDb"])();
    const existing = await getConfig();
    const updated = {
        ...existing,
        ...config,
        updated_at: new Date().toISOString()
    };
    await db.collection(COLLECTION_CONFIG).replaceOne({
        _id: CONFIG_DOC_ID
    }, {
        _id: CONFIG_DOC_ID,
        ...updated
    }, {
        upsert: true
    });
    return updated;
}
async function appendLog(log) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getDb"])();
    const entry = {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$uuid__$5b$external$5d$__$28$uuid$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$uuid$29$__["v4"])(),
        timestamp: new Date().toISOString(),
        ...log
    };
    await db.collection(COLLECTION_LOGS).insertOne(entry);
    return entry;
}
async function getLogs(limit = 100) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getDb"])();
    const docs = await db.collection(COLLECTION_LOGS).find({}).sort({
        timestamp: -1
    }).limit(limit).toArray();
    return docs.map(({ _id, ...rest })=>rest);
}
async function clearLogs() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getDb"])();
    await db.collection(COLLECTION_LOGS).deleteMany({});
}
function scheduleDR(callbackUrl, drBody, delaySeconds, label) {
    setTimeout(async ()=>{
        try {
            const res = await fetch(callbackUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(drBody)
            });
            const text = await res.text();
            await appendLog({
                endpoint: 'dr_sent',
                method: 'POST',
                path: callbackUrl,
                request_headers: {
                    'Content-Type': 'application/json'
                },
                request_body: drBody,
                response_status: res.status,
                response_body: text,
                note: label
            });
        } catch (err) {
            await appendLog({
                endpoint: 'dr_sent',
                method: 'POST',
                path: callbackUrl,
                request_headers: {
                    'Content-Type': 'application/json'
                },
                request_body: drBody,
                response_status: 0,
                response_body: String(err),
                note: `${label} — FAILED`
            });
        }
    }, delaySeconds * 1000);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/pages/api/admin/config.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/helpers.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/types.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function handler(req, res) {
    if (req.method === 'GET') {
        const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getConfig"])();
        return res.status(200).json(config);
    }
    if (req.method === 'POST') {
        const partial = req.body || {};
        const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["saveConfig"])(partial);
        return res.status(200).json({
            ok: true,
            config: updated
        });
    }
    if (req.method === 'DELETE') {
        const reset = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$helpers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["saveConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$types$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"]);
        return res.status(200).json({
            ok: true,
            config: reset
        });
    }
    return res.status(405).json({
        error: 'Method not allowed'
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20zpqvo._.js.map