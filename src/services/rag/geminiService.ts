/**
 * Foody Loop Gemini AI Integration Service
 * Uses native browser fetch to guarantee zero-lag, zero-reload execution across all devices
 */

import type { AppCacheState } from '../cache';
import { retrieveRelevantChunks } from './ragEngine';

export interface GeminiRagResponse {
  text: string;
  isOffTopic: boolean;
  provider: 'gemini' | 'local_rag';
}

export async function askGeminiRag(
  query: string,
  state: AppCacheState
): Promise<GeminiRagResponse | null> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  const isHindi = state.language === 'hi';
  const relevantChunks = retrieveRelevantChunks(query, 3);

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];
  const currentNgo = state.ngos.find(n => n.id === state.activeNgoId) || state.ngos[0];

  // Construct grounded system context with statutory guidelines and live session state
  const systemInstructionText = `
You are "Foody Loop AI Sahayak", the official intelligent assistant for Foody Loop — an ultra-fast surplus food recovery and redistribution platform operating across the Braj region (Mathura, Vrindavan, Govardhan, Barsana).

CRITICAL PRODUCT GUARDRAILS:
1. ONLY answer queries directly related to:
   - Foody Loop platform workflows (donating food, claiming meals, ashram allocation, delivery riders).
   - Handover OTP protocol: The shopkeeper sees the 4-digit OTP; the NGO/ashram must obtain this OTP from the shopkeeper upon receiving the food and enter it in their portal to confirm handover.
   - Statutory FSSAI 2019 Food Safety & Hygiene regulations:
     * Hot cooked food holding: >= 60°C.
     * Cold / chilled food holding: <= 5°C.
     * Maximum safe consumption/distribution window: within 2 hours of pickup.
     * Transport in insulated, food-grade covered containers.
   - 80G tax exemptions and sponsor meal annadaan.
2. If the user asks anything outside Foody Loop and food safety (e.g., general world facts, politics, coding, gossip, movies), politely decline with warm respect and guide them back to Foody Loop topics.

CURRENT USER CONTEXT:
- Active Portal: ${state.portal}
- Active User Role: ${state.role}
- Language: ${isHindi ? 'Hindi (हिंदी)' : 'English'}
- Shop Info: ${currentShop ? `${currentShop.name} (FSSAI #${currentShop.fssaiNumber}, City: ${currentShop.city})` : 'None'}
- Ashram / NGO Info: ${currentNgo ? `${currentNgo.name} (Capacity: ${currentNgo.capacity} meals/day, City: ${currentNgo.city})` : 'None'}

RETRIEVED STATUTORY KNOWLEDGE BASE CHUNKS:
${relevantChunks.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${isHindi ? c.hindiContent : c.content}`).join('\n\n')}

FORMATTING INSTRUCTIONS:
- Use clean Markdown (**bold** for key terms, *italics* for notes, bullet lists with "• ").
- Keep responses concise, warm, helpful, and market-friendly.
- Reply in ${isHindi ? 'Hindi' : 'English'}.
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `User Question: "${query}"` }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      // If error (e.g. 401 unauthenticated or rate-limited), fallback cleanly without throwing
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text?.trim();

    if (replyText) {
      return {
        text: replyText,
        isOffTopic: replyText.toLowerCase().includes('foody loop') && (replyText.includes('केवल') || replyText.includes('exclusively') || replyText.includes('guardrail')),
        provider: 'gemini'
      };
    }
    return null;
  } catch (err: any) {
    // Graceful offline fallback
    return null;
  }
}
