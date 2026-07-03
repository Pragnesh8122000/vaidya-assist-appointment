export function sendPatientMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  conversationState: Record<string, unknown> | null
): Promise<Record<string, unknown>>;