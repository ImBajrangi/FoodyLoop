import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Thermometer, 
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Heart,
  Users,
  Flame,
  ChefHat,
  Utensils,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../../services/useAppState';
import type { Donation, StorageCondition } from '../../types';
import { evaluateFoodSafety } from '../../services/foodSafetyEngine';

interface QuickDonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemOption {
  name: string;
  hindiName: string;
}

export const QuickDonateModal: React.FC<QuickDonateModalProps> = ({ isOpen, onClose }) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];

  const FREQUENT_ITEMS: ItemOption[] = [
    { name: 'Dal Rice Combo', hindiName: 'दाल चावल थाली' },
    { name: 'Special Paneer Thali', hindiName: 'शाही पनीर थाली' },
    { name: 'Samosa & Kachori Batch', hindiName: 'समोसा व खस्ता कचौरी' },
    { name: 'Mathura Poori Sabzi', hindiName: 'मथुरा बेडमी पूरी' },
    { name: 'Sattvik Khichdi Prasadam', hindiName: 'सात्त्विक खिचड़ी प्रसाद' }
  ];

  const [selectedItem, setSelectedItem] = useState<ItemOption>(FREQUENT_ITEMS[0]);
  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState('meals');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('hot_held');
  const [prepTimeAgo, setPrepTimeAgo] = useState(30); // 30 mins ago

  // Dynamic Safety Assessment
  const prepAtDate = new Date(Date.now() - prepTimeAgo * 60000);
  const safetyAssessment = evaluateFoodSafety(selectedItem.name, storageCondition, prepAtDate);

  // FSSAI & Hygiene Checklist
  const [checklist, setChecklist] = useState({
    preparedFresh: true,
    hygieneDeclaration: true,
    cleanPackaging: true,
    temperatureVerified: true,
    withinWindow: true
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleQuickQty = (qty: number) => {
    setQuantity(qty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDonation: Donation = {
      id: `DON-${Date.now().toString().slice(-4)}`,
      donorShopId: currentShop?.id || state.activeShopId || 'ff22da9a-2623-4387-af37-6a8bb50bb19f',
      donorShopName: currentShop?.name || "Govinda's Restaurant & Bhojanalaya",
      city: currentShop?.city || 'Vrindavan',
      foodItem: selectedItem.name,
      foodCategory: 'Cooked Meals',
      quantity: Number(quantity),
      unit: unit,
      preparedAt: prepAtDate.toISOString(),
      readyAt: new Date().toISOString(),
      safeUntil: safetyAssessment.safeUntil.toISOString(),
      storageCondition: storageCondition,
      packagingStatus: safetyAssessment.categoryRule.mandatoryPackaging,
      handlingInstructions: storageCondition === 'hot_held' 
        ? `Maintain temperature >=${safetyAssessment.categoryRule.minHotHeldTempC}C inside thermal urns` 
        : 'Protect from direct ambient sunlight and moisture',
      allergenNotice: 'Pure Sattvik Vegetarian (No onion, no garlic). Contains dairy/ghee.',
      status: 'AVAILABLE',
      fssaiChecklist: checklist,
      targetBeneficiaryName: 'श्री राधा रानी विधवा व वृद्ध आश्रम (वृन्दावन)',
      distanceKm: 1.8,
      estimatedTravelTimeMin: 12,
      otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString()
    };

    cache.addDonation(newDonation);
    setSubmitted(true);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '580px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid #e5e5e5',
        borderBottom: '6px solid #d4d4d4',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #f1f5f9',
          paddingBottom: '16px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              backgroundColor: '#e8fcd9',
              border: '2px solid #a5ed6e',
              color: '#388e00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 0 #58a700'
            }}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? 'अन्नपूर्णा सेवा: अतिरिक्त भोजन दान' : 'Annapoorna Seva: Donate Surplus Food'}
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {currentShop.name} • {currentShop.location}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '36px 16px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#e8fcd9',
              border: '3px solid #a5ed6e',
              color: '#388e00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 0 #58a700'
            }}>
              <CheckCircle2 size={38} />
            </div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d', marginBottom: '8px' }}>
              {isHindi ? 'अन्नदान सफल! ठाकुर जी की कृपा' : 'Surplus Food Seva Registered!'}
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#334155', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
              {isHindi
                ? 'आपका भोजन श्री राधा रानी आश्रम के लिए आरक्षित कर दिया गया है। सेवादार जल्द दुकान पर पहुँचकर भोजन ग्रहण करेंगे।'
                : 'Your fresh meal donation has been safely matched with Shri Radharani Ashram. Courier dispatched!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Select Frequent Items with Relatable Emojis & Hindi */}
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                {isHindi ? '1. किस व्यंजन का दान करना है? (Select Dish):' : '1. Select Food Item to Donate:'}
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FREQUENT_ITEMS.map(item => {
                  const isSelected = selectedItem.name === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        borderRadius: '12px',
                        backgroundColor: isSelected ? '#58cc02' : '#ffffff',
                        color: isSelected ? '#ffffff' : 'var(--color-text)',
                        border: isSelected ? '2px solid #58cc02' : '2px solid #e2e8f0',
                        borderBottom: isSelected ? '4px solid #58a700' : '4px solid #cbd5e1',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Utensils size={14} />
                      <span>{item.hindiName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Unit with Quick 1-Tap Chips */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {isHindi ? '2. कितनी थालियां/मात्रा उपलब्ध है?' : '2. Available Surplus Quantity:'}
                </label>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>
                  ~{quantity} {isHindi ? 'लोगों का पेट भरेगा' : 'people fed'}
                </span>
              </div>

              {/* 1-Tap Quick Quantity Selector Chips */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {[15, 30, 50, 75, 100].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => handleQuickQty(qty)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      backgroundColor: quantity === qty ? '#1cb0f6' : '#f1f5f9',
                      color: quantity === qty ? '#ffffff' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {qty} थाली
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 900, height: '46px', textAlign: 'center' }}
                />
                <select 
                  value={unit} 
                  onChange={e => setUnit(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 800, height: '46px', fontSize: '0.9rem' }}
                >
                  <option value="meals">{isHindi ? 'थाली (meals)' : 'meals / थाली'}</option>
                  <option value="portions">{isHindi ? 'प्लेट्स (portions)' : 'portions'}</option>
                  <option value="kg">{isHindi ? 'किलो (kg bulk)' : 'kg (bulk)'}</option>
                  <option value="packets">{isHindi ? 'पैकेट (packets)' : 'packets'}</option>
                </select>
              </div>
            </div>

            {/* Preparation time & Storage condition */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Clock size={15} color="#475569" />
                  <span>{isHindi ? 'कब तैयार हुआ था?' : 'Prepared When?'}</span>
                </label>
                <select 
                  value={prepTimeAgo} 
                  onChange={e => setPrepTimeAgo(parseInt(e.target.value))}
                  className="form-select"
                  style={{ fontWeight: 700, fontSize: '0.85rem', height: '42px' }}
                >
                  <option value={15}>{isHindi ? 'अभी ताज़ा (15 मिनट पहले)' : 'Freshly cooked (15m)'}</option>
                  <option value={30}>{isHindi ? '30 मिनट पहले' : '30 mins ago'}</option>
                  <option value={60}>{isHindi ? '1 घंटा पहले' : '1 hour ago'}</option>
                  <option value={120}>{isHindi ? '2 घंटे पहले' : '2 hours ago'}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Flame size={15} color="#e07f00" />
                  <span>{isHindi ? 'भोजन की वर्तमान स्थिति' : 'Storage Condition'}</span>
                </label>
                <select 
                  value={storageCondition} 
                  onChange={e => setStorageCondition(e.target.value as StorageCondition)}
                  className="form-select"
                  style={{ fontWeight: 700, fontSize: '0.85rem', height: '42px' }}
                >
                  <option value="hot_held">{isHindi ? 'गरमा-गरम इंसुलेटेड (>=65C)' : 'Hot Held (>=65C Insulated)'}</option>
                  <option value="room_temp">{isHindi ? 'सामान्य तापमान (छाया में)' : 'Room Temperature (Ambient)'}</option>
                  <option value="refrigerated">{isHindi ? 'ठंडा / फ्रिज में रखा (<5C)' : 'Refrigerated (<5C)'}</option>
                </select>
              </div>
            </div>

            {/* Unified 1-Card Seva Match & Freshness Guarantee */}
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderBottom: '4px solid #22c55e',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  border: '2px solid #a5ed6e',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#14532d' }}>
                    {isHindi ? 'श्री राधा रानी आश्रम, रमन रेती' : 'Shri Radharani Ashram, Raman Reti'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>{isHindi ? '1.8 किमी दूर • 120 संतों व माताओं के लिए ताज़ा भोजन' : '1.8 km • 120 elderly mothers & sadhus'}</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '8px 14px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                  {isHindi ? 'वितरण का समय' : 'Safe Window'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#15803d' }}>
                  {isHindi ? `शाम ${safetyAssessment.safeUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} तक` : `Until ${safetyAssessment.safeUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary" 
                style={{
                  flex: 1,
                  minHeight: '48px',
                  borderRadius: '14px',
                  fontSize: '0.88rem'
                }}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{
                  flex: 2,
                  minHeight: '48px',
                  borderRadius: '14px',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={18} />
                <span>{isHindi ? 'आश्रमों को भोजन दान करें' : 'Confirm Seva Donation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
