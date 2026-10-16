import React, { useState } from 'react';
import {
  Store,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Globe2,
  Phone,
  UtensilsCrossed,
  Building2,
  Bike,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { RegisterOrganizationModal } from './RegisterOrganizationModal';
import type { UserRole } from '../../types';

interface LoginPortalProps {
  onSelectPortal: (portal: 'shop' | 'ngo_donor' | 'admin', entityId?: string, role?: UserRole) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSelectPortal }) => {
  const { state, cache } = useAppState();
  const [activeLoginMode, setActiveLoginMode] = useState<'roles' | 'phone'>('roles');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  const isHindi = state.language === 'hi';

  const defaultShopId = state.shops.find(s => s.verified)?.id || state.shops[0]?.id || 'shop-1';
  const defaultNgoId = state.ngos.find(n => n.verified)?.id || state.ngos[0]?.id || 'ngo-1';

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    // Check if phone matches any registered shop
    const matchedShop = state.shops.find(s => s.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
    if (matchedShop) {
      onSelectPortal('shop', matchedShop.id, 'shop');
      return;
    }

    // Check if phone matches any registered NGO
    const matchedNgo = state.ngos.find(n => n.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
    if (matchedNgo) {
      onSelectPortal('ngo_donor', matchedNgo.id, 'ngo');
      return;
    }

    // Check if admin / food safety officer phone
    if (cleanPhone.includes('40004') || phoneNumber.toLowerCase().includes('admin')) {
      onSelectPortal('admin', undefined, 'admin');
      return;
    }

    // Check if volunteer phone
    if (cleanPhone.includes('22340') || phoneNumber.toLowerCase().includes('volunteer') || phoneNumber.toLowerCase().includes('rider')) {
      onSelectPortal('ngo_donor', defaultNgoId, 'volunteer');
      return;
    }

    // Check if donor phone
    if (cleanPhone.includes('33450') || phoneNumber.toLowerCase().includes('donor') || phoneNumber.toLowerCase().includes('sponsor')) {
      onSelectPortal('ngo_donor', defaultNgoId, 'donor');
      return;
    }

    // Fallback: Default to shop demo if ending with 1, NGO if ending with 2, otherwise Shop
    if (cleanPhone.endsWith('2')) {
      onSelectPortal('ngo_donor', defaultNgoId, 'ngo');
    } else {
      onSelectPortal('shop', defaultShopId, 'shop');
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
        maxWidth: '1040px',
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
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-on-primary)',
            boxShadow: '0 3px 0 var(--color-primary-dark)'
          }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.6px', lineHeight: 1.1 }}>
              Foody Loop
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              PAN India Pilot
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="btn btn-primary"
            style={{
              minHeight: '38px',
              padding: '0 16px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={16} />
            <span>{isHindi ? 'नया पंजीकरण (Register)' : 'New Registration'}</span>
          </button>

          <button
            onClick={() => cache.setLanguage(isHindi ? 'en' : 'hi')}
            className="btn btn-secondary"
            style={{ minHeight: '38px', padding: '0 14px', fontSize: '0.82rem' }}
          >
            <Globe2 size={15} />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Body */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px 0 24px 0',
        width: '100%',
        maxWidth: '1040px',
        margin: '0 auto'
      }}>
        {/* Title & Introduction */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            color: '#166534',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <Sparkles size={14} color="#16a34a" />
            <span>FSSAI Certified Surplus Food Recovery Platform</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 2.6vw, 2rem)',
            fontWeight: 900,
            color: 'var(--color-text)',
            lineHeight: 1.25,
            marginBottom: '6px'
          }}>
            {isHindi ? 'फूडी लूप पोर्टल लॉगिन' : 'Sign In to Foody Loop'}
          </h1>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--color-text-muted)',
            maxWidth: '580px',
            margin: '0 auto',
            lineHeight: 1.45
          }}>
            {isHindi
              ? 'अपनी भूमिका चुनें या पंजीकृत फोन नंबर द्वारा सीधे अपने समर्पित डैशबोर्ड में प्रवेश करें।'
              : 'Access your dedicated operational portal according to your registered role in the Braj Pilot.'}
          </p>
        </div>

        {/* Login Method Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveLoginMode('roles')}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              border: activeLoginMode === 'roles' ? '2px solid var(--color-primary-dark)' : '2px solid var(--color-border)',
              backgroundColor: activeLoginMode === 'roles' ? 'var(--color-primary)' : '#ffffff',
              color: activeLoginMode === 'roles' ? 'var(--color-on-primary)' : 'var(--color-text)',
              boxShadow: activeLoginMode === 'roles' ? '0 3px 0 var(--color-primary-dark)' : 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isHindi ? 'भूमिका अनुसार सीधा प्रवेश' : 'Direct Role Access'}
          </button>
          <button
            onClick={() => setActiveLoginMode('phone')}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              border: activeLoginMode === 'phone' ? '2px solid var(--color-primary-dark)' : '2px solid var(--color-border)',
              backgroundColor: activeLoginMode === 'phone' ? 'var(--color-primary)' : '#ffffff',
              color: activeLoginMode === 'phone' ? 'var(--color-on-primary)' : 'var(--color-text)',
              boxShadow: activeLoginMode === 'phone' ? '0 3px 0 var(--color-primary-dark)' : 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isHindi ? 'मोबाइल नंबर व ओटीपी' : 'Mobile Phone & OTP'}
          </button>
        </div>

        {/* Mode 1: Distributed Role Cards */}
        {activeLoginMode === 'roles' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* ROLE 1: SHOP & RESTAURANT */}
            <div
              onClick={() => onSelectPortal('shop', defaultShopId, 'shop')}
              className="glass-panel"
              style={{
                padding: '20px',
                border: '2px solid #58cc02',
                borderBottom: '5px solid #58a700',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(88, 204, 2, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#e8fcd9',
                    border: '2px solid #a5ed6e',
                    color: '#388e00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Store size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      {isHindi ? 'दुकानदार व रेस्टोरेंट' : 'Shop & Restaurant Partner'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                      {isHindi ? 'हलवाई, भोजनालय व कैटरर्स' : 'Sweet Shops, Bhojanalayas & Caterers'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {isHindi
                    ? 'अतिरिक्त भोजन का 60 सेकंड में दान, तीर्थ यात्री मांग पूर्वानुमान और एफएसएसएआई सत्यापित रसीद।'
                    : 'Surplus food declaration, AI footfall demand forecasting, and instant FSSAI donation certificates.'}
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  justifyContent: 'center'
                }}
              >
                <span>{isHindi ? 'दुकानदार डैशबोर्ड में प्रवेश' : 'Enter Shop Dashboard'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* ROLE 2: NGO & ASHRAM */}
            <div
              onClick={() => onSelectPortal('ngo_donor', defaultNgoId, 'ngo')}
              className="glass-panel"
              style={{
                padding: '20px',
                border: '2px solid #1cb0f6',
                borderBottom: '5px solid #1899d6',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(28, 176, 246, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#e5f6fd',
                    border: '2px solid #1cb0f6',
                    color: '#1899d6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      {isHindi ? 'आश्रम व एनजीओ हब' : 'NGO & Ashram Hub'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700 }}>
                      {isHindi ? 'वृद्ध आश्रम, गौशाला व सेवा न्यास' : 'Ashrams, Shelters & Recovery Trusts'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {isHindi
                    ? 'ताजा अतिरिक्त भोजन का 1-क्लिक दावा, आपातकालीन मांग पत्र और सुरक्षित 4-अंकीय ओटीपी हस्तांतरण।'
                    : 'Claim surplus meals, manage ashram dietary demands, and receive food with safe 4-digit OTP handover.'}
                </p>
              </div>

              <button
                className="btn btn-accent"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  justifyContent: 'center'
                }}
              >
                <span>{isHindi ? 'एनजीओ पोर्टल में प्रवेश' : 'Enter NGO Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* ROLE 3: VOLUNTEER COURIER */}
            <div
              onClick={() => onSelectPortal('ngo_donor', defaultNgoId, 'volunteer')}
              className="glass-panel"
              style={{
                padding: '20px',
                border: '2px solid #ff9600',
                borderBottom: '5px solid #cc7800',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(255, 150, 0, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#fff7ed',
                    border: '2px solid #fdba74',
                    color: '#c2410c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bike size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      {isHindi ? 'स्वयंसेवक डिलीवरी राइडर' : 'Volunteer Courier'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>
                      {isHindi ? 'ई-स्कूटर व वाहन सेवा' : 'E-Scooter & Delivery Transit'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {isHindi
                    ? 'दुकान से आश्रम तक सुरक्षित भोजन परिवहन, तापमान सत्यापन और ओटीपी डिलीवरी पुष्टि।'
                    : 'Food redistribution routing between shops and ashrams, thermal verification, and delivery completion.'}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  backgroundColor: '#fff7ed',
                  color: '#c2410c',
                  borderColor: '#fdba74'
                }}
              >
                <span>{isHindi ? 'राइडर पोर्टल में प्रवेश' : 'Enter Courier View'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* ROLE 4: PILGRIM & SPONSOR */}
            <div
              onClick={() => onSelectPortal('ngo_donor', defaultNgoId, 'donor')}
              className="glass-panel"
              style={{
                padding: '20px',
                border: '2px solid #a855f7',
                borderBottom: '5px solid #7e22ce',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#faf5ff',
                    border: '2px solid #d8b4fe',
                    color: '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      {isHindi ? 'तीर्थ अन्नदाता व प्रायोजक' : 'Pilgrim & Food Sponsor'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: 700 }}>
                      {isHindi ? 'जन्मदिन, पुण्यतिथि व उत्सव भंडारा' : 'Annadanam & Memorial Sponsorship'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {isHindi
                    ? 'वृन्दावन व मथुरा के आश्रमों में भंडारा प्रायोजित करें और डिजिटल दान प्रमाणपत्र प्राप्त करें।'
                    : 'Sponsor fresh hot meals at local ashrams with transparent distribution and digital certificate.'}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  backgroundColor: '#faf5ff',
                  color: '#7e22ce',
                  borderColor: '#d8b4fe'
                }}
              >
                <span>{isHindi ? 'अन्नदान ऐप में प्रवेश' : 'Enter Sponsorship App'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* ROLE 5: FOOD SAFETY OFFICER & CENTRAL ADMIN */}
            <div
              onClick={() => onSelectPortal('admin', undefined, 'admin')}
              className="glass-panel"
              style={{
                padding: '20px',
                border: '2px solid #3b82f6',
                borderBottom: '5px solid #1d4ed8',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    border: '2px solid #93c5fd',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      {isHindi ? 'खाद्य सुरक्षा अधिकारी व एडमिन' : 'Food Safety Officer & Admin'}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700 }}>
                      {isHindi ? 'केंद्रीय नियंत्रण कक्ष व अनुमोदन' : 'Central Regulatory Operations Room'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {isHindi
                    ? 'संस्था अनुमोदन, एफएसएसएआई विनियमन, जिला मांग-आपूर्ति विश्लेषण और मास्टर स्विचबोर्ड।'
                    : 'FSSAI partner approvals, Supabase database audit logs, regional supply analysis, and district switchboard.'}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  borderColor: '#93c5fd'
                }}
              >
                <span>{isHindi ? 'नियंत्रण कक्ष में प्रवेश' : 'Enter Central Control Room'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Phone Number & OTP Login */}
        {activeLoginMode === 'phone' && (
          <div className="glass-panel" style={{
            maxWidth: '520px',
            margin: '0 auto 20px auto',
            padding: '28px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid var(--color-border)',
            boxShadow: '0 4px 0 var(--color-border)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#e5f6fd',
              color: '#1899d6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <Phone size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
              {isHindi ? 'पंजीकृत मोबाइल नंबर दर्ज करें' : 'Login with Mobile Number'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              {isHindi
                ? 'सिस्टम स्वचालित रूप से आपकी संस्था या भूमिका पहचान कर उपयुक्त पोर्टल खोलेगा।'
                : 'Directly access your authorized portal using your registered mobile number.'}
            </p>

            <form onSubmit={handlePhoneLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                  {isHindi ? 'मोबाइल नंबर:' : 'Mobile Number:'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="tel"
                    placeholder="+91 98371 45290"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, height: '44px', fontSize: '0.92rem', fontWeight: 700 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ minHeight: '44px', padding: '0 20px', fontSize: '0.88rem', fontWeight: 800 }}
                  >
                    <span>{isHindi ? 'प्रवेश करें' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                One-Click Quick Test Credentials:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 98371 45290');
                    onSelectPortal('shop', defaultShopId, 'shop');
                  }}
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    color: '#166534',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Shop (+91 98371 45290)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 98971 20002');
                    onSelectPortal('ngo_donor', defaultNgoId, 'ngo');
                  }}
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #93c5fd',
                    color: '#1d4ed8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  NGO (+91 98971 20002)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 98971 22340');
                    onSelectPortal('ngo_donor', defaultNgoId, 'volunteer');
                  }}
                  style={{
                    background: '#fff7ed',
                    border: '1.5px solid #fed7aa',
                    color: '#c2410c',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Volunteer (+91 98971 22340)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 98971 40004');
                    onSelectPortal('admin', undefined, 'admin');
                  }}
                  style={{
                    background: '#fef3c7',
                    border: '1.5px solid #fde68a',
                    color: '#92400e',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Admin / FSSAI (+91 98971 40004)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Organization Registration Callout Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid var(--color-border)',
          boxShadow: '0 3px 0 var(--color-border)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {isHindi ? 'नई दुकान, रेस्टोरेंट अथवा एनजीओ का पंजीकरण' : 'Register a New Restaurant, Shop or NGO Partner'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                {isHindi
                  ? 'मथुरा, वृन्दावन और बरसाना में कार्यरत संस्थाएं 2 मिनट में निःशुल्क पंजीकरण करें।'
                  : 'Join the Mathura-Vrindavan surplus food recovery pilot under FSSAI regulatory standards.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="btn btn-primary"
            style={{ minHeight: '38px', fontSize: '0.84rem', padding: '0 18px', fontWeight: 800 }}
          >
            <span>{isHindi ? 'पंजीकरण फॉर्म खोलें' : 'Register Organization'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '1040px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        fontSize: '0.74rem',
        color: 'var(--color-text-muted)',
        paddingTop: '6px',
        paddingBottom: '8px'
      }}>
        Foody Loop • Smart Food Recovery &amp; Distribution Platform • Mathura - Vrindavan - Barsana Regional Pilot • FSSAI IFSA Certified
      </footer>

      <RegisterOrganizationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(role, id) => {
          setIsRegisterOpen(false);
          if (role === 'shop') {
            onSelectPortal('shop', id, 'shop');
          } else {
            onSelectPortal('ngo_donor', id, 'ngo');
          }
        }}
      />
    </div>
  );
};
