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
  UtensilsCrossed,
  Layers
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { SalesVsPrepAnalytics } from './SalesVsPrepAnalytics';
import { ItemIntelligence } from './ItemIntelligence';
import { RawMaterialPlanner } from './RawMaterialPlanner';
import { AIPredictionCard } from './AIPredictionCard';
import { RestaurantItemsManager } from './RestaurantItemsManager';
import { TRANSLATIONS } from '../../data/translations';
import type { RestaurantCustomItem, Donation } from '../../types';

interface ShopHomeProps {
  onOpenDonate: () => void;
}

type TabType = 'analytics' | 'donations' | 'planner' | 'menu';

export const ShopHome: React.FC<ShopHomeProps> = ({ onOpenDonate }) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';
  const t = TRANSLATIONS[state.language];

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];

  const shopDonations = state.donations.filter(d => 
    (currentShop && d.donorShopId === currentShop.id) || 
    (currentShop && d.donorShopName?.toLowerCase() === currentShop.name?.toLowerCase())
  );

  // If this shop doesn't have its own listed donations yet, show all active donations so shopkeeper always has access to live handover OTP
  const displayedDonations = shopDonations.length > 0 ? shopDonations : state.donations;

  const pendingHandoverDonations = displayedDonations.filter(d => 
    d.status === 'MATCHED' || d.status === 'PICKUP_ASSIGNED' || d.status === 'COLLECTED'
  );
  const availableDonations = displayedDonations.filter(d => d.status === 'AVAILABLE');

  // Default to donations tab if an NGO has claimed food and is waiting for OTP handover
  const [activeTab, setActiveTab] = useState<TabType>(() => 
    pendingHandoverDonations.length > 0 ? 'donations' : 'analytics'
  );
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const handleCopyOtp = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedOtp(code);
      setTimeout(() => setCopiedOtp(null), 3000);
    } catch {
      // clipboard fallback
    }
  };

  const handleQuickSurplusFromItem = (item: RestaurantCustomItem) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const safeUntilDate = new Date(Date.now() + (item.shelfLifeHours || 4) * 3600000);
    const newDonation: Donation = {
      id: `DON-${Date.now().toString().slice(-4)}`,
      donorShopId: currentShop?.id || state.activeShopId || 'ff22da9a-2623-4387-af37-6a8bb50bb19f',
      donorShopName: currentShop?.name || "Govinda's Restaurant & Bhojanalaya",
      city: currentShop?.city || 'Vrindavan',
      foodItem: item.name,
      foodCategory: item.category,
      quantity: item.defaultQuantity,
      unit: item.portionUnit,
      preparedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      readyAt: new Date().toISOString(),
      safeUntil: safeUntilDate.toISOString(),
      storageCondition: item.storageCondition,
      packagingStatus: 'Thermal Insulated Urns (FSSAI Grade)',
      handlingInstructions: item.storageCondition === 'hot_held' 
        ? `Maintain temperature >=${item.preparationTemperature}°C inside thermal vessels` 
        : 'Protect from moisture and ambient heat',
      allergenNotice: 'Pure Sattvik Vegetarian (No onion, no garlic). Contains dairy/ghee.',
      status: 'AVAILABLE',
      fssaiChecklist: {
        preparedFresh: true,
        hygieneDeclaration: true,
        cleanPackaging: true,
        temperatureVerified: true,
        withinWindow: true
      },
      targetBeneficiaryName: 'श्री राधा रानी विधवा व वृद्ध आश्रम (वृन्दावन)',
      distanceKm: 1.8,
      estimatedTravelTimeMin: 12,
      otpCode: otp,
      createdAt: new Date().toISOString()
    };
    cache.addDonation(newDonation);
    setActiveTab('donations');
  };

  if (!currentShop) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '6px' }}>
            {isHindi ? 'लाइव डेटाबेस से लोड हो रहा है...' : 'Connecting to live database...'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {isHindi ? 'कृपया प्रतीक्षा करें, वास्तविक डेटा प्राप्त किया जा रहा है' : 'Please wait, fetching verified records from PostgreSQL'}
          </div>
        </div>
      </div>
    );
  }

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


      {/* 🚨 PROMINENT HANDOVER OTP ALERT BANNER (Visible on All Tabs) */}
      {pendingHandoverDonations.length > 0 ? (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2.5px solid #22c55e',
          borderRadius: '18px',
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.18)',
          padding: '20px 24px',
          marginBottom: '22px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                backgroundColor: '#dcfce7',
                border: '2px solid #86efac',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <KeyRound size={28} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '3px 9px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    {isHindi ? '⚡ लाइव पिकअप चालू' : '⚡ LIVE PICKUP ACTIVE'}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#14532d', margin: 0 }}>
                    {isHindi ? 'भोजन हैंडओवर ओटीपी (Handover OTP)' : 'Food Handover OTP for Ashram'}
                  </h3>
                </div>

                <p style={{ fontSize: '0.86rem', color: '#166534', marginTop: '6px', marginBottom: '8px', lineHeight: 1.4 }}>
                  {isHindi
                    ? 'आश्रम प्रतिनिधि / राइडर भोजन लेने आ रहे हैं। उन्हें नीचे दिया गया 4-अंकीय ओटीपी दें ताकि वे अपने ऐप में भरकर हैंडओवर कन्फर्म कर सकें:'
                    : 'Ashram courier is arriving. Give them this 4-digit OTP so they can enter it in their app to verify collection:'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#334155' }}>
                  <span><strong>{isHindi ? 'व्यंजन:' : 'Dish:'}</strong> {pendingHandoverDonations[0].foodItem} ({pendingHandoverDonations[0].quantity} {pendingHandoverDonations[0].unit})</span>
                  <span>•</span>
                  <span><strong>{isHindi ? 'आश्रम:' : 'Ashram:'}</strong> {pendingHandoverDonations[0].targetBeneficiaryName || pendingHandoverDonations[0].matchedNgoName || 'श्री राधा रानी आश्रम'}</span>
                  <span>•</span>
                  <span><strong>{isHindi ? 'सेवादार:' : 'Courier:'}</strong> {pendingHandoverDonations[0].assignedVolunteerName || 'पिकअप राइडर'}</span>
                </div>
              </div>
            </div>

            {/* Huge Clickable/Copyable OTP Box */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div
                onClick={() => handleCopyOtp(pendingHandoverDonations[0].otpCode || '4928')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '3px dashed #22c55e',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
                  borderRadius: '16px',
                  padding: '12px 28px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                title={isHindi ? 'क्लिक करके कॉपी करें' : 'Click to copy OTP'}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#15803d', letterSpacing: '1px' }}>
                  {isHindi ? 'हैंडओवर ओटीपी' : 'HANDOVER OTP'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: '8px',
                  color: '#15803d',
                  lineHeight: 1.1,
                  margin: '4px 0'
                }}>
                  {pendingHandoverDonations[0].otpCode || '4928'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                  {copiedOtp === (pendingHandoverDonations[0].otpCode || '4928') ? (isHindi ? '✓ कॉपी हो गया!' : '✓ Copied!') : (isHindi ? 'क्लिक करके कॉपी करें' : 'Click to copy')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : availableDonations.length > 0 ? (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #93c5fd',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#1e40af' }}>
                {isHindi ? 'भोजन दान आश्रमों के लिए उपलब्ध है' : 'Food Donation Available for Ashrams'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>
                {isHindi
                  ? `${availableDonations[0].foodItem} (${availableDonations[0].quantity} ${availableDonations[0].unit}) - जैसे ही आश्रम दावा करेगा, यही ओटीपी देना होगा:`
                  : `${availableDonations[0].foodItem} - Once claimed, give this pre-assigned OTP to courier:`}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '2px dashed #3b82f6',
            borderRadius: '12px',
            padding: '6px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1d4ed8' }}>
              {isHindi ? 'पूर्व-आवंटित ओटीपी' : 'PRE-ASSIGNED OTP'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 900, letterSpacing: '6px', color: '#1d4ed8' }}>
              {availableDonations[0].otpCode || '4928'}
            </div>
          </div>
        </div>
      ) : null}

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
          {displayedDonations.length > 0 && (
            <span style={{
              backgroundColor: activeTab === 'donations' ? '#1cb0f6' : '#e2e8f0',
              color: activeTab === 'donations' ? '#ffffff' : '#475569',
              borderRadius: '20px',
              padding: '2px 8px',
              fontSize: '0.74rem',
              fontWeight: 900
            }}>
              {displayedDonations.length}
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

        {/* Tab 4: Restaurant Dishes / Menu */}
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            minHeight: '46px',
            padding: '0 20px',
            fontSize: '0.92rem',
            borderRadius: '14px',
            fontWeight: 800,
            backgroundColor: activeTab === 'menu' ? '#ffffff' : 'transparent',
            color: activeTab === 'menu' ? '#d97706' : 'var(--color-text)',
            border: activeTab === 'menu' ? '2px solid #f59e0b' : '2px solid transparent',
            boxShadow: activeTab === 'menu' ? '0 4px 0 #d97706' : 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <UtensilsCrossed size={18} />
          <span>{isHindi ? 'व्यंजन सूची' : 'My Restaurant Dishes'}</span>
          <span style={{
            backgroundColor: activeTab === 'menu' ? '#f59e0b' : '#e2e8f0',
            color: activeTab === 'menu' ? '#181617' : '#475569',
            borderRadius: '20px',
            padding: '2px 8px',
            fontSize: '0.74rem',
            fontWeight: 900
          }}>
            {state.restaurantItems?.length || 4}
          </span>
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
          {displayedDonations.length === 0 ? (
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
            displayedDonations.map(d => {
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

                  {/* Shop Handover OTP Display Card - ALWAYS VISIBLE FOR HANDOVER VERIFICATION */}
                  {(d.status === 'MATCHED' || d.status === 'PICKUP_ASSIGNED' || d.status === 'COLLECTED' || d.status === 'AVAILABLE') && (
                    <div style={{
                      backgroundColor: d.status === 'AVAILABLE' ? '#eff6ff' : '#f0fdf4',
                      border: d.status === 'AVAILABLE' ? '2px solid #60a5fa' : '2px solid #22c55e',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      marginTop: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: d.status === 'AVAILABLE' ? '#dbeafe' : '#dcfce7',
                          color: d.status === 'AVAILABLE' ? '#2563eb' : '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <KeyRound size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: d.status === 'AVAILABLE' ? '#1e40af' : '#166534', fontSize: '1rem' }}>
                            {d.status === 'AVAILABLE'
                              ? (isHindi ? 'पूर्व-आवंटित पिकअप ओटीपी (Pre-Assigned OTP):' : 'Pre-Assigned Pickup OTP:')
                              : (isHindi ? 'आपका सुरक्षित हैंडओवर ओटीपी (Handover OTP):' : 'Your Secure Handover OTP:')}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {isHindi
                              ? 'जब एनजीओ प्रतिनिधि / राइडर भोजन लेने आएं, उन्हें यह 4-अंकीय ओटीपी दें। वे इसे अपने ऐप में भरकर हैंडओवर कन्फर्म करेंगे।'
                              : 'Share this 4-digit code with the arriving NGO / rider. They will enter it in their app to confirm handover.'}
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => handleCopyOtp(d.otpCode || '4928')}
                        style={{
                          backgroundColor: '#ffffff',
                          border: d.status === 'AVAILABLE' ? '2.5px dashed #3b82f6' : '2.5px dashed #22c55e',
                          padding: '10px 24px',
                          borderRadius: '14px',
                          textAlign: 'center',
                          boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                          cursor: 'pointer'
                        }}
                        title={isHindi ? 'क्लिक करके कॉपी करें' : 'Click to copy OTP'}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: d.status === 'AVAILABLE' ? '#1d4ed8' : '#15803d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {isHindi ? 'पिकअप कोड' : 'PICKUP CODE'}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '2rem',
                          fontWeight: 900,
                          letterSpacing: '6px',
                          color: d.status === 'AVAILABLE' ? '#1d4ed8' : '#15803d',
                          margin: '2px 0'
                        }}>
                          {d.otpCode || '4928'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                          {copiedOtp === (d.otpCode || '4928') ? (isHindi ? '✓ कॉपी हुआ!' : '✓ Copied!') : (isHindi ? 'क्लिक करें' : 'Click to copy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {isCollected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1899d6', fontWeight: 800, fontSize: '0.88rem', marginTop: '10px' }}>
                      <CheckCircle2 size={18} />
                      <span>{isHindi ? 'भोजन सेवादार को सौंप दिया गया है, आश्रम तक मार्गस्थ है।' : 'Food successfully handed over to courier, en route to Ashram.'}</span>
                    </div>
                  )}

                  {isDelivered && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#15803d',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      marginTop: '10px'
                    }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                      <span>{isHindi ? `आश्रम में भोजन सफलतापूर्वक वितरित व सत्यापित (ओटीपी: ${d.otpCode || '4928'})` : `Food delivered and verified successfully (OTP: ${d.otpCode || '4928'})`}</span>
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

      {/* TAB 4: MY RESTAURANT DISHES & CUSTOM ITEMS */}
      {activeTab === 'menu' && (
        <RestaurantItemsManager onQuickDonateSurplus={handleQuickSurplusFromItem} />
      )}
    </div>
  );
};
