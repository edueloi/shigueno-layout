import { Request, Response, NextFunction } from 'express';
import { getDb } from '../../server-db';

export async function integrationAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API Key ausente. Envie o header X-Api-Key.' });
  }

  const db = await getDb();
  const client = await db.getIntegrationClient(apiKey);

  if (!client) {
    return res.status(401).json({ success: false, error: 'API Key inválida ou cliente não encontrado.' });
  }

  if (!client.active) {
    return res.status(403).json({ success: false, error: 'Cliente desativado. Entre em contato com o suporte.' });
  }

  (req as any).integrationClient = client;
  next();
}
