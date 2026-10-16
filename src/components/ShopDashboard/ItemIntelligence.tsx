import React, { useState } from 'react';
import { 
  Utensils, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  Clock,
  Coins,
  Sun,
  Moon,
  ChefHat
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

export const ItemIntelligence: React.FC = () => {
  const { state } = useAppState();
  const isHindi = state.language === 'hi';
  const [filter, setFilter] = useState<'all' | 'high_margin' | 'batch_alert'>('all');

  const filteredItems = state.itemIntelligence.filter(item => {
    if (filter === 'high_margin') return item.sellingPriceInr - item.productionCostInr >= 50;
    if (filter === 'batch_alert') return item.surplusRate > 20;
    return true;
  });

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '2px solid #e5e5e5',
      borderBottom: '4px solid #d4d4d4',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#e8fcd9',
              border: '2px solid #a5ed6e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#388e00',
              boxShadow: '0 3px 0 #58a700'
            }}>
              <Utensils size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
              {isHindi ? 'व्यंजन हिसाब व दो-बैच टाइमिंग' : 'Dish Performance & 2-Batch Preparation Guide'}
            </h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {isHindi
              ? 'देखें किस व्यंजन से सबसे ज्यादा मुनाफा है और किस समय कितना बनाना सर्वोत्तम रहेगा।'
              : 'Actionable guidance on dish profitability, waste prevention, and morning vs evening batch timing.'}
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? '#58cc02' : '#f1f5f9',
              color: filter === 'all' ? '#ffffff' : '#475569',
              border: 'none',
              boxShadow: filter === 'all' ? '0 2px 0 #58a700' : 'none'
            }}
          >
            {isHindi ? 'सभी व्यंजन (5)' : 'All Dishes (5)'}
          </button>
          <button
            onClick={() => setFilter('high_margin')}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filter === 'high_margin' ? '#1cb0f6' : '#f1f5f9',
              color: filter === 'high_margin' ? '#ffffff' : '#475569',
              border: 'none',
              boxShadow: filter === 'high_margin' ? '0 2px 0 #1899d6' : 'none'
            }}
          >
            {isHindi ? 'अधिक मुनाफा' : 'High Margin'}
          </button>
          <button
            onClick={() => setFilter('batch_alert')}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: filter === 'batch_alert' ? '#ff9600' : '#f1f5f9',
              color: filter === 'batch_alert' ? '#ffffff' : '#475569',
              border: 'none',
              boxShadow: filter === 'batch_alert' ? '0 2px 0 #c26900' : 'none'
            }}
          >
            {isHindi ? 'दो-बैच अलर्ट' : 'Batch Timing Alert'}
          </button>
        </div>
      </div>

      {/* Highlighted Golden Rule: The 2-Batch Formula */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '2px solid #fcd34d',
        borderBottom: '4px solid #f59e0b',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            boxShadow: '0 3px 0 #d97706',
            flexShrink: 0
          }}>
            <ChefHat size={26} />
          </div>

          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: '#92400e' }}>
              {isHindi ? 'रसोई का स्वर्णिम नियम: दो-बैच तैयारी फॉर्मूला' : 'Golden Kitchen Rule: 2-Batch Timing Formula'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#78350f', marginTop: '2px' }}>
              {isHindi
                ? 'शाही पनीर जैसे अधिक मुनाफे वाले व्यंजनों को एक साथ ज्यादा न बनाएं। दोपहर 11:00 AM (लंच) और शाम 6:30 PM (डिनर) के दो छोटे बैच बनाएं।'
                : 'Do not discontinue high-surplus dishes like Special Paneer Thali. Split into two fresh batches (11:00 AM lunch + 6:30 PM dinner) to protect ₹95/plate margin.'}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #fde68a',
          padding: '8px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: '#b45309' }}>
            <Sun size={15} color="#d97706" />
            <span>{isHindi ? 'लंच: 45 थाली' : 'Lunch: 45'}</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: '#1e40af' }}>
            <Moon size={15} color="#2563eb" />
            <span>{isHindi ? 'डिनर: 35 थाली' : 'Dinner: 35'}</span>
          </div>
        </div>
      </div>

      {/* Dish Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
        {filteredItems.map(item => {
          const profitMargin = item.sellingPriceInr - item.productionCostInr;
          const isHighSurplus = item.surplusRate > 20;

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: isHighSurplus ? '2px solid #fed7aa' : '2px solid #e2e8f0',
                borderBottom: isHighSurplus ? '5px solid #f97316' : '4px solid #cbd5e1',
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                {/* Title & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-text)', margin: 0 }}>
                      {item.hindiName || item.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {item.name}
                    </div>
                  </div>

                  <span className={`badge ${isHighSurplus ? 'badge-saffron' : 'badge-emerald'}`} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                    {isHighSurplus ? (isHindi ? 'दो-बैच आवश्यक' : '2-Batch Needed') : (isHindi ? 'संतुलित मांग' : 'Balanced')}
                  </span>
                </div>

                {/* Economics Strip (Cost, Selling Price, Net Margin) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      {isHindi ? 'लागत' : 'Cost'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>
                      ₹{item.productionCostInr}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      {isHindi ? 'बिक्री मूल्य' : 'Price'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                      ₹{item.sellingPriceInr}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800 }}>
                      {isHindi ? 'प्रति थाली मुनाफा' : 'Net Margin'}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803d' }}>
                      +₹{profitMargin}
                    </div>
                  </div>
                </div>

                {/* Plates Distribution Breakdown */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  backgroundColor: 'var(--color-background)',
                  padding: '10px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      {isHindi ? 'बनाईं' : 'Prepared'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1e293b' }}>
                      {item.avgDailyPrepared}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
                      {isHindi ? 'बिकीं' : 'Sold'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#15803d' }}>
                      {item.avgDailySold}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: isHighSurplus ? '#c2410c' : '#1d4ed8', fontWeight: 700 }}>
                      {isHindi ? 'अन्न सेवा' : 'Donated'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: isHighSurplus ? '#c2410c' : '#1d4ed8' }}>
                      {item.avgDailySurplus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Kitchen Insight with Direct Tip */}
              <div style={{
                backgroundColor: isHighSurplus ? '#fff7ed' : '#f0fdf4',
                border: isHighSurplus ? '1.5px solid #fed7aa' : '1.5px solid #bbf7d0',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: isHighSurplus ? '#9a3412' : '#166534',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                {isHighSurplus ? (
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ea580c' }} />
                ) : (
                  <ThumbsUp size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                )}
                <span style={{ lineHeight: 1.4 }}>
                  {isHindi ? (
                    item.id === 'item-2' 
                      ? 'सलाह: दोपहर में सिर्फ 45 थालियां बनाएं और शाम को 35 थालियां बनाएं। इससे ₹95 का भारी मुनाफा भी सुरक्षित रहेगा और दोपहर में अधिशेष शून्य रहेगा।'
                      : item.id === 'item-3'
                      ? 'सलाह: शाम 5:30 बजे चाय के बाद कचौरी का रश घटता है। 5:00 बजे के बाद केवल छोटा बैच तलें।'
                      : 'उत्तम प्रदर्शन! ग्राहकों में अत्यधिक लोकप्रिय व्यंजन, आश्रमों में भी पहली पसंद।'
                  ) : item.aiInsight}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
