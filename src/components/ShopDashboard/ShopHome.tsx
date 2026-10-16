import React, { useState } from 'react';
import {
  Store,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Boxes,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  KeyRound,
  ArrowRight,
  UtensilsCrossed,
  Layers
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { SalesVsPrepAnalytics } from './SalesVsPrepAnalytics';
import { ItemIntelligence } from './ItemIntelligence';
import { RawMaterialPlanner } from './RawMaterialPlanner';
import { AIPredictionCard } from './AIPredictionCard';
import { TRANSLATIONS } from '../../data/translations';

interface ShopHomeProps {
  onOpenDonate: () => void;
}

type TabType = 'analytics' | 'donations' | 'planner';

export const ShopHome: React.FC<ShopHomeProps> = ({ onOpenDonate }) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';
  const t = TRANSLATIONS[state.language];

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [enteredOtp, setEnteredOtp] = useState<{ [key: string]: string }>({});
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [otpErrorMessage, setOtpErrorMessage] = useState<{ [key: string]: string | null }>({});

  const shopDonations = state.donations.filter(d => d.donorShopId === currentShop.id);

  const handleVerifyOtp = (donationId: string) => {
    const targetDonation = shopDonations.find(d => d.id === donationId);
    const code = (enteredOtp[donationId] || '').trim();
    const expectedOtp = (targetDonation?.otpCode || '4928').trim();

    if (!code || code.length < 4) {
      setOtpErrorMessage(prev => ({
        ...prev,
        [donationId]: isHindi ? 'कृपया सेवादार से 4-अंकीय ओटीपी प्राप्त कर दर्ज करें।' : 'Please enter the 4-digit OTP provided by courier.'
      }));
      return;
    }

    if (code !== expectedOtp) {
      setOtpErrorMessage(prev => ({
        ...prev,
        [donationId]: isHindi
          ? 'गलत ओटीपी! सेवादार द्वारा दिया गया ओटीपी मेल नहीं खा रहा है। कृपया पुनः जांचें।'
          : 'Incorrect OTP! Code does not match courier credentials. Please verify with courier.'
      }));
      return;
    }

    setOtpErrorMessage(prev => ({ ...prev, [donationId]: null }));
    cache.updateDonationStatus(donationId, 'COLLECTED', {
      collectedAt: new Date().toISOString()
    });
    setOtpSuccessMessage(
      isHindi
        ? `ओटीपी ${code} सत्यापित! भोजन सेवादार को सौंप दिया गया है, आश्रम तक मार्गस्थ है।`
        : `OTP ${code} verified! Food successfully handed over to courier, en route to Ashram.`
    );
    setTimeout(() => setOtpSuccessMessage(null), 5000);
  };

  return (
    <div>
      {/* Application Under Review Banner (for newly registered shops) */}
      {!currentShop?.verified && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '2px solid #fde68a',
          borderRadius: '16px',
          boxShadow: '0 3px 0 #fcd34d',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              border: '2px solid #fde68a',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#92400e' }}>
                {isHindi ? 'खाद्य सुरक्षा पंजीकरण सत्यापन प्रक्रियाधीन' : 'Establishment Registration Under FSSAI Review'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                {isHindi
                  ? 'आपका प्रतिष्ठान पंजीकृत हो चुका है। खाद्य सुरक्षा अधिकारी द्वारा समीक्षा के उपरांत पूर्ण अनुमोदन बैज सक्रिय होगा।'
                  : 'Your registration is received. Live food matching and FSSAI trusted merchant badge will activate upon district officer approval.'}
              </div>
            </div>
          </div>
          <span className="badge badge-amber" style={{ fontSize: '0.76rem', fontWeight: 800 }}>
            {isHindi ? 'समीक्षाधीन (Under Review)' : 'Under Review'}
          </span>
        </div>
      )}

      {/* Shop Profile Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #e5e5e5',
        borderBottom: '4px solid #d4d4d4'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Shop Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#e8fcd9',
              border: '2px solid #a5ed6e',
              color: '#388e00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 #58a700',
              flexShrink: 0
            }}>
              <Store size={32} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                  {currentShop.name}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                  <ShieldCheck size={14} />
                  FSSAI #{currentShop.fssaiNumber}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  {currentShop.location}, {currentShop.city}
                </span>
                <span>•</span>
                <span>{isHindi ? 'प्रभारी:' : 'Contact:'} {currentShop.contactPerson}</span>
              </div>
            </div>
          </div>

          {/* Prominent Quick Donate CTA */}
          <button
            onClick={onOpenDonate}
            className="btn btn-primary"
            style={{
              minHeight: '48px',
              padding: '0 24px',
              fontSize: '0.96rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={20} />
            <span>{isHindi ? 'नया भोजन दान करें' : 'DONATE SURPLUS FOOD'}</span>
          </button>
        </div>

        {/* 3 Quick Visual KPI Blocks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '2px solid #f1f5f9'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'आज का अतिरिक्त भोजन' : 'Today Surplus Available'}
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#e07f00', marginTop: '2px' }}>
              {currentShop.activeSurplusMeals} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isHindi ? 'थाली' : 'meals'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'कुल दान किया गया भोजन' : 'Total Meals Donated'}
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#388e00', marginTop: '2px' }}>
              {currentShop.totalDonatedMeals.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isHindi ? 'थाली' : 'meals'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'एफएसएसएआई सुरक्षा स्कोर' : 'Safety Compliance'}
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#1899d6', marginTop: '2px' }}>
              100% <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isHindi ? 'प्रमाणित' : 'Certified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success notification if OTP verified */}
      {otpSuccessMessage && (
        <div style={{
          backgroundColor: '#e8fcd9',
          border: '2px solid #a5ed6e',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#388e00',
          fontWeight: 800
        }}>
          <CheckCircle2 size={20} />
          <span>{otpSuccessMessage}</span>
        </div>
      )}

      {/* 3 Intuitive Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '22px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {/* Tab 1: Analytics & Scorecard */}
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            minHeight: '46px',
            padding: '0 20px',
            fontSize: '0.92rem',
            borderRadius: '14px',
            fontWeight: 800,
            backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
            color: activeTab === 'analytics' ? '#388e00' : 'var(--color-text)',
            border: activeTab === 'analytics' ? '2px solid #58cc02' : '2px solid transparent',
            boxShadow: activeTab === 'analytics' ? '0 4px 0 #58a700' : 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <TrendingUp size={18} />
          <span>{isHindi ? 'रसोई हिसाब' : 'Kitchen Savings'}</span>
        </button>

        {/* Tab 2: Donations & OTP */}
        <button
          onClick={() => setActiveTab('donations')}
          style={{
            minHeight: '46px',
            padding: '0 20px',
            fontSize: '0.92rem',
            borderRadius: '14px',
            fontWeight: 800,
            backgroundColor: activeTab === 'donations' ? '#ffffff' : 'transparent',
            color: activeTab === 'donations' ? '#1899d6' : 'var(--color-text)',
            border: activeTab === 'donations' ? '2px solid #1cb0f6' : '2px solid transparent',
            boxShadow: activeTab === 'donations' ? '0 4px 0 #1899d6' : 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={18} />
          <span>{isHindi ? 'भोजन दान व पिकअप' : 'Live Donations & Pickups'}</span>
          {shopDonations.length > 0 && (
            <span style={{
              backgroundColor: activeTab === 'donations' ? '#1cb0f6' : '#e2e8f0',
              color: activeTab === 'donations' ? '#ffffff' : '#475569',
              borderRadius: '20px',
              padding: '2px 8px',
              fontSize: '0.74rem',
              fontWeight: 900
            }}>
              {shopDonations.length}
            </span>
          )}
        </button>

        {/* Tab 3: Pantry & Tomorrow's Plan */}
        <button
          onClick={() => setActiveTab('planner')}
          style={{
            minHeight: '46px',
            padding: '0 20px',
            fontSize: '0.92rem',
            borderRadius: '14px',
            fontWeight: 800,
            backgroundColor: activeTab === 'planner' ? '#ffffff' : 'transparent',
            color: activeTab === 'planner' ? '#c26900' : 'var(--color-text)',
            border: activeTab === 'planner' ? '2px solid #ff9600' : '2px solid transparent',
            boxShadow: activeTab === 'planner' ? '0 4px 0 #c26900' : 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Boxes size={18} />
          <span>{isHindi ? 'राशन व कल की तैयारी' : 'Pantry & Tomorrow Plan'}</span>
        </button>
      </div>

      {/* TAB 1: KITCHEN SAVINGS & SCORECARD */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SalesVsPrepAnalytics onOpenDonate={onOpenDonate} />
          <ItemIntelligence />
        </div>
      )}

      {/* TAB 2: ACTIVE DONATIONS & OTP HANDOVER */}
      {activeTab === 'donations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shopDonations.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px' }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                {isHindi ? 'वर्तमान में कोई सक्रिय भोजन दान नहीं है।' : 'No active food donations right now.'}
              </p>
              <button onClick={onOpenDonate} className="btn btn-primary">
                <Plus size={18} />
                <span>{isHindi ? 'पहला भोजन दान दर्ज करें' : 'Post Your First Donation'}</span>
              </button>
            </div>
          ) : (
            shopDonations.map(d => {
              const isMatched = d.status === 'MATCHED' || d.status === 'PICKUP_ASSIGNED';
              const isCollected = d.status === 'COLLECTED';
              const isDelivered = d.status === 'DELIVERED';

              return (
                <div
                  key={d.id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: isMatched ? '2px solid #ff9600' : isDelivered ? '2px solid #58cc02' : '2px solid #e5e5e5',
                    borderBottom: isMatched ? '5px solid #c26900' : isDelivered ? '5px solid #58a700' : '4px solid #d4d4d4'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text)' }}>
                          {d.foodItem}
                        </span>
                        <span className="badge" style={{ backgroundColor: '#e5f6fd', color: '#1899d6', border: '1.5px solid #1cb0f6', fontSize: '0.85rem' }}>
                          {d.quantity} {d.unit}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        ID: {d.id} • {isHindi ? 'सुरक्षित सेवन समय:' : 'Safe Until:'} {new Date(d.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div>
                      <span className={`badge ${isDelivered ? 'badge-emerald' : isMatched ? 'badge-saffron' : 'badge-neutral'}`} style={{ fontSize: '0.86rem', padding: '6px 14px' }}>
                        {d.status === 'AVAILABLE' ? (isHindi ? 'आश्रम के लिए उपलब्ध' : 'AVAILABLE FOR CLAIM') :
                          d.status === 'MATCHED' ? (isHindi ? 'आश्रम द्वारा स्वीकृत - पिकअप जारी' : 'MATCHED - PICKUP IN PROGRESS') :
                            d.status === 'COLLECTED' ? (isHindi ? 'सेवादार द्वारा एकत्रित' : 'COLLECTED - ON THE WAY') :
                              (isHindi ? 'आश्रम में वितरित' : 'DELIVERED')}
                      </span>
                    </div>
                  </div>

                  {/* Beneficiary & Delivery Details */}
                  <div style={{
                    backgroundColor: 'var(--color-background)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '0.88rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <strong>{isHindi ? 'प्राप्तकर्ता आश्रम:' : 'Recipient Ashram:'}</strong>{' '}
                      <span style={{ color: '#1d4ed8', fontWeight: 700 }}>
                        {d.targetBeneficiaryName || (isHindi ? 'एनजीओ मिलान जारी...' : 'Awaiting NGO claim...')}
                      </span>
                    </div>
                    <div>
                      <strong>{isHindi ? 'सेवादार / कूरियर:' : 'Assigned Courier:'}</strong>{' '}
                      <span style={{ color: '#15803d', fontWeight: 700 }}>
                        {d.assignedVolunteerName || (isHindi ? 'आवंटन प्रतीक्षित' : 'Pending dispatch')}
                      </span>
                    </div>
                  </div>

                  {/* Inline OTP Verification Box when Matched */}
                  {isMatched && (
                    <div style={{
                      backgroundColor: '#fff4e5',
                      border: '2px solid #ffc800',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <KeyRound size={20} color="#c26900" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#c26900', fontSize: '0.94rem' }}>
                            {isHindi ? 'सेवादार से प्राप्त 4-अंकीय ओटीपी दर्ज करें:' : 'Verify Courier Pickup OTP:'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {isHindi ? 'सेवादार जब दुकान पर पहुंचे तब उनसे 4-अंकीय ओटीपी पूछकर सत्यापित करें।' : 'Ask the arriving courier for their secret 4-digit code before handing over food.'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="• • • •"
                            value={enteredOtp[d.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEnteredOtp(prev => ({ ...prev, [d.id]: val }));
                              if (otpErrorMessage[d.id]) {
                                setOtpErrorMessage(prev => ({ ...prev, [d.id]: null }));
                              }
                            }}
                            className="form-input"
                            style={{
                              width: '120px',
                              height: '44px',
                              textAlign: 'center',
                              fontSize: '1.25rem',
                              fontWeight: 900,
                              letterSpacing: '4px',
                              fontFamily: 'var(--font-mono)'
                            }}
                          />
                          <button
                            onClick={() => handleVerifyOtp(d.id)}
                            className="btn btn-primary"
                            style={{ minHeight: '44px', padding: '0 18px', fontSize: '0.88rem' }}
                          >
                            <span>{isHindi ? 'सत्यापित करें' : 'VERIFY & HANDOVER'}</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                        {otpErrorMessage[d.id] && (
                          <div style={{
                            color: '#dc2626',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <AlertCircle size={14} />
                            <span>{otpErrorMessage[d.id]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isCollected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1899d6', fontWeight: 800, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={20} />
                      <span>{isHindi ? 'भोजन सेवादार को सौंप दिया गया है, आश्रम तक मार्गस्थ है।' : 'Food successfully handed over to courier, en route to Ashram.'}</span>
                    </div>
                  )}

                  {isDelivered && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#388e00', fontWeight: 800, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={20} />
                      <span>{isHindi ? 'आश्रम में भोजन सफलतापूर्वक वितरित कर दिया गया है। धन्यवाद!' : 'Food delivered successfully to Ashram elders. Thank you!'}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PANTRY STOCK & TOMORROW'S PREPARATION */}
      {activeTab === 'planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RawMaterialPlanner />
          <AIPredictionCard />
        </div>
      )}
    </div>
  );
};
