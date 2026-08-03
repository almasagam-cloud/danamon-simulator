import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfig, saveConfig } from '@/lib/helpers';
import { DEFAULT_CONFIG } from '@/lib/types';

/**
 * GET  /api/admin/config  → return current config
 * POST /api/admin/config  → update config (partial update supported)
 * DELETE /api/admin/config → reset to default
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const config = await getConfig();
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const partial = req.body || {};
    const updated = await saveConfig(partial);
    return res.status(200).json({ ok: true, config: updated });
  }

  if (req.method === 'DELETE') {
    const reset = await saveConfig(DEFAULT_CONFIG);
    return res.status(200).json({ ok: true, config: reset });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
