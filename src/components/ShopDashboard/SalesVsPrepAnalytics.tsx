import React, { useState } from 'react';
import {
  ChefHat,
  ShoppingBag,
  HeartHandshake,
  Trash2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Coins,
  ArrowRight,
  Calculator,
  Sliders,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

interface SalesVsPrepAnalyticsProps {
  onOpenDonate?: () => void;
}

export const SalesVsPrepAnalytics: React.FC<SalesVsPrepAnalyticsProps> = ({ onOpenDonate }) => {
  const { state } = useAppState();
  const isHindi = state.language === 'hi';

  // Aggregate metrics from item intelligence
  const totalPrepared = state.itemIntelligence.reduce((acc, item) => acc + item.avgDailyPrepared, 0);
  const totalSold = state.itemIntelligence.reduce((acc, item) => acc + item.avgDailySold, 0);
  const totalSurplus = state.itemIntelligence.reduce((acc, item) => acc + item.avgDailySurplus, 0);
  const totalDonated = Math.round(totalSurplus * 0.88); // 88% rescued through Food Loop!
  const totalDiscarded = totalSurplus - totalDonated; // Only 12% unavoidable discard

  // Interactive Seva & Savings Simulator state
  const [simSurplusPlates, setSimSurplusPlates] = useState<number>(35);
  const simRescuedPlates = Math.round(simSurplusPlates * 0.90);
  const simRupeesSaved = simRescuedPlates * 85;
  const simEldersFed = simRescuedPlates;

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '2px solid #e5e5e5',
      borderBottom: '4px solid #d4d4d4',
      marginBottom: '20px'
    }}>
      {/* Title & Relatable Subtitle */}
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
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              {isHindi ? 'रसोई का थाली हिसाब' : 'Daily Kitchen Savings Scorecard'}
            </h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {isHindi
              ? 'देखें आज कितनी थालियां बनीं, कितनी ग्राहकों को बिकीं, और कितना भोजन आश्रमों में अन्नपूर्णा सेवा बना।'
              : 'Track plates prepared, plates sold, and meals safely rescued for Vrindavan Ashrams.'}
          </p>
        </div>

        {/* Clean Friendly Badge */}
        <div style={{
          backgroundColor: '#e8fcd9',
          border: '2px solid #a5ed6e',
          color: '#388e00',
          padding: '8px 16px',
          borderRadius: '14px',
          fontSize: '0.86rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 3px 0 #58a700'
        }}>
          <Sparkles size={18} />
          <span>{isHindi ? '88% भोजन बर्बादी से बचाया' : '88% Food Rescued from Waste'}</span>
        </div>
      </div>

      {/* 4 Large Relatable Visual Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* 1. Prepared */}
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '14px',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 700 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={16} color="#475569" />
            </div>
            <span>{isHindi ? 'आज बनी थालियां' : 'Prepared Today'}</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' }}>
            {totalPrepared} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{isHindi ? 'थाली' : 'plates'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {isHindi ? 'दैनिक औसत उत्पादन' : 'Daily baseline volume'}
          </div>
        </div>

        {/* 2. Sold */}
        <div style={{
          background: '#f0fdf4',
          padding: '16px',
          borderRadius: '14px',
          border: '2px solid #86efac',
          borderBottom: '4px solid #4ade80'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 700 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} color="#15803d" />
            </div>
            <span>{isHindi ? 'ग्राहकों को बिकीं' : 'Sold to Customers'}</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d' }}>
            {totalSold} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a' }}>{isHindi ? 'थाली' : 'plates'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#16a34a', marginTop: '6px', fontWeight: 800 }}>
            {isHindi ? '82.7% दुकान पर बिक्री' : '82.7% sales fulfillment'}
          </div>
        </div>

        {/* 3. Donated as Seva */}
        <div style={{
          background: '#eff6ff',
          padding: '16px',
          borderRadius: '14px',
          border: '2px solid #93c5fd',
          borderBottom: '4px solid #60a5fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 700 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={16} color="#1d4ed8" />
            </div>
            <span>{isHindi ? 'आश्रमों को अन्न सेवा' : 'Donated to Ashrams'}</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1d4ed8' }}>
            {totalDonated} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb' }}>{isHindi ? 'थाली' : 'plates'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#2563eb', marginTop: '6px', fontWeight: 800 }}>
            {isHindi ? 'वृद्ध संतों व माताओं को' : '88% rescue efficiency'}
          </div>
        </div>

        {/* 4. Total Cost Savings & Waste Avoided */}
        <div style={{
          background: '#fff7ed',
          padding: '16px',
          borderRadius: '14px',
          border: '2px solid #fed7aa',
          borderBottom: '4px solid #fb923c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 700 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={16} color="#c2410c" />
            </div>
            <span>{isHindi ? 'दुकान की बचत' : 'Kitchen Savings'}</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c2410c' }}>
            ₹48,250
          </div>
          <div style={{ fontSize: '0.76rem', color: '#ea580c', marginTop: '6px', fontWeight: 800 }}>
            {isHindi ? 'कचरे में जाने से सुरक्षित' : 'Waste loss prevented'}
          </div>
        </div>
      </div>

      {/* Unified Kitchen Balance & Seva Impact Section (2-Column Responsive) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Left Column: Food Utilization & Recovery Breakdown */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingBag size={18} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? 'दैनिक भोजन वितरण' : 'Food Volume Allocation'}
                </h4>
              </div>

              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#475569',
                backgroundColor: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}>
                100% ({totalPrepared} {isHindi ? 'थाली' : 'plates'})
              </span>
            </div>

            {/* Segmented Volume Bar */}
            <div style={{
              height: '14px',
              width: '100%',
              backgroundColor: '#f1f5f9',
              borderRadius: '999px',
              overflow: 'hidden',
              display: 'flex',
              gap: '2px',
              padding: '2px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '16px'
            }}>
              <div style={{ width: '82.7%', backgroundColor: '#10b981', borderRadius: '999px 4px 4px 999px' }} title="Sold (82.7%)" />
              <div style={{ width: '15.2%', backgroundColor: '#3b82f6', borderRadius: '4px' }} title="Donated (15.2%)" />
              <div style={{ width: '2.1%', backgroundColor: '#f43f5e', borderRadius: '4px 999px 999px 4px' }} title="Kitchen Loss (2.1%)" />
            </div>

            {/* 3 Clean Compact Distribution Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {isHindi ? 'ग्राहकों को बिक्री' : 'Sold to Customers'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  422 {isHindi ? 'थाली' : 'plates'} <span style={{ color: '#16a34a', fontWeight: 900 }}>(82.7%)</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#eff6ff',
                borderRadius: '10px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                    {isHindi ? 'आश्रमों को अन्न सेवा' : 'Donated to Ashrams'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a' }}>
                  77 {isHindi ? 'थाली' : 'plates'} <span style={{ color: '#2563eb', fontWeight: 900 }}>(15.2%)</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#fff1f2',
                borderRadius: '10px',
                border: '1px solid #ffe4e6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239' }}>
                    {isHindi ? 'रसोई अवशेष (कचरा)' : 'Net Kitchen Loss'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#881337' }}>
                  11 {isHindi ? 'थाली' : 'plates'} <span style={{ color: '#e11d48', fontWeight: 900 }}>(2.1%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Braj Annapoorna Seva Note */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#92400e'
          }}>
            <HeartHandshake size={20} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isHindi ? 'अन्नपूर्णा सेवा:' : 'Braj Seva:'}</strong>{' '}
              {isHindi
                ? 'शुद्ध भोजन कचरा नहीं, संतों व माताओं का प्रसाद है। फूड लूप द्वारा 100% सुरक्षित पहुंचाया जाता है।'
                : 'Unsold pure food is Annapoorna seva, safely delivered to registered Braj ashrams with full dignity.'}
            </div>
          </div>
        </div>

        {/* Right Column: Live Seva & Savings Simulator */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calculator size={18} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? 'अतिरिक्त भोजन सेवा सिम्युलेटर' : 'Live Seva & Savings Simulator'}
                </h4>
              </div>

              <span style={{
                backgroundColor: '#fff7ed',
                border: '1.5px solid #fdba74',
                color: '#c2410c',
                padding: '4px 12px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 900
              }}>
                {simSurplusPlates} {isHindi ? 'अतिरिक्त थालियां' : 'Surplus Plates'}
              </span>
            </div>

            {/* Slider Control */}
            <div style={{ marginBottom: '14px' }}>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={simSurplusPlates}
                onChange={(e) => setSimSurplusPlates(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#f97316',
                  cursor: 'pointer',
                  height: '8px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: 700 }}>
                <span>10 {isHindi ? 'थाली' : 'plates'}</span>
                <span>60 {isHindi ? 'थाली' : 'plates'}</span>
                <span>120 {isHindi ? 'थाली' : 'plates'}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                {isHindi ? 'क्विक चयन:' : 'Quick Select:'}
              </span>
              {[15, 30, 50, 75, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSimSurplusPlates(val)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: simSurplusPlates === val ? '1.5px solid #f97316' : '1.5px solid #e2e8f0',
                    backgroundColor: simSurplusPlates === val ? '#ffedd5' : '#f8fafc',
                    color: simSurplusPlates === val ? '#c2410c' : '#475569'
                  }}
                >
                  {val} {isHindi ? 'थाली' : 'plates'}
                </button>
              ))}
            </div>

            {/* 3 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                borderRadius: '10px',
                padding: '10px 8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>
                  {isHindi ? 'तृप्त जन' : 'People Fed'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#9a3412', marginTop: '2px' }}>
                  ~{simEldersFed}
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '10px',
                padding: '10px 8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                  {isHindi ? 'बचत मूल्य' : 'Value Saved'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
                  ₹{simRupeesSaved.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '10px',
                padding: '10px 8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 700 }}>
                  {isHindi ? 'पिकअप समय' : 'Pickup Time'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                  &lt;30 Mins
                </div>
              </div>
            </div>
          </div>

          {/* Actionable CTA */}
          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                fontWeight: 800
              }}
            >
              <HeartHandshake size={18} />
              <span>{isHindi ? `यह ${simSurplusPlates} थालियां दान करें` : `Donate These ${simSurplusPlates} Surplus Plates`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
