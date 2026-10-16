import React, { useState } from 'react';
import {
  Store,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Phone,
  UtensilsCrossed,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

interface LoginPortalProps {
  onSelectPortal: (portal: 'shop' | 'ngo_donor', entityId?: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSelectPortal }) => {
  const { state, cache } = useAppState();
  const [selectedShopId, setSelectedShopId] = useState(state.shops[0]?.id || 'shop-1');
  const [selectedNgoId, setSelectedNgoId] = useState(state.ngos[0]?.id || 'ngo-1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const isHindi = state.language === 'hi';

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.includes('1') || phoneNumber.toLowerCase().includes('shop')) {
      onSelectPortal('shop', selectedShopId);
    } else {
      onSelectPortal('ngo_donor', selectedNgoId);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 20px',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar */}
      <header style={{
        maxWidth: '920px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-on-primary)',
            boxShadow: '0 3px 0 var(--color-primary-dark)'
          }}>
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.8px', lineHeight: 1.1 }}>
              FOOD LOOP
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Mathura - Vrindavan - Barsana Pilot
            </div>
          </div>
        </div>

        <button
          onClick={() => cache.setLanguage(isHindi ? 'en' : 'hi')}
          className="btn btn-secondary"
          style={{ minHeight: '38px', padding: '0 14px', fontSize: '0.82rem' }}
        >
          <Globe2 size={15} />
          <span>{isHindi ? 'English' : 'हिन्दी'}</span>
        </button>
      </header>

      {/* Main Focused Body - Constrained Width (920px max) */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '6px 0 18px 0',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto'
      }}>
        {/* Title & Headline */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: 'clamp(1.45rem, 2.4vw, 1.85rem)',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1.25,
            marginBottom: '6px'
          }}>
            {isHindi ? 'कृपया अपना पोर्टल चुनें' : 'Choose Your Portal to Enter'}
          </h1>
          <p style={{
            fontSize: '0.88rem',
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

        {/* The 2 Primary Category Cards - Balanced Proportions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px',
          width: '100%',
          marginBottom: '18px'
        }}>
          {/* CATEGORY 1: SHOP DASHBOARD */}
          <div className="glass-panel" style={{
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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
                    {isHindi ? 'दुकानदार डैशबोर्ड' : 'SHOP DASHBOARD'}
                  </h2>
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
                      {s.name} ({s.location}, {s.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct 3D Entry CTA Button */}
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
          <div className="glass-panel" style={{
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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
                    {isHindi ? 'एनजीओ एवं अन्नदाता ऐप' : 'DONOR / NGO APP'}
                  </h2>
                  <div style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700, marginTop: '2px' }}>
                    {isHindi ? 'आश्रम, एनजीओ एवं तीर्थ अन्नदाता' : 'Ashrams, NGOs, Riders & Sponsors'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                {isHindi
                  ? 'आश्रमों हेतु तुरंत भोजन का दावा करें या जन्मदिन/पुण्यतिथि पर भंडारा प्रायोजित करें।'
                  : 'Claim hot surplus meals for elderly ashrams or sponsor commemorative bhandaras.'}
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
                  <span>{isHindi ? 'जन्मदिन/पुण्यतिथि भंडारा दान' : 'Sponsor Bhandaras with certificate'}</span>
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
                      {n.name} ({n.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct 3D Entry CTA Button */}
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

        {/* Compact Quick Mobile Login Strip */}
        <div className="glass-panel" style={{
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '2px solid #e5e5e5',
          borderBottom: '3px solid #d4d4d4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
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
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {isHindi ? 'मोबाइल नंबर द्वारा त्वरित प्रवेश' : 'Quick Mobile Number Login'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {isHindi ? 'पंजीकृत फोन नंबर दर्ज करें:' : 'Direct entry with registered phone number:'}
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
              style={{ width: '150px', height: '38px', fontSize: '0.84rem' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 14px', fontSize: '0.82rem' }}>
              <span>{isHindi ? 'प्रवेश' : 'Login'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* 1-Tap Demo Shortcuts */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem' }}>
            <button
              onClick={() => { 
                setPhoneNumber('+91 98971 10001'); 
                const targetId = state.shops.find(s => s.name.includes('Krishna Bhojanalaya'))?.id || state.shops[0]?.id || 'shop-1';
                onSelectPortal('shop', targetId); 
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#388e00',
                cursor: 'pointer',
                fontWeight: 700,
                textDecoration: 'underline',
                padding: 0
              }}
            >
              • {isHindi ? 'दुकानदार डेमो (+91 98971 10001)' : 'Shop Demo (+91 98971 10001)'}
            </button>
            <button
              onClick={() => { 
                setPhoneNumber('+91 98971 20002'); 
                const targetId = state.ngos.find(n => n.name.includes('Braj Seva'))?.id || state.ngos[0]?.id || 'ngo-1';
                onSelectPortal('ngo_donor', targetId); 
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1899d6',
                cursor: 'pointer',
                fontWeight: 700,
                textDecoration: 'underline',
                padding: 0
              }}
            >
              • {isHindi ? 'एनजीओ डेमो (+91 98971 20002)' : 'NGO Demo (+91 98971 20002)'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '920px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'var(--color-text-muted)',
        paddingTop: '6px',
        paddingBottom: '8px'
      }}>
        FOOD LOOP • Smart Food Recovery &amp; Distribution Platform • Mathura - Vrindavan - Barsana Regional Pilot • FSSAI IFSA Certified
      </footer>
    </div>
  );
};
