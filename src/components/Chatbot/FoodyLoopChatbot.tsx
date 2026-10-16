import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  ShieldCheck,
  Info,
  CheckCheck,
  Lock,
  Thermometer,
  UtensilsCrossed,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { generateRagResponse, generateRagResponseAsync, ChatMessage } from '../../services/rag/ragEngine';

export const FoodyLoopChatbot: React.FC = () => {
  const { state } = useAppState();
  const isHindi = state.language === 'hi';

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];
  const currentNgo = state.ngos.find(n => n.id === state.activeNgoId) || state.ngos[0];

  // Initial welcome message tailored to current active role
  const getInitialMessage = (): ChatMessage => {
    let roleGreeting = '';
    if (state.portal === 'shop') {
      roleGreeting = isHindi
        ? `मैं आपका **दुकानदार AI सहायक** हूँ। आप मुझसे अतिरिक्त भोजन दान, FSSAI तापमान नियम (>=60°C), या अपने **4-अंकीय पिकअप हैंडओवर ओटीपी** से जुड़े प्रश्न पूछ सकते हैं।`
        : `I am your **Shopkeeper AI Assistant**. Ask me about surplus food donation, FSSAI temperature holding (>=60°C), or your **4-digit pickup handover OTP**.`;
    } else if (state.portal === 'ngo_donor') {
      roleGreeting = isHindi
        ? `मैं आपका **आश्रम व अन्नदाता AI सहायक** हूँ। आप मुझसे भोजन का दावा करने, दुकानदार से ओटीपी प्राप्त करने, या अन्नदान प्रायोजन के बारे में पूछ सकते हैं।`
        : `I am your **Ashram & Donor AI Assistant**. Ask me about claiming surplus meals, entering shopkeeper OTP, or sponsoring meals.`;
    } else if (state.portal === 'admin') {
      roleGreeting = isHindi
        ? `मैं आपका **नियामक व खाद्य सुरक्षा AI सहायक** हूँ। आप मुझसे FSSAI विनियामक अनुपालन, नई दुकानों के सत्यापन और सुरक्षा नियमों के बारे में पूछ सकते हैं।`
        : `I am your **Regulatory & Food Safety AI Assistant**. Ask me about statutory FSSAI rules, entity approvals, or audit logging.`;
    } else {
      roleGreeting = isHindi
        ? `मैं **Foody Loop AI सहायक** हूँ। आप मुझसे इस प्लेटफ़ॉर्म, भोजन दान नियमों और पिकअप प्रक्रिया के बारे में कोई भी प्रश्न पूछ सकते हैं।`
        : `I am the **Foody Loop AI Assistant**. Ask me anything about food recovery workflows, safety rules, and pickup procedures.`;
    }

    const note = isHindi
      ? `*(कृपया ध्यान दें: मैं केवल Foody Loop प्लेटफ़ॉर्म व भोजन सुरक्षा संबंधी प्रश्नों का ही उत्तर देता हूँ)*`
      : `*(Note: I am designed exclusively for Foody Loop platform and food safety questions)*`;

    return {
      id: 'init-msg',
      sender: 'bot',
      text: `${isHindi ? 'राधे-राधे!' : 'Greetings!'} ${roleGreeting}\n\n${note}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: state.portal === 'shop' ? [
        { label: isHindi ? 'हैंडओवर ओटीपी नियम' : 'How OTP works', actionQuery: isHindi ? 'हैंडओवर ओटीपी कैसे काम करता है?' : 'How does the handover OTP work?' },
        { label: isHindi ? 'भोजन तापमान नियम (60°C)' : 'Food Temp Limits (60°C)', actionQuery: isHindi ? 'FSSAI के अनुसार गरम भोजन का तापमान कितना होना चाहिए?' : 'What is the required hot holding temperature?' },
        { label: isHindi ? 'नया दान कैसे दर्ज करें?' : 'How to donate surplus', actionQuery: isHindi ? 'दुकानदार अतिरिक्त भोजन दान कैसे करें?' : 'How do shopkeepers donate surplus food?' }
      ] : [
        { label: isHindi ? 'भोजन का दावा कैसे करें?' : 'How to claim meals', actionQuery: isHindi ? 'आश्रम भोजन का दावा कैसे करें?' : 'How do Ashrams claim surplus food?' },
        { label: isHindi ? 'ओटीपी कहाँ भरना है?' : 'Where to enter OTP', actionQuery: isHindi ? 'दुकानदार से ओटीपी लेकर कहाँ भरना होता है?' : 'Where does the NGO enter the handover OTP?' },
        { label: isHindi ? '80G आयकर छूट प्रमाण पत्र' : '80G Tax Exemption', actionQuery: isHindi ? 'अन्नदान पर 80G टैक्स छूट कैसे मिलती है?' : 'How does the 80G tax deduction work for sponsors?' }
      ]
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Robust send message handler that NEVER triggers page refreshes
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Call async RAG engine with automatic fallback
    generateRagResponseAsync({ query, state })
      .then(botResponse => {
        setMessages(prev => [...prev, botResponse]);
      })
      .catch((err) => {
        console.warn('[Chatbot] Handled gracefully without reload:', err);
        const fallback = generateRagResponse({ query, state });
        setMessages(prev => [...prev, fallback]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleClearChat = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMessages([getInitialMessage()]);
  };

  // Helper to render inline markdown like **bold**, *italic*, `code`, and badges
  const renderInlineMarkdown = (line: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\(?>=?60°C\)?|\(?<=?5°C\)?)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} style={{ color: '#111111', fontWeight: 800 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} style={{ fontStyle: 'italic', color: '#555555' }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              padding: '1px 6px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.84em',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (/^>?=?60°C/i.test(part) || /^\(>=?60°C\)$/i.test(part)) {
        return (
          <span
            key={idx}
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1.5px solid #f87171',
              padding: '1px 7px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              margin: '0 2px'
            }}
          >
            <Thermometer size={12} strokeWidth={2.5} /> {part.replace(/[\(\)]/g, '')}
          </span>
        );
      }
      if (/^<?=?5°C/i.test(part) || /^\(<=?5°C\)$/i.test(part)) {
        return (
          <span
            key={idx}
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              border: '1.5px solid #7dd3fc',
              padding: '1px 7px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              margin: '0 2px'
            }}
          >
            ❄️ {part.replace(/[\(\)]/g, '')}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Helper to format structured response text into theme-relatable elements
  const renderFormattedMessage = (rawText: string) => {
    const paragraphs = rawText.split('\n\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          // Theme-relatable Saffron / Marigold Notice Card
          if (/^\*?\((note|नोट|ध्यान दें)[\s\S]*\)?\*?$/i.test(trimmed)) {
            const noteContent = trimmed.replace(/^[\*\(\s]+|[\*\)\s]+$/g, '');
            return (
              <div
                key={pIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#fff4e5',
                  border: '1.5px solid #ffc800',
                  borderLeft: '4px solid #ff9600',
                  fontSize: '0.79rem',
                  color: '#92400e',
                  lineHeight: 1.45,
                  fontWeight: 700
                }}
              >
                <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#ea580c' }} strokeWidth={2.5} />
                <div>{renderInlineMarkdown(noteContent)}</div>
              </div>
            );
          }

          // Check if lines are bullet list
          const lines = trimmed.split('\n');
          const isBulletList = lines.length > 1 && lines.every(l => /^[-*•]\s+/.test(l.trim()));
          const isNumberedList = lines.length > 1 && lines.every(l => /^\d+\.\s+/.test(l.trim()));

          if (isBulletList) {
            return (
              <ul key={pIdx} style={{ margin: 0, paddingLeft: '2px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {lines.map((line, lIdx) => {
                  const textWithoutBullet = line.trim().replace(/^[-*•]\s+/, '');
                  return (
                    <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', lineHeight: 1.45 }}>
                      <span style={{ color: '#58cc02', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>•</span>
                      <div style={{ flex: 1 }}>{renderInlineMarkdown(textWithoutBullet)}</div>
                    </li>
                  );
                })}
              </ul>
            );
          }

          if (isNumberedList) {
            return (
              <ol key={pIdx} style={{ margin: 0, paddingLeft: '2px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {lines.map((line, lIdx) => {
                  const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
                  const num = match ? match[1] : `${lIdx + 1}`;
                  const rest = match ? match[2] : line.trim();
                  return (
                    <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', lineHeight: 1.45 }}>
                      <span style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#ddf4ff',
                        color: '#1899d6',
                        border: '1.5px solid #1cb0f6',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px'
                      }}>
                        {num}
                      </span>
                      <div style={{ flex: 1 }}>{renderInlineMarkdown(rest)}</div>
                    </li>
                  );
                })}
              </ol>
            );
          }

          // General lines inside a paragraph
          return (
            <div key={pIdx} style={{ lineHeight: 1.55, fontSize: '0.85rem' }}>
              {lines.map((l, lIdx) => (
                <React.Fragment key={lIdx}>
                  {lIdx > 0 && <br />}
                  {renderInlineMarkdown(l)}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating 3D Tactile Circular Trigger Button */}
      {!isOpen && (

        <button
          type="button"
          className="chat-btn-reset"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          style={{
            position: 'relative',
            width: '58px',
            height: '58px',
            minWidth: '58px',
            minHeight: '58px',
            padding: 0,
            borderRadius: '50%',
            backgroundColor: '#58cc02',
            border: '2.5px solid #ffffff',
            borderBottom: '4.5px solid #488f00',
            boxShadow: '0 8px 24px rgba(88, 204, 2, 0.45), 0 4px 0 #488f00',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 120ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(88, 204, 2, 0.55), 0 5px 0 #488f00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(88, 204, 2, 0.45), 0 4px 0 #488f00';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px) scale(0.96)';
            e.currentTarget.style.borderBottom = '2px solid #488f00';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.borderBottom = '4.5px solid #488f00';
          }}
          title={isHindi ? 'Foody Loop AI सहायक से पूछें' : 'Ask Foody Loop AI Assistant'}
        >
          {/* Inner Glowing Ring */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={26} color="#ffffff" strokeWidth={2.4} />
          </div>

          {/* Golden AI Sparkle Indicator Badge */}
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ffc800',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="AI Active"
          >
            <Sparkles size={10} color="#78350f" fill="#78350f" />
          </span>
        </button>
      )}


      {/* Floating Chatbot Window */}
      {isOpen && (
        <div style={{
          width: 'clamp(320px, 92vw, 410px)',
          height: 'min(640px, 86vh)',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '2.5px solid #d4e7f0',
          borderBottom: '5px solid #b8d9ea',
          boxShadow: '0 16px 40px rgba(0, 80, 160, 0.14), 0 4px 12px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Duolingo Theme Header */}
          <div style={{
            backgroundColor: '#58cc02',
            borderBottom: '3.5px solid #58a700',
            padding: '14px 16px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                border: '2.5px solid rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Bot size={22} strokeWidth={2.5} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid #58a700'
                  }}
                  title="Live AI Connected"
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.02rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '0.2px' }}>
                    Foody Loop AI Sahayak
                  </span>
                </div>


                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    color: '#f0fdf4',
                    fontWeight: 700,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {state.portal === 'shop'
                      ? `🏪 ${currentShop?.name || 'Shop'}`
                      : state.portal === 'admin'
                      ? (isHindi ? '🛡️ खाद्य सुरक्षा विनियामक' : '🛡️ Safety Regulatory')
                      : `🏛️ ${currentNgo?.name || 'Ashram'}`}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#e8fcd9' }}>•</span>
                  <span style={{ fontSize: '0.7rem', color: '#e8fcd9', fontWeight: 700 }}>
                    {isHindi ? 'लाइव' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* High-Contrast 3D Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="chat-btn-reset"
                onClick={handleClearChat}
                style={{
                  width: '34px',
                  height: '34px',
                  minWidth: '34px',
                  minHeight: '34px',
                  padding: 0,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #58a700',
                  borderBottom: '3px solid #488f00',
                  color: '#15803d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 0 #58a700',
                  transition: 'transform 80ms ease'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1.5px)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                title={isHindi ? 'चैट रीसेट करें' : 'Reset Conversation'}
              >
                <RotateCcw size={16} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                className="chat-btn-reset"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{
                  width: '34px',
                  height: '34px',
                  minWidth: '34px',
                  minHeight: '34px',
                  padding: 0,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e0e0e0',
                  borderBottom: '3px solid #d4d4d4',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 0 #d4d4d4',
                  transition: 'transform 80ms ease'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1.5px)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                title={isHindi ? 'बंद करें' : 'Close'}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Theme-relatable Sub-Banner */}
          <div style={{
            backgroundColor: '#e8fcd9',
            borderBottom: '2px solid #a5ed6e',
            padding: '7px 16px',
            fontSize: '0.72rem',
            color: '#256a00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 800
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#388e00" strokeWidth={2.5} />
              <span>FSSAI 2019 & OTP RAG Knowledge Base</span>
            </span>
            <span style={{
              fontSize: '0.66rem',
              color: '#c26900',
              backgroundColor: '#fff4e5',
              border: '1px solid #ffc800',
              padding: '2px 7px',
              borderRadius: '10px',
              fontWeight: 800
            }}>
              Strict Guardrails
            </span>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#ddf4ff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Bot Label Header */}
                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', paddingLeft: '4px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#58cc02',
                      border: '1.5px solid #58a700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      <Bot size={12} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#3c3c3c' }}>
                      AI Sahayak
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#777777', fontWeight: 600 }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '88%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  backgroundColor: msg.sender === 'user'
                    ? '#58cc02'
                    : msg.isOffTopic
                    ? '#fff4e5'
                    : '#ffffff',
                  color: msg.sender === 'user'
                    ? '#ffffff'
                    : msg.isOffTopic
                    ? '#92400e'
                    : '#3c3c3c',
                  border: msg.sender === 'user'
                    ? '2px solid #58a700'
                    : msg.isOffTopic
                    ? '2px solid #ffc800'
                    : '2px solid #e5e5e5',
                  borderBottom: msg.sender === 'user'
                    ? '3.5px solid #488f00'
                    : msg.isOffTopic
                    ? '3.5px solid #f59e0b'
                    : '3.5px solid #d4d4d4',
                  boxShadow: msg.sender === 'user'
                    ? '0 4px 0 #488f00'
                    : '0 3px 0 #e5e5e5',
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                  fontWeight: 600
                }}>
                  {msg.isOffTopic && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', color: '#c2410c', fontWeight: 800, fontSize: '0.76rem' }}>
                      <AlertCircle size={15} strokeWidth={2.5} />
                      <span>{isHindi ? 'उत्पाद सुरक्षा सीमा (Guardrail)' : 'Foody Loop Safety Scope'}</span>
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    <div style={{ color: '#ffffff', fontWeight: 700 }}>{msg.text}</div>
                  ) : (
                    renderFormattedMessage(msg.text)
                  )}

                  {msg.sender === 'user' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.64rem', color: '#ffffff', opacity: 0.9 }}>
                        {msg.timestamp}
                      </span>
                      <CheckCheck size={13} color="#ffffff" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Duolingo-style 3D Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', paddingLeft: '4px' }}>
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        className="chat-btn-reset"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSendMessage(action.actionQuery);
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #a5ed6e',
                          borderBottom: '3.5px solid #58cc02',
                          borderRadius: '20px',
                          padding: '5px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#2e7d32',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 0 #d4d4d4',
                          transition: 'transform 80ms ease'
                        }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1.5px)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <Sparkles size={12} color="#58cc02" strokeWidth={2.5} />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: 'fit-content',
                border: '2px solid #e5e5e5',
                borderBottom: '3px solid #d4d4d4'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div className="chat-dot-1" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#58cc02' }} />
                  <div className="chat-dot-2" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#58cc02' }} />
                  <div className="chat-dot-3" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#58cc02' }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#777777', fontWeight: 700 }}>
                  {isHindi ? 'RAG ज्ञानकोष में खोज रहा है...' : 'Retrieving verified guidelines...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar (Scrollable Tray) */}
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderTop: '2px solid #e5e5e5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }} className="chat-no-scrollbar">
            <span style={{ fontSize: '0.68rem', color: '#777777', fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}>
              {isHindi ? 'त्वरित प्रश्न:' : 'QUICK:'}
            </span>

            <button
              type="button"
              className="chat-btn-reset"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(isHindi ? 'ओटीपी सत्यापन का क्या नियम है?' : 'What is the handover OTP rule?');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1.5px solid #fed7aa',
                borderBottom: '2.5px solid #f97316',
                backgroundColor: '#fff4e5',
                fontSize: '0.72rem',
                color: '#c2410c',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              <Lock size={12} color="#ea580c" strokeWidth={2.5} />
              <span>{isHindi ? 'ओटीपी नियम' : 'OTP Rules'}</span>
            </button>

            <button
              type="button"
              className="chat-btn-reset"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(isHindi ? 'FSSAI के अनुसार भोजन सुरक्षा नियम क्या हैं?' : 'What are FSSAI food safety regulations?');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1.5px solid #fecaca',
                borderBottom: '2.5px solid #ef4444',
                backgroundColor: '#fef2f2',
                fontSize: '0.72rem',
                color: '#b91c1c',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              <Thermometer size={12} color="#dc2626" strokeWidth={2.5} />
              <span>{isHindi ? 'तापमान (60°C)' : 'Temperature'}</span>
            </button>

            <button
              type="button"
              className="chat-btn-reset"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(isHindi ? 'आश्रम हेतु भोजन कैसे क्लेम करें?' : 'How do ashrams claim surplus meals?');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1.5px solid #bfdbfe',
                borderBottom: '2.5px solid #3b82f6',
                backgroundColor: '#eff6ff',
                fontSize: '0.72rem',
                color: '#1d4ed8',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              <UtensilsCrossed size={12} color="#2563eb" strokeWidth={2.5} />
              <span>{isHindi ? 'भोजन दावा' : 'Claim Food'}</span>
            </button>

            <button
              type="button"
              className="chat-btn-reset"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(isHindi ? 'अन्नदान पर 80G टैक्स छूट कैसे मिलती है?' : 'How does 80G tax deduction work?');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1.5px solid #a5ed6e',
                borderBottom: '2.5px solid #58cc02',
                backgroundColor: '#e8fcd9',
                fontSize: '0.72rem',
                color: '#256a00',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              <FileText size={12} color="#388e00" strokeWidth={2.5} />
              <span>{isHindi ? '80G छूट' : '80G Exemption'}</span>
            </button>
          </div>

          {/* Input Box & Send Bar (NON-FORM container to physically eliminate any web reload) */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderTop: '2px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendMessage();
                  }
                }}
                placeholder={isHindi ? 'Foody Loop या FSSAI नियम पूछें...' : 'Ask about Foody Loop, OTP, or FSSAI...'}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '16px',
                  border: '2px solid #d4e7f0',
                  padding: '0 16px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#f7fafd',
                  color: '#3c3c3c',
                  fontWeight: 700,
                  transition: 'border-color 150ms ease, box-shadow 150ms ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#58cc02';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88, 204, 2, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d4e7f0';
                  e.currentTarget.style.backgroundColor = '#f7fafd';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="button"
              disabled={!inputText.trim()}
              className="chat-btn-reset"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage();
              }}
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                padding: 0,
                borderRadius: '14px',
                backgroundColor: inputText.trim() ? '#58cc02' : '#f1f5f9',
                border: inputText.trim() ? '2px solid #58a700' : '2px solid #e2e8f0',
                borderBottom: inputText.trim() ? '4px solid #488f00' : '3px solid #cbd5e1',
                color: inputText.trim() ? '#ffffff' : '#777777',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 80ms ease, background-color 150ms ease'
              }}
              onMouseDown={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.transform = 'translateY(2px)';
                }
              }}
              onMouseUp={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              title={isHindi ? 'संदेश भेजें' : 'Send message'}
            >
              <Send
                size={18}
                strokeWidth={2.5}
                color={inputText.trim() ? '#ffffff' : '#777777'}
                style={{ marginLeft: inputText.trim() ? '2px' : 0 }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
