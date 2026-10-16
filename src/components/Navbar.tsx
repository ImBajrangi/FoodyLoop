import React from 'react';
import {
  UtensilsCrossed,
  Store,
  Building2,
  Bike,
  HeartHandshake,
  Globe2,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAppState } from '../services/useAppState';

interface NavbarProps {
  onOpenDonate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const currentShop = state.shops.find(s => s.id === state.activeShopId) || state.shops[0];
  const currentNgo = state.ngos.find(n => n.id === state.activeNgoId) || state.ngos[0];

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '3px solid #e5e5e5',
      borderRadius: 0,
      padding: '10px 0',
      backgroundColor: '#ffffff'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo & Current Active Portal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => cache.logout()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: state.portal === 'shop' ? 'var(--color-primary)' : 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: state.portal === 'shop' ? 'var(--color-on-primary)' : '#ffffff',
              border: state.portal === 'shop' ? '2px solid var(--color-primary-dark)' : '2px solid var(--color-accent-dark)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            title={isHindi ? 'पोर्टल बदलें' : 'Switch Portal'}
          >
            <UtensilsCrossed size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.8px' }}>
                Foody Loop
              </span>

              {/* Portal Badge */}
              {state.portal === 'shop' ? (
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  <Store size={14} />
                  {isHindi ? 'दुकानदार डैशबोर्ड' : 'SHOP DASHBOARD'}
                </span>
              ) : state.portal === 'admin' ? (
                <span className="badge" style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  border: '1.5px solid #f59e0b'
                }}>
                  <ShieldCheck size={14} />
                  {isHindi ? 'खाद्य सुरक्षा अधिकारी व एडमिन' : 'REGULATOR & ADMIN DESK'}
                </span>
              ) : (
                <span className="badge" style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#e5f6fd',
                  color: '#1899d6',
                  border: '1.5px solid #1cb0f6'
                }}>
                  <HeartHandshake size={14} />
                  {isHindi ? 'एनजीओ / अन्नदाता ऐप' : 'DONOR / NGO APP'}
                </span>
              )}

              {/* Live Database Sync Indicator */}
              <span className="badge" style={{
                fontSize: '0.68rem',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1.5px solid #86efac',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px'
              }} title="Supabase PostgreSQL Live Synchronized">
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: state.isSyncing ? '#f59e0b' : '#22c55e',
                  display: 'inline-block'
                }} />
                {state.isSyncing 
                  ? (isHindi ? 'डेटाबेस सिंक...' : 'Syncing...') 
                  : (isHindi ? 'लाइव डेटाबेस' : 'Live DB Synced')}
              </span>
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>
                {state.portal === 'shop' 
                  ? `${currentShop?.name || 'Shop'} (${currentShop?.city || 'Vrindavan'})` 
                  : state.portal === 'admin'
                  ? (isHindi ? 'मथुरा जिला खाद्य सुरक्षा व विनियामक प्राधिकरण' : 'Mathura District Food Safety & Regulatory Authority')
                  : `${currentNgo?.name || 'NGO'} (${currentNgo?.city || 'Vrindavan'})`}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Simplified Category Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {state.portal === 'ngo_donor' && (
            <div style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: 'var(--color-background)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid #e5e5e5'
            }}>
              <button
                onClick={() => cache.setRole('ngo')}
                style={{
                  minHeight: '38px',
                  padding: '0 14px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  fontWeight: state.role === 'ngo' ? 800 : 600,
                  backgroundColor: state.role === 'ngo' ? '#ffffff' : 'transparent',
                  color: state.role === 'ngo' ? 'var(--color-accent-dark)' : 'var(--color-text)',
                  border: state.role === 'ngo' ? '2px solid var(--color-accent)' : 'none',
                  boxShadow: state.role === 'ngo' ? '0 2px 0 #1899d6' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Building2 size={16} />
                <span>{isHindi ? 'अन्न सेवा (Claim Food)' : 'Claim Food'}</span>
              </button>

              <button
                onClick={() => cache.setRole('donor')}
                style={{
                  minHeight: '38px',
                  padding: '0 14px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  fontWeight: state.role === 'donor' ? 800 : 600,
                  backgroundColor: state.role === 'donor' ? '#ffffff' : 'transparent',
                  color: state.role === 'donor' ? '#e07f00' : 'var(--color-text)',
                  border: state.role === 'donor' ? '2px solid #ff9600' : 'none',
                  boxShadow: state.role === 'donor' ? '0 2px 0 #c26900' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <HeartHandshake size={16} />
                <span>{isHindi ? 'दान' : 'Sponsor'}</span>
              </button>

              <button
                onClick={() => cache.setRole('volunteer')}
                style={{
                  minHeight: '38px',
                  padding: '0 14px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  fontWeight: state.role === 'volunteer' ? 800 : 600,
                  backgroundColor: state.role === 'volunteer' ? '#ffffff' : 'transparent',
                  color: state.role === 'volunteer' ? '#388e00' : 'var(--color-text)',
                  border: state.role === 'volunteer' ? '2px solid #58cc02' : 'none',
                  boxShadow: state.role === 'volunteer' ? '0 2px 0 #58a700' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Bike size={16} />
                <span>{isHindi ? 'डिलीवरी (Volunteer)' : 'Volunteer Courier'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Language toggle & Change Portal button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => cache.setLanguage(isHindi ? 'en' : 'hi')}
            className="btn btn-secondary"
            style={{ minHeight: '40px', padding: '0 12px', fontSize: '0.82rem' }}
            title="Switch Language"
          >
            <Globe2 size={16} />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Change Portal / Logout Button */}
          <button
            onClick={() => cache.logout()}
            className="btn btn-secondary"
            style={{
              minHeight: '40px',
              padding: '0 12px',
              fontSize: '0.82rem',
              color: '#ff4b4b',
              borderColor: '#ffc1c1'
            }}
            title={isHindi ? 'पोर्टल बदलें / लॉगआउट' : 'Change Portal / Logout'}
          >
            <LogOut size={15} />
            <span>{isHindi ? 'पोर्टल बदलें' : 'Change Portal'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
