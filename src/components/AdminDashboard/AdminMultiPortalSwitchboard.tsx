import React, { useState } from 'react';
import {
  Store,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building2,
  Phone,
  RotateCcw
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

interface AdminMultiPortalSwitchboardProps {
  onSelectPortal: (portal: 'shop' | 'ngo_donor' | 'admin', entityId?: string) => void;
  onBackToAdmin?: () => void;
}

export const AdminMultiPortalSwitchboard: React.FC<AdminMultiPortalSwitchboardProps> = ({
  onSelectPortal,
  onBackToAdmin
}) => {
  const { state } = useAppState();
  const [selectedShopId, setSelectedShopId] = useState(state.shops[0]?.id || 'ff22da9a-2623-4387-af37-6a8bb50bb19f');
  const [selectedNgoId, setSelectedNgoId] = useState(state.ngos[0]?.id || '09afa3ca-3498-4446-96f0-5b566ebdeb53');
  const [phoneNumber, setPhoneNumber] = useState('');

  const isHindi = state.language === 'hi';

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.includes('4') || phoneNumber.toLowerCase().includes('admin')) {
      onSelectPortal('admin');
    } else if (phoneNumber.includes('1') || phoneNumber.toLowerCase().includes('shop')) {
      onSelectPortal('shop', selectedShopId);
    } else {
      onSelectPortal('ngo_donor', selectedNgoId);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      border: '2px solid var(--color-border)',
      boxShadow: '0 4px 0 var(--color-border)',
      padding: '24px',
      maxWidth: '960px',
      margin: '0 auto'
    }}>
      {/* Top Banner Notice for Admin */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '18px',
        marginBottom: '20px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            border: '2px solid #fde68a',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1e293b' }}>
              Master District Multi-Portal Switchboard (एडमिन मास्टर पोर्टल)
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              Reserved for Food Safety Officer to simulate, inspect, and test any registered establishment in the district.
            </div>
          </div>
        </div>

        {onBackToAdmin && (
          <button
            onClick={onBackToAdmin}
            className="btn btn-secondary"
            style={{
              minHeight: '36px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} />
            <span>Return to Control Room</span>
          </button>
        )}
      </div>

      {/* Title & Headline */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <h2 style={{
          fontSize: 'clamp(1.35rem, 2.2vw, 1.7rem)',
          fontWeight: 900,
          color: 'var(--color-text)',
          lineHeight: 1.25,
          marginBottom: '6px'
        }}>
          {isHindi ? 'जिला मास्टर स्विचबोर्ड: पोर्टल चुनें' : 'Choose Your Portal to Enter'}
        </h2>
        <p style={{
          fontSize: '0.86rem',
          color: 'var(--color-text-muted)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.4
        }}>
          {isHindi
            ? 'दुकानदार अतिरिक्त भोजन दान करें, या एनजीओ / आश्रम हेतु भोजन प्राप्त करें।'
            : 'Direct and simple: Donate surplus food as a shop, or claim meals for Ashrams and NGOs.'}
        </p>
      </div>

      {/* The 2 Primary Category Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
        gap: '20px',
        width: '100%',
        marginBottom: '20px'
      }}>
        {/* CATEGORY 1: SHOP DASHBOARD */}
        <div style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '2px solid #58cc02',
          borderBottom: '5px solid #58a700',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 14px rgba(88, 204, 2, 0.12)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#e8fcd9',
                border: '2px solid #a5ed6e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#388e00'
              }}>
                <Store size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                  {isHindi ? 'दुकानदार डैशबोर्ड' : 'SHOP DASHBOARD'}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, marginTop: '2px' }}>
                  {isHindi ? 'हलवाई, रेस्टोरेंट एवं कैटरर्स' : 'Sweets Shops, Restaurants & Caterers'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              {isHindi
                ? 'अतिरिक्त भोजन का 60 सेकंड में दान करें और एफएसएसएआई सत्यापित डिजिटल रसीद प्राप्त करें।'
                : 'Donate hot surplus meals in 60 seconds with automated NGO matching and verified pickup.'}
            </p>

            {/* Feature Checklist */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '18px',
              backgroundColor: '#f7fbf3',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #d6f2c0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#388e00" />
                <span>{isHindi ? '60 सेकंड में भोजन दान' : '60-sec surplus food donation'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#388e00" />
                <span>{isHindi ? 'सुरक्षित 4-अंकीय पिकअप ओटीपी' : 'Safe 4-digit pickup OTP verification'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#388e00" />
                <span>{isHindi ? 'बृज तीर्थ यात्री मांग पूर्वानुमान' : 'Braj rush & demand forecast'}</span>
              </div>
            </div>

            {/* Shop Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                {isHindi ? 'पंजीकृत दुकान चुनें:' : 'Select Registered Shop:'}
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="form-select"
                style={{ height: '42px', fontWeight: 700, fontSize: '0.88rem' }}
              >
                {state.shops.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location}, {s.city}) {s.verified ? (isHindi ? '✓ [सत्यापित / Permitted]' : '✓ [Permitted]') : (isHindi ? '[समीक्षाधीन]' : '[Under Review]')}
                  </option>
                ))}
              </select>

              {/* Direct Access to Permitted Shops */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800, marginBottom: '6px' }}>
                  {isHindi ? 'सत्यापित दुकानें (तुरंत पहुंचें):' : 'Permitted Shops (Click to Access):'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {state.shops.filter(s => s.verified).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedShopId(s.id);
                        onSelectPortal('shop', s.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        border: '1.5px solid #86efac',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={isHindi ? `${s.name} में प्रवेश करें` : `Enter ${s.name}`}
                    >
                      <CheckCircle2 size={12} color="#16a34a" />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPortal('shop', selectedShopId)}
            className="btn btn-primary"
            style={{
              width: '100%',
              minHeight: '46px',
              fontSize: '0.92rem',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            <span>{isHindi ? 'दुकानदार डैशबोर्ड खोलें' : 'ENTER SHOP DASHBOARD'}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* CATEGORY 2: DONOR / NGO APP */}
        <div style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '2px solid #1cb0f6',
          borderBottom: '5px solid #1899d6',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 14px rgba(28, 176, 246, 0.12)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#e5f6fd',
                border: '2px solid #1cb0f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1899d6'
              }}>
                <HeartHandshake size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                  {isHindi ? 'एनजीओ एवं अन्नदाता ऐप' : 'DONOR / NGO APP'}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700, marginTop: '2px' }}>
                  {isHindi ? 'आश्रम, एनजीओ एवं तीर्थ अन्नदाता' : 'Ashrams, NGOs, Riders & Sponsors'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              {isHindi
                ? 'आश्रमों हेतु तुरंत भोजन का दावा करें या जन्मदिन/पुण्यतिथि पर भंडारा प्रायोजित करें।'
                : 'Claim hot surplus meals for elderly ashrams or sponsor commemorative.'}
            </p>

            {/* Feature Checklist */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '18px',
              backgroundColor: '#f3faff',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #c7ebfc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#1cb0f6" />
                <span>{isHindi ? 'आश्रम हेतु 1-क्लिक भोजन दावा' : '1-click claim food for ashrams'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#1cb0f6" />
                <span>{isHindi ? '4-अंकीय सुरक्षित पिकअप ओटीपी' : 'Secure 4-digit pickup OTP'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                <CheckCircle2 size={16} color="#1cb0f6" />
                <span>{isHindi ? 'जन्मदिन/पुण्यतिथि दान' : 'Sponsor with certificate'}</span>
              </div>
            </div>

            {/* NGO Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                {isHindi ? 'एनजीओ / आश्रम चुनें:' : 'Select Organization:'}
              </label>
              <select
                value={selectedNgoId}
                onChange={(e) => setSelectedNgoId(e.target.value)}
                className="form-select"
                style={{ height: '42px', fontWeight: 700, fontSize: '0.88rem' }}
              >
                {state.ngos.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.city}) {n.verified ? (isHindi ? '✓ [सत्यापित / Permitted]' : '✓ [Permitted]') : (isHindi ? '[समीक्षाधीन]' : '[Under Review]')}
                  </option>
                ))}
              </select>

              {/* Direct Access to Permitted NGOs */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800, marginBottom: '6px' }}>
                  {isHindi ? 'सत्यापित आश्रम (तुरंत पहुंचें):' : 'Permitted NGOs (Click to Access):'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {state.ngos.filter(n => n.verified).map(n => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setSelectedNgoId(n.id);
                        onSelectPortal('ngo_donor', n.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        border: '1.5px solid #93c5fd',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={isHindi ? `${n.name} में प्रवेश करें` : `Enter ${n.name}`}
                    >
                      <CheckCircle2 size={12} color="#2563eb" />
                      <span>{n.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPortal('ngo_donor', selectedNgoId)}
            className="btn btn-accent"
            style={{
              width: '100%',
              minHeight: '46px',
              fontSize: '0.92rem',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            <span>{isHindi ? 'एनजीओ / अन्नदाता ऐप खोलें' : 'ENTER DONOR / NGO APP'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Mobile Number Login Strip for Admin Simulation */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: '#e5f6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1899d6'
          }}>
            <Phone size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Direct Simulator by Phone Number
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              Enter any partner contact phone to test role authorization:
            </div>
          </div>
        </div>

        <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="tel"
            placeholder="+91 98971 10001"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="form-input"
            style={{ width: '150px', height: '36px', fontSize: '0.82rem' }}
          />
          <button type="submit" className="btn btn-secondary" style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.8rem' }}>
            <span>Test Login</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
