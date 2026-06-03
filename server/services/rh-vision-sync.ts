// Serviço de sincronização de vagas do Portal Shigueno → RH Vision

const RH_VISION_URL = process.env.RH_VISION_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.SHIGUENO_WEBHOOK_SECRET || 'shigueno-webhook-2026';

async function sendToRhVision(path: string, body: object): Promise<boolean> {
  try {
    const response = await fetch(`${RH_VISION_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[RH Vision Sync] HTTP ${response.status}: ${text}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[RH Vision Sync] Falha ao conectar no RH Vision:', err);
    return false;
  }
}

export async function syncVacancyToRhVision(
  action: 'upsert' | 'delete',
  vacancy: {
    id: number;
    title: string;
    department?: string;
    description?: string;
    location?: string;
    requirements?: string;
    status?: string;
  }
): Promise<boolean> {
  return sendToRhVision('/api/webhook/shigueno/vacancies', { action, vacancy });
}

export async function syncCandidateToRhVision(
  candidate: {
    name: string;
    email: string;
    phone?: string;
    cv_text?: string;
  },
  vacancy_id?: number | null
): Promise<boolean> {
  return sendToRhVision('/api/webhook/shigueno/candidates', { candidate, vacancy_id });
}
