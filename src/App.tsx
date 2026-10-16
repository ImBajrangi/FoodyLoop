import { useState } from 'react';
import { useAppState } from './services/useAppState';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/Auth/LoginPortal';
import { ShopHome } from './components/ShopDashboard/ShopHome';
import { NgoHome } from './components/NgoDashboard/NgoHome';
import { DeliveryView } from './components/VolunteerDashboard/DeliveryView';
import { BirthdaySponsorship } from './components/DonorDashboard/BirthdaySponsorship';
import { AdminControlRoom } from './components/AdminDashboard/AdminControlRoom';
import { QuickDonateModal } from './components/ShopDashboard/QuickDonateModal';
import { ImpactCertificateModal } from './components/common/ImpactCertificateModal';
import type { Sponsorship } from './types';
import { Heart, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function App() {
  const { state, cache } = useAppState();

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Sponsorship | null>(null);
  const [showAdminView, setShowAdminView] = useState(false);

  if (!state.portal) {
    return (
      <LoginPortal
        onSelectPortal={(portal, id, role) => {
          cache.setPortal(portal, id, role);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      {/* Top Navbar tailored to selected portal */}
      <Navbar onOpenDonate={() => setIsDonateOpen(true)} />

      {/* Main Container Content */}
      <main className="container" style={{ flex: 1, padding: '24px 16px' }}>
        {showAdminView ? (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-emerald">Central Command Room</span>
              <button
                onClick={() => setShowAdminView(false)}
                className="btn btn-secondary"
                style={{ minHeight: '38px', fontSize: '0.82rem' }}
              >
                Back to {state.portal === 'shop' ? 'Shop Dashboard' : 'Donor / NGO App'}
              </button>
            </div>
            <AdminControlRoom />
          </div>
        ) : (
          <>
            {/* PORTAL 1: SHOP DASHBOARD */}
            {state.portal === 'shop' && (
              <ShopHome onOpenDonate={() => setIsDonateOpen(true)} />
            )}

            {/* PORTAL 2: DONOR / NGO APP */}
            {state.portal === 'ngo_donor' && (
              <>
                {state.role === 'ngo' && <NgoHome />}
                {state.role === 'donor' && (
                  <BirthdaySponsorship
                    onViewCertificate={(spon) => setSelectedCertificate(spon)}
                  />
                )}
                {state.role === 'volunteer' && <DeliveryView />}
              </>
            )}

            {/* PORTAL 3: ADMIN & REGULATORY DESK */}
            {state.portal === 'admin' && (
              <AdminControlRoom />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <QuickDonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      <ImpactCertificateModal
        sponsorship={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* Clean Streamlined Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '2px solid #e5e5e5',
        padding: '20px 0',
        marginTop: '40px',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>
              Foody Loop - Smart Food Redistribution Platform
            </div>
            <div style={{ fontSize: '0.74rem' }}>
              Regional Pilot • In alignment with FSSAI IFSA guidelines
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#388e00', fontWeight: 700 }}>
              <ShieldCheck size={14} /> FSSAI Partner
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9600', fontWeight: 700 }}>
              <Heart size={14} /> Zero Hunger
            </span>
            <span>•</span>
            <button
              onClick={() => setShowAdminView(!showAdminView)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                minHeight: 'auto',
                minWidth: 'auto'
              }}
            >
              {showAdminView ? 'Close Command Room' : 'Command Room (Admin)'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
