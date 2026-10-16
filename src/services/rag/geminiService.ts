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

CORE STAKEHOLDER CATEGORIES:
1. Shops & Restaurants (दुकानदार / रेस्टोरेंट):
   - Declare surplus meals in 60s or maintain a dish/item list (व्यंजन सूची) with preparation temperature and shelf life for 1-click surplus donation.
   - Retains the secret 4-digit Handover OTP to verify authenticity at pickup.
2. NGOs & Ashrams (एनजीओ व आश्रम):
   - Browse surplus food and place "Hands on Food" (हाथ रखना / दावा रुचि) — multiple NGOs can show interest to co-distribute meals.
   - Enter the shopkeeper's 4-digit OTP upon delivery to complete statutory handover.
   - Provide Seva perks and community benefits to delivery partners.
3. Delivery Partners & Couriers (डिलीवरी सेवादार राइडर):
   - Transport meals in insulated thermal bags (hot-held >=60°C, cold <=5°C) within the 2-hour safety window.
   - Receive community perks from NGOs: Free unlimited ashram prasad/thali, ₹150/shift fuel allowance, ₹2,00,000 accidental cover, and FSSAI seva certificates.
   - Tracked in real-time on the Live Recovery Map during pickup from shop and dropoff at ashram.

HANDS ON FOOD (हाथ रखना / दावा रुचि) PROTOCOL:
- When surplus food is declared, NGOs can place "Hands on Food".
- Multiple NGOs can register interest so no food ever goes to waste.
- Placing hands dispatches the nearest courier immediately; the app displays real-time GPS movement showing where the delivery boy has reached on his way to the restaurant for food pickup.

CRITICAL PRODUCT GUARDRAILS:
1. ONLY answer queries directly related to:
   - Foody Loop platform workflows, 3 categories (Shops, NGOs, Delivery Partners), Live Recovery Map, and "Hands on Food".
   - Delivery partner benefits and ashram community perks.
   - Handover OTP protocol: The shopkeeper sees the 4-digit OTP; the NGO/ashram or courier must obtain this OTP from the shopkeeper upon receiving the food.
   - Statutory FSSAI 2019 Food Safety & Hygiene regulations (>=60°C hot, <=5°C cold, <=2h consumption window, covered food-grade transit).
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
