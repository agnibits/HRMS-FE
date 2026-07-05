import { request } from '@/api/client';

/**
 * AI features — powered by Google Gemini (free tier) on the backend.
 * All endpoints live under /ai/* and return the standard { data } envelope.
 * Chat is a simple request/response (Gemini Flash is fast); the reply text
 * comes back as data.reply.
 */
export const aiService = {
  /** messages: [{ role: 'user'|'assistant', content }]; context: optional page hint. */
  chat: (messages, context) =>
    request({ method: 'POST', url: '/ai/chat', data: { messages, context } }),

  generateJD: (payload) =>
    request({ method: 'POST', url: '/ai/generate-jd', data: payload }),

  screenResume: (payload) =>
    request({ method: 'POST', url: '/ai/screen-resume', data: payload }),

  summarizeDocument: (payload) =>
    request({ method: 'POST', url: '/ai/summarize-document', data: payload }),
};

export default aiService;
