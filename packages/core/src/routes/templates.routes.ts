/**
 * Custom notification templates and preview endpoint.
 */

import type { FastifyInstance } from 'fastify';
import { renderTemplate } from '../notifications/TemplateService.js';

export async function templatesRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { type: string } }>('/api/templates/preview', async (req, reply) => {
    const type = (req.query as { type?: string }).type ?? 'critical';
    const html = renderTemplate(type, { changeSummary: 'Sample change summary' });
    return reply.send({ type, html });
  });
}
