import React, { useState } from 'react';
import {
  Store,
  Building2,
  ArrowRight,
  Globe2,
  Lock,
  Phone,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  UtensilsCrossed,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import type { UserRole, Shop, Ngo } from '../../types';

interface LoginPortalProps {
  onSelectPortal: (portal: 'shop' | 'ngo_donor' | 'admin', entityId?: string, role?: UserRole) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSelectPortal }) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  // Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Role Tab: Shop or NGO
  const [signinRole, setSigninRole] = useState<'shop' | 'ngo'>('shop');
  const [signinPhone, setSigninPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [unregisteredNumber, setUnregisteredNumber] = useState<string | null>(null);

  // Sign Up Role Tab: Shop or NGO
  const [signupRole, setSignupRole] = useState<'shop' | 'ngo'>('shop');

  // Common Registration Form State
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState('Pure Veg Traditional Bhojanalaya');
  const [city, setCity] = useState<'Mathura' | 'Vrindavan' | 'Barsana'>('Vrindavan');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Handle Sign In Submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError(null);
    setUnregisteredNumber(null);

    const raw = signinPhone.trim().toLowerCase();

    // Direct access for authorized Admin ID / Phone / Email
    if (
      raw === 'admin' || 
      raw === 'admin01' || 
      raw === 'fssai_admin' || 
      raw === 'admin@foodloop.in' ||
      raw.replace(/\D/g, '') === '9999999999' ||
      raw.replace(/\D/g, '') === '8888888888'
    ) {
      onSelectPortal('admin');
      return;
    }

    const clean = signinPhone.replace(/\D/g, '');

    // Strict 10-digit mobile number validation
    if (!clean || clean.length !== 10) {
      setSigninError(isHindi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Password validation
    if (!signinPassword.trim()) {
      setSigninError(isHindi ? 'कृपया पासवर्ड या 4-अंकीय सुरक्षा पिन दर्ज करें।' : 'Please enter your password or 4-digit PIN.');
      return;
    }

    if (signinRole === 'shop') {
      // Find matching shop by last 10 digits
      const matched = state.shops.find(s => s.phone.replace(/\D/g, '').endsWith(clean));
      if (matched) {
        onSelectPortal('shop', matched.id, 'shop');
      } else {
        setSigninError(isHindi ? `मोबाइल नंबर +91 ${clean} किसी पंजीकृत दुकान से लिंक नहीं है।` : `Mobile number +91 ${clean} is not registered to any shop.`);
        setUnregisteredNumber(clean);
      }
      return;
    }

    if (signinRole === 'ngo') {
      // Find matching NGO by last 10 digits
      const matched = state.ngos.find(n => n.phone.replace(/\D/g, '').endsWith(clean));
      if (matched) {
        onSelectPortal('ngo_donor', matched.id, 'ngo');
      } else {
        setSigninError(isHindi ? `मोबाइल नंबर +91 ${clean} किसी पंजीकृत आश्रम/एनजीओ से लिंक नहीं है।` : `Mobile number +91 ${clean} is not registered to any NGO.`);
        setUnregisteredNumber(clean);
      }
      return;
    }
  };

  // Handle Sign Up / Registration Submission
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactPerson.trim() || !phone.trim()) {
      alert(isHindi ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    const sanitizedLicense = licenseNumber.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 14) ||
      (signupRole === 'shop'
        ? '12724' + Math.floor(100000000 + Math.random() * 900000000).toString()
        : 'UP2024' + Math.floor(10000000 + Math.random() * 90000000).toString());

    if (signupRole === 'shop') {
      const newShop: Shop = {
        id: 'shop-' + Date.now(),
        name: orgName.trim(),
        category: category.trim() || 'Pure Veg Traditional Bhojanalaya',
        location: address.trim() || city,
        address: address.trim() || `${city}, Uttar Pradesh`,
        city: city,
        rating: 5.0,
        reputationScore: 80,
        reputationTier: 'Under Review',
        verified: false,
        fssaiNumber: sanitizedLicense,
        phone: phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        contactPerson: contactPerson.trim(),
        lat: city === 'Mathura' ? 27.4924 : city === 'Barsana' ? 27.6475 : 27.5706,
        lng: city === 'Mathura' ? 77.6737 : city === 'Barsana' ? 77.3758 : 77.6743,
        totalDonatedMeals: 0,
        activeSurplusMeals: 0
      };

      cache.registerShop(newShop, Number(capacity) || 100);
      setSignupSuccess(newShop.name);
      setTimeout(() => {
        onSelectPortal('shop', newShop.id, 'shop');
      }, 700);
    } else if (signupRole === 'ngo') {
      const newNgo: Ngo = {
        id: 'ngo-' + Date.now(),
        name: orgName.trim(),
        category: (category.includes('Elder') || category.includes('Shelter') ? 'Shelter Management' : 'Food Recovery') as any,
        address: address.trim() || `${city}, Uttar Pradesh`,
        city: city,
        capacity: Number(capacity) || 150,
        dailyServed: 0,
        verified: false,
        contactPerson: contactPerson.trim(),
        phone: phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        lat: city === 'Mathura' ? 27.4950 : city === 'Barsana' ? 27.6500 : 27.5812,
        lng: city === 'Mathura' ? 77.6750 : city === 'Barsana' ? 77.3800 : 77.6841,
        activeVolunteers: 0
      };

      cache.registerNgo(newNgo, sanitizedLicense);
      setSignupSuccess(newNgo.name);
      setTimeout(() => {
        onSelectPortal('ngo_donor', newNgo.id, 'ngo');
      }, 700);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Top Header */}
      <header style={{
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-primary-dark)',
            boxShadow: '0 3px 0 var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-on-primary)'
          }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.4px', lineHeight: 1.1 }}>
              Foody Loop
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Smart Surplus Food Recovery Platform
            </div>
          </div>
        </div>

        <button
          onClick={() => cache.setLanguage(isHindi ? 'en' : 'hi')}
          className="btn btn-secondary"
          style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Globe2 size={14} />
          <span>{isHindi ? 'English' : 'हिन्दी'}</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main style={{
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div className="glass-panel" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '2px solid var(--color-border)',
          boxShadow: '0 4px 0 var(--color-border)',
          padding: '24px 28px',
          boxSizing: 'border-box'
        }}>
          {/* Primary Mode Tabs: Sign In vs Sign Up */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '22px'
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setSigninError(null);
              }}
              style={{
                minHeight: '40px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                backgroundColor: authMode === 'signin' ? '#ffffff' : 'transparent',
                color: authMode === 'signin' ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: authMode === 'signin' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isHindi ? 'लॉगिन (Sign In)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setSigninError(null);
              }}
              style={{
                minHeight: '40px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                backgroundColor: authMode === 'signup' ? '#ffffff' : 'transparent',
                color: authMode === 'signup' ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: authMode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isHindi ? 'नया पंजीकरण (Register)' : 'Register Organization'}
            </button>
          </div>

          {/* TAB 1: SIGN IN FORM */}
          {authMode === 'signin' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                  {isHindi ? 'अपनी भूमिका चुनें:' : 'Select Your Role to Access:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'shop', label: isHindi ? 'दुकानदार / रेस्टोरेंट' : 'Shop / Restaurant', icon: Store, activeColor: '#58cc02', darkColor: '#58a700' },
                    { id: 'ngo', label: isHindi ? 'आश्रम / एनजीओ' : 'NGO / Ashram', icon: Building2, activeColor: '#1cb0f6', darkColor: '#1899d6' }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSelected = signinRole === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSigninRole(tab.id as typeof signinRole);
                          setSigninError(null);
                          setUnregisteredNumber(null);
                          setSigninPhone('');
                        }}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${tab.darkColor}` : '2px solid #e2e8f0',
                          backgroundColor: isSelected ? tab.activeColor : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#475569',
                          boxShadow: isSelected ? `0 3px 0 ${tab.darkColor}` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Mobile / ID Input */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {isHindi ? 'पंजीकृत 10-अंकीय मोबाइल नंबर' : 'Registered 10-Digit Mobile Number'}
                  </label>

                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      borderRadius: '12px',
                      border: signinError && !signinPhone ? '2px solid #ef4444' : '2px solid var(--color-border)',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 12px',
                        backgroundColor: '#f8fafc',
                        borderRight: '2px solid var(--color-border)',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: 'var(--color-text-muted)'
                      }}>
                        <Phone size={14} />
                        <span>+91</span>
                      </div>
                      <input
                        type="text"
                        maxLength={20}
                        className="form-input"
                        style={{
                          flex: 1,
                          border: 'none',
                          borderRadius: 0,
                          height: '44px',
                          fontSize: '0.94rem',
                          letterSpacing: '1px',
                          fontWeight: 700,
                          padding: '0 12px'
                        }}
                        placeholder={
                          signinRole === 'shop'
                            ? '98371 45290'
                            : '98200 44102'
                        }
                        value={signinPhone}
                        onChange={e => {
                          const val = e.target.value;
                          if (/[a-zA-Z]/.test(val)) {
                            setSigninPhone(val.slice(0, 20));
                          } else {
                            const digits = val.replace(/\D/g, '').slice(0, 10);
                            setSigninPhone(digits);
                          }
                          setSigninError(null);
                          setUnregisteredNumber(null);
                        }}
                      />
                    </div>

                    {/* Dropdown to select from registered establishments */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                        {signinRole === 'shop'
                          ? (isHindi ? 'या पंजीकृत दुकान चुनें (त्वरित चयन):' : 'Or quick select registered shop:')
                          : (isHindi ? 'या पंजीकृत संस्था/आश्रम चुनें (त्वरित चयन):' : 'Or quick select registered NGO/Ashram:')}
                      </div>
                      <select
                        className="form-input"
                        style={{ height: '38px', fontSize: '0.8rem', backgroundColor: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                        value=""
                        onChange={e => {
                          if (e.target.value) {
                            setSigninPhone(e.target.value);
                            setSigninPassword('1234');
                            setSigninError(null);
                            setUnregisteredNumber(null);
                          }
                        }}
                      >
                        <option value="">
                          {signinRole === 'shop'
                            ? (isHindi ? '-- सूची से पंजीकृत दुकान चुनें --' : '-- Choose Registered Shop to Auto-fill --')
                            : (isHindi ? '-- सूची से पंजीकृत आश्रम चुनें --' : '-- Choose Registered NGO to Auto-fill --')}
                        </option>
                        {signinRole === 'shop' && state.shops.map(s => {
                          const raw = s.phone.replace(/\D/g, '').slice(-10);
                          return (
                            <option key={s.id} value={raw}>
                              {s.name} ({s.city}) {s.verified ? (isHindi ? '✓ [सत्यापित / Permitted]' : '✓ [Permitted]') : (isHindi ? '[समीक्षाधीन / Under Review]' : '[Under Review]')} - +91 {raw}
                            </option>
                          );
                        })}
                        {signinRole === 'ngo' && state.ngos.map(n => {
                          const raw = n.phone.replace(/\D/g, '').slice(-10);
                          return (
                            <option key={n.id} value={raw}>
                              {n.name} ({n.city}) {n.verified ? (isHindi ? '✓ [सत्यापित / Permitted]' : '✓ [Permitted]') : (isHindi ? '[समीक्षाधीन / Under Review]' : '[Under Review]')} - +91 {raw}
                            </option>
                          );
                        })}
                      </select>

                      {/* Clickable Permitted Organizations List for Direct Access */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{
                          fontSize: '0.74rem',
                          color: '#15803d',
                          fontWeight: 800,
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <CheckCircle2 size={13} color="#16a34a" />
                          <span>
                            {signinRole === 'shop'
                              ? (isHindi ? 'सत्यापित दुकानें (सीधे एक्सेस करें):' : 'Permitted Shops (Click to Access):')
                              : (isHindi ? 'सत्यापित आश्रम/संस्थाएं (सीधे एक्सेस करें):' : 'Permitted NGOs (Click to Access):')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(signinRole === 'shop'
                            ? state.shops.filter(s => s.verified)
                            : state.ngos.filter(n => n.verified)
                          ).map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                if (signinRole === 'shop') {
                                  onSelectPortal('shop', item.id, 'shop');
                                } else {
                                  onSelectPortal('ngo_donor', item.id, 'ngo');
                                }
                              }}
                              style={{
                                padding: '5px 11px',
                                borderRadius: '18px',
                                border: signinRole === 'shop' ? '1.5px solid #86efac' : '1.5px solid #93c5fd',
                                backgroundColor: signinRole === 'shop' ? '#f0fdf4' : '#eff6ff',
                                color: signinRole === 'shop' ? '#166534' : '#1e40af',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title={isHindi ? `${item.name} में सीधे प्रवेश करें` : `Enter ${item.name} directly`}
                            >
                              <CheckCircle2 size={12} color={signinRole === 'shop' ? '#16a34a' : '#2563eb'} />
                              <span>{item.name}</span>
                              <span style={{ fontSize: '0.67rem', opacity: 0.75 }}>({item.city})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password / PIN Input */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {isHindi ? 'पासवर्ड / सुरक्षा पिन' : 'Password / Security PIN'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder={isHindi ? '4-अंकीय पिन या पासवर्ड' : 'Enter 4-digit PIN or password'}
                      value={signinPassword}
                      onChange={e => {
                        setSigninPassword(e.target.value);
                        setSigninError(null);
                      }}
                      style={{ height: '44px', fontSize: '0.88rem', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {isHindi ? 'डिफ़ॉल्ट सुरक्षा पिन: 1234' : 'Default test PIN: 1234'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSigninPassword('1234')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {isHindi ? '1234 भरें' : 'Fill 1234'}
                    </button>
                  </div>
                </div>

                {/* Error Alert with 1-click Registration CTA */}
                {signinError && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={16} />
                      <span>{signinError}</span>
                    </div>
                    {unregisteredNumber && (signinRole === 'shop' || signinRole === 'ngo') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setSignupRole(signinRole === 'ngo' ? 'ngo' : 'shop');
                          setPhone(unregisteredNumber);
                          setSigninError(null);
                          setUnregisteredNumber(null);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          marginTop: '2px'
                        }}
                      >
                        {isHindi
                          ? `+91 ${unregisteredNumber} के साथ नया पंजीकरण करें →`
                          : `Register new ${signinRole === 'ngo' ? 'NGO' : 'Shop'} with +91 ${unregisteredNumber} →`}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    minHeight: '46px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '4px'
                  }}
                >
                  <span>
                    {signinRole === 'shop'
                      ? (isHindi ? 'दुकानदार डैशबोर्ड में लॉगिन करें' : 'Sign In as Shop Partner')
                      : (isHindi ? 'आश्रम/एनजीओ हब में लॉगिन करें' : 'Sign In as NGO Hub')}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {isHindi ? 'क्या आपका प्रतिष्ठान पंजीकृत नहीं है? ' : "Don't have an account yet? "}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isHindi ? 'यहाँ नया पंजीकरण करें' : 'Register Here'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATION / SIGN UP FORM */}
          {authMode === 'signup' && (
            <div>
              {signupSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    border: '2px solid #10b981',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
                    {isHindi ? 'पंजीकरण सफल!' : 'Registration Completed!'}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                    {isHindi ? `${signupSuccess} का खाता तैयार हो गया है। डैशबोर्ड खुल रहा है...` : `${signupSuccess} is registered. Launching dashboard...`}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                      {isHindi ? 'पंजीकरण प्रकार चुनें:' : 'Select Registration Category:'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { id: 'shop', label: isHindi ? 'दुकानदार / हलवाई' : 'Shop / Restaurant', icon: Store, activeColor: '#58cc02', darkColor: '#58a700' },
                        { id: 'ngo', label: isHindi ? 'आश्रम / एनजीओ' : 'NGO / Ashram', icon: Building2, activeColor: '#1cb0f6', darkColor: '#1899d6' }
                      ].map(tab => {
                        const Icon = tab.icon;
                        const isSelected = signupRole === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setSignupRole(tab.id as typeof signupRole);
                              if (tab.id === 'shop') setCategory('Pure Veg Traditional Bhojanalaya');
                              if (tab.id === 'ngo') setCategory('Food Recovery & Ashram Feeding');
                            }}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '12px',
                              border: isSelected ? `2px solid ${tab.darkColor}` : '2px solid #e2e8f0',
                              backgroundColor: isSelected ? tab.activeColor : '#f8fafc',
                              color: isSelected ? '#ffffff' : '#475569',
                              boxShadow: isSelected ? `0 3px 0 ${tab.darkColor}` : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 800
                            }}
                          >
                            <Icon size={20} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Organization Name */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        {signupRole === 'shop'
                          ? (isHindi ? 'दुकान / प्रतिष्ठान का नाम *' : 'Establishment / Shop Name *')
                          : (isHindi ? 'आश्रम / एनजीओ का नाम *' : 'Ashram / NGO Name *')}
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder={
                          signupRole === 'shop'
                            ? 'उदा. बृजवासी पेड़ा व मिष्ठान भंडार'
                            : 'उदा. श्री राधा कृपा धाम वृद्धाश्रम'
                        }
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        style={{ height: '42px', fontSize: '0.86rem' }}
                      />
                    </div>

                    {/* Category Selection (For Shop or NGO) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {signupRole === 'shop' ? 'प्रतिष्ठान श्रेणी' : 'संस्था का उद्देश्य'}
                        </label>
                        <select
                          className="form-input"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          style={{ height: '42px', fontSize: '0.82rem' }}
                        >
                          {signupRole === 'shop' ? (
                            <>
                              <option value="Pure Veg Traditional Bhojanalaya">पारंपरिक भोजनालय</option>
                              <option value="Sweets & Bakers">मिष्ठान व बेकरी</option>
                              <option value="Restaurant & Catering">रेस्टोरेंट व कैटरर्स</option>
                              <option value="Temple Prasadam Kitchen">मंदिर रसोई / अन्नक्षेत्र</option>
                            </>
                          ) : (
                            <>
                              <option value="Elder Care & Widow Shelter">वृद्ध व विधवा आश्रम</option>
                              <option value="Food Recovery & Distribution">भोजन वितरण संस्था</option>
                              <option value="Pilgrim Dharamshala">तीर्थयात्री धर्मशाला</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {signupRole === 'shop' ? 'FSSAI लाइसेंस नंबर' : 'दर्पण / ट्रस्ट रजिस्ट्रेशन'}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={signupRole === 'shop' ? '14-अंकीय FSSAI नंबर' : 'ट्रस्ट पंजीकरण संख्या'}
                          value={licenseNumber}
                          onChange={e => setLicenseNumber(e.target.value)}
                          style={{ height: '42px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    {/* City and Address */}
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {isHindi ? 'नगर' : 'City'}
                        </label>
                        <select
                          className="form-input"
                          value={city}
                          onChange={e => setCity(e.target.value as any)}
                          style={{ height: '42px', fontSize: '0.82rem' }}
                        >
                          <option value="Vrindavan">वृन्दावन</option>
                          <option value="Mathura">मथुरा</option>
                          <option value="Barsana">बरसाना</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {isHindi ? 'पता / क्षेत्र *' : 'Address / Zone *'}
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder={isHindi ? 'उदा. रमण रेती रोड, वृन्दावन' : 'e.g. Raman Reti Road, Vrindavan'}
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          style={{ height: '42px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    {/* Contact Person & Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {isHindi ? 'प्रभारी का नाम *' : 'Contact Person *'}
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="प्रभारी नाम"
                          value={contactPerson}
                          onChange={e => setContactPerson(e.target.value)}
                          style={{ height: '42px', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {isHindi ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Number (10 Digits) *'}
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'stretch',
                          borderRadius: '10px',
                          border: '2px solid var(--color-border)',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0 10px',
                            backgroundColor: '#f8fafc',
                            borderRight: '1px solid var(--color-border)',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            color: 'var(--color-text-muted)'
                          }}>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            required
                            inputMode="numeric"
                            maxLength={10}
                            className="form-input"
                            placeholder="98765 43210"
                            value={phone.replace(/^\+91\s*/, '')}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            style={{ height: '40px', fontSize: '0.84rem', border: 'none', borderRadius: 0, flex: 1, fontWeight: 700, padding: '0 10px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security PIN / Password */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        {isHindi ? 'लॉगिन पासवर्ड / सुरक्षा पिन बनाएं *' : 'Set Password / PIN *'}
                      </label>
                      <input
                        type="password"
                        required
                        className="form-input"
                        placeholder="कम से कम 4 अंक"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ height: '42px', fontSize: '0.82rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{
                        minHeight: '46px',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '4px'
                      }}
                    >
                      <span>
                        {signupRole === 'shop'
                          ? (isHindi ? 'दुकानदार खाता पंजीकृत करें' : 'Register Shop & Open Dashboard')
                          : (isHindi ? 'आश्रम/एनजीओ पंजीकृत करें' : 'Register NGO & Open Hub')}
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {isHindi ? 'पहले से पंजीकृत हैं? ' : 'Already registered? '}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {isHindi ? 'यहाँ लॉगिन करें' : 'Sign In Here'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        paddingTop: '16px'
      }}>
        Foody Loop • Smart Food Recovery &amp; Distribution Platform • Indian Regional Pilot • FSSAI IFSA Certified
      </footer>
    </div>
  );
};
