/**
 * Foody Loop Personalized RAG (Retrieval-Augmented Generation) Engine
 * Features:
 * 1. Out-of-Scope Guardrail: Politely rejects non-product / non-Foody Loop queries
 * 2. Hybrid Lexical & Semantic Retrieval over RAG Knowledge Base
 * 3. Dynamic Session State Personalization (User Role, Shop/NGO Name, Live Active OTP, City)
 * 4. Multi-lingual Support (Hindi & English)
 */

import { RAG_KNOWLEDGE_BASE, KnowledgeChunk } from './knowledgeBase';
import type { AppCacheState } from '../cache';
import type { Shop, Ngo, Donation } from '../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isOffTopic?: boolean;
  suggestedActions?: { label: string; actionQuery: string }[];
}

export interface RagContextInput {
  query: string;
  state: AppCacheState;
}

// Set of authorized platform domains & keywords
const ON_TOPIC_KEYWORDS = [
  'food', 'भोजन', 'loop', 'foody', 'दान', 'donate', 'donation', 'surplus', 'अतिरिक्त',
  'otp', 'ओटीपी', 'code', 'कोड', 'handover', 'हैंडओवर', 'pickup', 'पिकअप', 'verify', 'सत्यापन',
  'fssai', 'एफएसएसएआई', 'safety', 'सुरक्षा', 'temperature', 'तापमान', 'hot', 'गरम', 'cold', 'chilled', 'expiry',
  'shop', 'दुकान', 'restaurant', 'रेस्टोरेंट', 'halwai', 'हलवाई', 'kitchen', 'रसोई', 'item', 'items', 'dish', 'dishes', 'menu', 'व्यंजन',
  'ngo', 'एनजीओ', 'ashram', 'आश्रम', 'claim', 'दावा', 'widow', 'विधवा', 'elder', 'वृद्ध', 'capacity', 'क्षमता',
  'volunteer', 'सेवादार', 'rider', 'राइडर', 'courier', 'कूरियर', 'delivery', 'वितरण', 'partner', 'पार्टनर', 'benefit', 'benefits', 'perk', 'perks', 'सुविधा', 'लाभ', 'भत्ता', 'insurance', 'बीमा',
  'hands on food', 'hands', 'हाथ रखना', 'हाथ', 'रुचि', 'interest',
  'map', 'मैप', 'radar', 'रडार', 'live map', 'gps', 'नक्शा', 'transit', 'tracking', 'ट्रैकिंग', 'dispatch', 'डिस्पैच',
  'category', 'categories', 'three categories', '3 categories', 'श्रेणी', 'pros', 'features', 'benefits', 'fayde', 'फायदे', 'policy', 'policies', 'नियम', 'नीति',
  'sponsor', 'प्रायोजन', 'annadaan', 'अन्नदान', 'birthday', 'जन्मदिन', 'punyatithi', 'पुण्यतिथि', '80g', 'tax', 'certificate', 'प्रमाण पत्र',
  'admin', 'एडमिन', 'officer', 'अधिकारी', 'regulator', 'audit', 'ऑडिट', 'license', 'लाइसेंस', 'permit', 'परमिट',
  'mathura', 'मथुरा', 'vrindavan', 'वृन्दावन', 'barsana', 'बरसाना', 'govardhan', 'गोवर्धन', 'braj', 'बृज',
  'thali', 'थाली', 'meals', 'meal', 'khichdi', 'खिचड़ी', 'poori', 'पूरी', 'dal', 'दाल', 'sabzi', 'सब्जी', 'roti', 'रोटी',
  'login', 'लॉगिन', 'register', 'पंजीकरण', 'pin', 'पिन', 'password', 'पासवर्ड', 'account', 'खाता',
  'app', 'ऐप', 'portal', 'पोर्टल', 'dashboard', 'डैशबोर्ड', 'how', 'कैसे', 'kya', 'क्या', 'help', 'मदद', 'sahayak', 'सहायक'
];

/**
 * Validates whether user query is within product scope
 */
export function isQueryOnTopic(query: string): boolean {
  const clean = query.toLowerCase().trim();
  
  // Very short generic greetings are allowed
  if (/^(hi|hello|hey|namaste|radhe radhe|hare krishna|pranam|नमस्ते|राधे राधे|जय श्री कृष्णा|प्रणाम)$/i.test(clean)) {
    return true;
  }

  // Check if at least one on-topic keyword exists
  const hasKeyword = ON_TOPIC_KEYWORDS.some(kw => clean.includes(kw));
  if (hasKeyword) return true;

  // Check common platform question patterns
  if (/(app|kaise|karna|chahiye|flow| नियम|kaam|kaise kare|karega)/i.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Retrieves top matching knowledge chunks using hybrid relevance scoring
 */
export function retrieveRelevantChunks(query: string, maxResults = 3): KnowledgeChunk[] {
  const clean = query.toLowerCase();
  const queryTokens = clean.split(/\s+/).filter(w => w.length > 2);

  const scored = RAG_KNOWLEDGE_BASE.map(chunk => {
    let score = 0;

    // Check keyword hits
    for (const kw of chunk.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 8;
      }
    }

    // Check token frequency in title and content
    for (const token of queryTokens) {
      if (chunk.title.toLowerCase().includes(token)) score += 5;
      if (chunk.hindiTitle.toLowerCase().includes(token)) score += 5;
      if (chunk.content.toLowerCase().includes(token)) score += 2;
      if (chunk.hindiContent.toLowerCase().includes(token)) score += 2;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return highest scored chunks (minimum threshold)
  return scored
    .filter(item => item.score > 2)
    .slice(0, maxResults)
    .map(item => item.chunk);
}

/**
 * Formulates a personalized, context-rich response using retrieved RAG chunks and live state
 */
export function generateRagResponse(input: RagContextInput): ChatMessage {
  const { query, state } = input;
  const isHindi = state.language === 'hi';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. GUARDRAIL: Check if query is off-topic
  if (!isQueryOnTopic(query)) {
    const politeDeclineText = isHindi
      ? `🙏 नमस्ते! मैं **Foody Loop AI सहायक** हूँ।\n\nमैं केवल **Foody Loop प्लेटफ़ॉर्म**, अतिरिक्त भोजन दान (Surplus Food Recovery), FSSAI खाद्य सुरक्षा नियमों, 4-अंकीय हैंडओवर ओटीपी एवं आश्रम सेवा से जुड़े प्रश्नों में आपकी सहायता कर सकता हूँ।\n\nकृपया Foody Loop से संबंधित प्रश्न पूछें (जैसे भोजन दान कैसे करें, ओटीपी कहाँ भरें, या आश्रम क्षमता कैसे बढ़ाएं)।`
      : `🙏 Greetings! I am the **Foody Loop AI Assistant**.\n\nI am specifically dedicated to helping with **Foody Loop platform operations**, surplus food recovery workflows, FSSAI statutory safety standards, 4-digit pickup OTP verification, and ashram meal distribution.\n\nPlease ask questions related to Foody Loop (e.g. how to donate surplus meals, where to enter pickup OTP, or food safety holding guidelines).`;

    return {
      id: 'msg-' + Date.now(),
      sender: 'bot',
      text: politeDeclineText,
      timestamp,
      isOffTopic: true,
      suggestedActions: [
        { label: isHindi ? 'ओटीपी कैसे काम करता है?' : 'How OTP works?', actionQuery: isHindi ? 'ओटीपी सत्यापन कैसे काम करता है?' : 'How does the OTP verification work?' },
        { label: isHindi ? 'भोजन दान नियम' : 'Food Safety Rules', actionQuery: isHindi ? 'FSSAI भोजन सुरक्षा नियम क्या हैं?' : 'What are FSSAI temperature holding rules?' },
        { label: isHindi ? 'आश्रम के लिए भोजन प्राप्त करें' : 'Claim for Ashram', actionQuery: isHindi ? 'आश्रम हेतु भोजन कैसे क्लेम करें?' : 'How can Ashrams claim surplus food?' }
      ]
    };
  }

  // 2. Personalization variables based on live state
  const currentShop = state.shops.find((s: Shop) => s.id === state.activeShopId) || state.shops[0];
  const currentNgo = state.ngos.find((n: Ngo) => n.id === state.activeNgoId) || state.ngos[0];
  const activeHandover = state.donations.find((d: Donation) => 
    d.status === 'MATCHED' || d.status === 'PICKUP_ASSIGNED' || d.status === 'COLLECTED'
  ) || state.donations.find((d: Donation) => d.status === 'AVAILABLE');

  let salutation = '';
  let roleContextNote = '';

  if (state.portal === 'shop') {
    salutation = isHindi
      ? `नमस्कार **${currentShop?.name || 'दुकानदार'}** जी!`
      : `Hello **${currentShop?.name || 'Shop Partner'}** Team!`;
    roleContextNote = isHindi
      ? `(आप **दुकानदार पोर्टल** में हैं • FSSAI #${currentShop?.fssaiNumber || '12723056000412'})`
      : `(Active in **Shopkeeper Portal** • FSSAI #${currentShop?.fssaiNumber || '12723056000412'})`;
  } else if (state.portal === 'ngo_donor') {
    if (state.role === 'ngo') {
      salutation = isHindi
        ? `राधे-राधे! **${currentNgo?.name || 'आश्रम'}** सेवा दल!`
        : `Radhe Radhe! **${currentNgo?.name || 'Ashram Team'}**!`;
      roleContextNote = isHindi
        ? `(दैनिक आश्रम क्षमता: **${currentNgo?.capacity || 400} थाली/दिन**)`
        : `(Daily Recovery Capacity: **${currentNgo?.capacity || 400} meals/day**)`;
    } else if (state.role === 'donor') {
      salutation = isHindi
        ? `सादर प्रणाम अन्नदाता जी!`
        : `Warm greetings dear Sponsor & Annadaata!`;
      roleContextNote = isHindi
        ? `(स्मृति अन्नदान प्रायोजन व 80G आयकर छूट)`
        : `(Commemorative Annadaan & 80G Tax Deduction Portal)`;
    } else {
      salutation = isHindi
        ? `जय श्री कृष्णा सेवादार जी!`
        : `Greetings dedicated Courier Volunteer!`;
      roleContextNote = isHindi
        ? `(बृज परिक्रमा हॉट-मील डिलीवरी नेटवर्क)`
        : `(Braj Parikrama Hot-Meal Delivery Fleet)`;
    }
  } else if (state.portal === 'admin') {
    salutation = isHindi
      ? `आदरणीय खाद्य सुरक्षा अधिकारी (FSO) महोदय!`
      : `Respected Food Safety Officer & System Administrator!`;
    roleContextNote = isHindi
      ? `(मथुरा जिला विनियामक कंट्रोल रूम)`
      : `(Mathura District Regulatory Control Room)`;
  } else {
    salutation = isHindi
      ? `नमस्ते! Foody Loop में आपका स्वागत है!`
      : `Welcome to Foody Loop Smart Food Recovery!`;
  }

  // 3. RETRIEVAL: Find top relevant chunks
  const chunks = retrieveRelevantChunks(query, 2);

  // 4. GENERATION: Build structured personalized response
  let answerBody = '';

  if (chunks.length > 0) {
    answerBody = chunks
      .map(c => isHindi ? c.hindiContent : c.content)
      .join('\n\n---\n\n');
  } else {
    // Fallback general guidance
    answerBody = isHindi
      ? `Foody Loop मथुरा, वृन्दावन, बरसाना और गोवर्धन में अतिरिक्त भोजन को व्यर्थ होने से बचाकर आश्रमों तक सुरक्षित पहुँचाने का FSSAI-सत्यापित प्लेटफ़ॉर्म है।\n\nयहाँ दुकानदार 60 सेकंड में दान कर सकते हैं, आश्रम 1-क्लिक में दावा कर सकते हैं, और 4-अंकीय ओटीपी के जरिए सुरक्षित हैंडओवर होता है।`
      : `Foody Loop is an FSSAI-compliant smart platform that connects surplus food from sweets shops, caterers, and restaurants directly with elder and widow ashrams in Braj (Mathura, Vrindavan, Barsana, Govardhan) using a secure 4-digit Handover OTP protocol.`;
  }

  // Inject live OTP status if query is about OTP
  let liveOtpSnippet = '';
  if (/otp|code|ओटीपी|हैंडओवर|handover|pickup/i.test(query) && activeHandover) {
    liveOtpSnippet = isHindi
      ? `\n\n💡 **वर्तमान लाइव हैंडओवर स्थिति:**\n- **व्यंजन:** ${activeHandover.foodItem} (${activeHandover.quantity} ${activeHandover.unit})\n- **सुरक्षित ओटीपी:** \`${activeHandover.otpCode || '4928'}\`\n- ${state.portal === 'shop' ? 'यह कोड दुकान पर आने वाले आश्रम प्रतिनिधि को दें।' : 'यह कोड दुकानदार से पूछकर अपने ऐप में दर्ज करें।'}`
      : `\n\n💡 **Current Live Handover Status:**\n- **Item:** ${activeHandover.foodItem} (${activeHandover.quantity} ${activeHandover.unit})\n- **Active OTP Code:** \`${activeHandover.otpCode || '4928'}\`\n- ${state.portal === 'shop' ? 'Provide this code to the arriving ashram courier.' : 'Ask the shopkeeper for this code and enter it in your app.'}`;
  }

  const fullText = `${salutation} ${roleContextNote}\n\n${answerBody}${liveOtpSnippet}`;

  // Personalized suggested follow-ups
  const suggestedActions = state.portal === 'shop' ? [
    { label: isHindi ? 'व्यंजन सूची कैसे जोड़ें?' : 'Add Dishes to Menu', actionQuery: isHindi ? 'रेस्टोरेंट अपने नियमित व्यंजन व आइटम कैसे जोड़ें?' : 'How do restaurants add custom items/dishes?' },
    { label: isHindi ? 'ओटीपी नियम' : 'OTP Rules', actionQuery: isHindi ? 'हैंडओवर ओटीपी दुकानदार के पास क्यों रहता है?' : 'Why does the shopkeeper keep the handover OTP?' },
    { label: isHindi ? '3 श्रेणियां व फायदे' : 'Platform Pros & Features', actionQuery: isHindi ? 'Foody Loop की तीनों श्रेणियों के लाभ व विशेषताएं क्या हैं?' : 'What are the features and benefits of the 3 platform categories?' }
  ] : state.portal === 'admin' ? [
    { label: isHindi ? 'दुकानों का सत्यापन' : 'Verify Shops', actionQuery: isHindi ? 'नई दुकानों को कैसे अधिकृत (Permit) करें?' : 'How to authorize pending shops?' },
    { label: isHindi ? 'कॉन्करेंसी सुरक्षा' : 'Concurrency Lock', actionQuery: isHindi ? 'डबल क्लेम रोकने की व्यवस्था क्या है?' : 'How does the atomic concurrency lock work?' }
  ] : state.role === 'volunteer' ? [
    { label: isHindi ? 'डिलीवरी सेवादार लाभ' : 'Rider Perks & Benefits', actionQuery: isHindi ? 'डिलीवरी सेवादारों को आश्रम व एनजीओ से क्या लाभ मिलते हैं?' : 'What benefits and perks do delivery partners receive from NGOs?' },
    { label: isHindi ? 'लाइव मैप व नेविगेशन' : 'Live Map Navigation', actionQuery: isHindi ? 'लाइव मैप पर राइडर की लोकेशन व दुकान तक रूट कैसे दिखता है?' : 'How does the live recovery map show rider route to the shop?' }
  ] : [
    { label: isHindi ? '✋ Hands on Food क्या है?' : '✋ What is Hands on Food?', actionQuery: isHindi ? 'Hands on Food (हाथ रखना) फीचर कैसे काम करता है?' : 'How does the Hands on Food interest sharing feature work?' },
    { label: isHindi ? 'ओटीपी सत्यापन' : 'OTP Verification', actionQuery: isHindi ? 'दुकानदार से ओटीपी लेकर कैसे भरें?' : 'How to enter OTP received from shopkeeper?' },
    { label: isHindi ? 'डिलीवरी राइडर लाभ' : 'Delivery Perks', actionQuery: isHindi ? 'राइडर्स को आश्रम से क्या लाभ और सुविधाएं दी जाती हैं?' : 'What perks do ashrams provide to delivery partners?' }
  ];

  return {
    id: 'msg-' + Date.now(),
    sender: 'bot',
    text: fullText,
    timestamp,
    suggestedActions
  };
}

/**
 * Async RAG Response: Queries Google Gemini API with RAG grounding,
 * automatically falling back to the local RAG engine if Gemini key is missing or offline.
 */
export async function generateRagResponseAsync(input: RagContextInput): Promise<ChatMessage> {
  const { query, state } = input;
  const isHindi = state.language === 'hi';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Check local guardrail first
  if (!isQueryOnTopic(query)) {
    return generateRagResponse(input);
  }

  // 2. Call Google Gemini with grounded RAG context
  try {
    const { askGeminiRag } = await import('./geminiService');
    const geminiResult = await askGeminiRag(query, state);
    if (geminiResult && geminiResult.text) {
      const suggestedActions = state.portal === 'shop' ? [
        { label: isHindi ? 'व्यंजन सूची प्रबंधन' : 'Manage Dishes', actionQuery: isHindi ? 'रेस्टोरेंट अपने नियमित व्यंजन व आइटम कैसे जोड़ें?' : 'How do restaurants add dishes to their menu?' },
        { label: isHindi ? 'ओटीपी नियम' : 'How OTP works', actionQuery: isHindi ? 'हैंडओवर ओटीपी कैसे काम करता है?' : 'How does the handover OTP work?' },
        { label: isHindi ? 'भोजन तापमान नियम (60°C)' : 'Food Temp Limits (60°C)', actionQuery: isHindi ? 'FSSAI के अनुसार गरम भोजन का तापमान कितना होना चाहिए?' : 'What is the required hot holding temperature?' }
      ] : state.role === 'volunteer' ? [
        { label: isHindi ? 'सेवादार लाभ व सुविधाएं' : 'Rider Perks', actionQuery: isHindi ? 'डिलीवरी सेवादारों को आश्रम से क्या लाभ मिलते हैं?' : 'What perks do ashrams provide to delivery partners?' },
        { label: isHindi ? 'लाइव रडार मैप' : 'Live Radar Map', actionQuery: isHindi ? 'लाइव मैप पर राइडर की लोकेशन कैसे दिखती है?' : 'How does the live map track courier location?' }
      ] : [
        { label: isHindi ? '✋ Hands on Food नियम' : '✋ Hands on Food Protocol', actionQuery: isHindi ? 'Hands on Food (हाथ रखना) फीचर कैसे काम करता है?' : 'How does the Hands on Food interest sharing feature work?' },
        { label: isHindi ? 'भोजन दावा प्रक्रिया' : 'How to claim meals', actionQuery: isHindi ? 'आश्रम भोजन का दावा कैसे करें?' : 'How do Ashrams claim surplus food?' },
        { label: isHindi ? 'राइडर लाभ व सुविधाएं' : 'Delivery Perks', actionQuery: isHindi ? 'डिलीवरी पार्टनर्स को क्या लाभ दिए जाते हैं?' : 'What perks are given to delivery partners?' }
      ];

      return {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: geminiResult.text,
        timestamp,
        isOffTopic: geminiResult.isOffTopic,
        suggestedActions
      };
    }
  } catch (e) {
    console.warn('[RAG Engine] Gemini async fallback:', e);
  }

  // 3. Fallback to local RAG engine
  return generateRagResponse(input);
}

