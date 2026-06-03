import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Allow all safe read operations (GET)
  if (req.method === 'GET') {
    return next();
  }

  const path = req.originalUrl || req.url;

  // 2. Allow public logins
  if (path.endsWith('/login')) {
    return next();
  }

  // 3. Allow candidates to apply for jobs publicly (POST to /api/candidates)
  if (path.endsWith('/candidates') && req.method === 'POST') {
    return next();
  }

  // 3b. Allow driver routing and telemetry writes publicly (POST/PUT on routes)
  if ((path.includes('/routes') || path.match(/\/routes\/\d+/)) && (req.method === 'POST' || req.method === 'PUT')) {
    return next();
  }

  // 3c. Allow public chatbot queries (POST to /api/chatbot)
  if (path.endsWith('/chatbot') && req.method === 'POST') {
    return next();
  }

  // 3d. Integration routes use their own API Key auth — bypass this middleware
  if (path.includes('/integration/')) {
    return next();
  }

  // 3e. RH Vision webhook routes use their own X-Webhook-Secret auth
  if (path.includes('/rh-vision/')) {
    return next();
  }

  // 4. Validate authentication token for administrative mutations
  const token = req.headers.authorization || req.headers['x-shigueno-token'];

  if (token === 'simulated-shigueno-jwt-token' || token === 'Bearer simulated-shigueno-jwt-token') {
    return next();
  }

  return res.status(401).json({ 
    success: false, 
    error: 'Acesso recusado. Sessão SQLite expirada ou não autenticada.' 
  });
}
