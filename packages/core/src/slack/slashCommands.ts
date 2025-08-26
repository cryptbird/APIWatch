/**
 * Slack slash command: /apiwatch status <api-name>, subscribe <api-name>, unsubscribe <api-name>.
 */

export interface SlashCommandPayload {
  command: string;
  text: string;
  user_id: string;
  channel_id: string;
}

export function parseApiwatchCommand(text: string): { action: 'status' | 'subscribe' | 'unsubscribe'; apiName?: string } {
  const parts = text.trim().split(/\s+/);
  const action = (parts[0] ?? 'status') as 'status' | 'subscribe' | 'unsubscribe';
  const apiName = parts[1];
  return { action, apiName };
}
