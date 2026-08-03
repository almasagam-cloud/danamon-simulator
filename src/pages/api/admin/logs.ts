import type { NextApiRequest, NextApiResponse } from 'next';
import { getLogs, clearLogs } from '@/lib/helpers';

/**
 * GET    /api/admin/logs?limit=100  → return logs (newest first)
 * DELETE /api/admin/logs            → clear all logs
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const limit = parseInt(String(req.query.limit || '100'), 10);
    const logs = await getLogs(limit);
    return res.status(200).json({ count: logs.length, logs });
  }

  if (req.method === 'DELETE') {
    await clearLogs();
    return res.status(200).json({ ok: true, message: 'Logs cleared' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
