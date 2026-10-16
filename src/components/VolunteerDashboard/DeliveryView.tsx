import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Thermometer, 
  ShieldCheck, 
  Clock, 
  KeyRound,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../../services/useAppState';
import { Donation } from '../../types';

export const DeliveryView: React.FC = () => {
  const { state, cache } = useAppState();

  const currentVolunteer = state.volunteers[0]; // Arun Sharma
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Active assignment for Arun Sharma
  const activeJob = state.donations.find(d => 
    (d.assignedVolunteerId === currentVolunteer.id || d.status === 'MATCHED' || d.status === 'COLLECTED') &&
    d.status !== 'DELIVERED'
  );

  const handleConfirmPickup = (donation: Donation) => {
    cache.updateDonationStatus(donation.id, 'COLLECTED', {
      collectedAt: new Date().toISOString()
    });
    alert('Pickup confirmed! Hot-held temperature & container integrity recorded in audit trail.');
  };

  const handleVerifyDelivery = (donation: Donation) => {
    const val = enteredOtp.trim();
    const primaryCode = '8392';
    const fallbackCode = (donation.otpCode || '4928').trim();

    if (val === primaryCode || val === fallbackCode) {
      setOtpError(false);
      cache.updateDonationStatus(donation.id, 'DELIVERED', {
        deliveredAt: new Date().toISOString()
      });
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {
        // fallback
      }
      alert('Handover complete! Verified with Ashram supervisor Swami Haridas. +5 reputation awarded to donor shop.');
    } else {
      setOtpError(true);
    }
  };

  return (
    <div>
      {/* Volunteer Rider Header */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #ffffff, #fcfbf8)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
            }}>
              <Bike size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b' }}>
                  {currentVolunteer.name}
                </h2>
                <span className="badge badge-emerald">
                  Status: {currentVolunteer.currentStatus}
                </span>
                <span className="badge badge-neutral">
                  ⭐ {currentVolunteer.rating} ({currentVolunteer.completedDeliveries} Deliveries)
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fleet Asset: <strong>{currentVolunteer.vehicleType}</strong> • Operating Corridor: {currentVolunteer.city} (Vrindavan - Chattikara)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="tel:+919897122340" className="btn btn-secondary" style={{ fontSize: '0.82rem', minHeight: '38px' }}>
              <PhoneCall size={14} />
              <span>Contact Dispatch</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Job or Idle State */}
      {activeJob ? (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
          {/* Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={20} color="var(--saffron-600)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Active Transit Mission: {activeJob.id}
              </h3>
            </div>
            <span className={`badge ${activeJob.status === 'COLLECTED' ? 'badge-emerald' : 'badge-saffron'}`}>
              Stage: {activeJob.status === 'COLLECTED' ? 'En Route to Ashram' : 'Proceeding to Pickup'}
            </span>
          </div>

          {/* Route Map Simulation / Milestone Visualizer */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {/* Pickup Point */}
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--saffron-500)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                  boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'
                }}>
                  <MapPin size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{activeJob.donorShopName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pickup: Raman Reti</div>
              </div>

              {/* Transit Line */}
              <div style={{
                flex: 1,
                height: '4px',
                background: activeJob.status === 'COLLECTED' ? 'var(--emerald-500)' : '#cbd5e1',
                margin: '0 12px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)'
                }}>
                  {activeJob.distanceKm || 2.1} km (~12 min)
                </div>
              </div>

              {/* Delivery Point */}
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: activeJob.status === 'COLLECTED' ? 'var(--emerald-600)' : '#94a3b8',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px'
                }}>
                  <CheckCircle2 size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  {activeJob.targetBeneficiaryName || 'Radharani Ashram'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Drop: Vrindavan Ashram</div>
              </div>
            </div>
          </div>

          {/* Item details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Food Consignment:</span>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                  {activeJob.foodItem} ({activeJob.quantity} {activeJob.unit})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Packaging &amp; Storage:</span>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  Insulated thermal dabba ({activeJob.storageCondition})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Safe Delivery Deadline:</span>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--emerald-700)' }}>
                  {new Date(activeJob.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Step 1: Physical Pickup at Donor Restaurant */}
          {activeJob.status !== 'COLLECTED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Courier Pickup Verification Pass */}
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '2px solid #f59e0b',
                borderBottom: '4px solid #d97706',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309'
                  }}>
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pickup Handover OTP Pass
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#78350f', marginTop: '2px' }}>
                      Tell this 4-digit code to <strong>{activeJob.donorShopName}</strong> staff upon arrival to release food:
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '6px',
                  fontFamily: 'var(--font-mono)',
                  color: '#1e293b',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {activeJob.otpCode || '4928'}
                </div>
              </div>

              {/* Safety Inspection Checklist */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e5e5e5',
                borderBottom: '3px solid #d4d4d4',
                padding: '16px',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#b45309', fontWeight: 800 }}>
                  <Thermometer size={18} />
                  <span>Pickup Safety Inspection Checklist</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                  Verify temperature &gt;65°C and ensure stainless steel container lids are clamped tight before departure.
                </p>
                <button
                  onClick={() => handleConfirmPickup(activeJob)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Confirm Safety Inspection &amp; Start Transit</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Step 2: Handover at Ashram with Receiving Verification */}
          {activeJob.status === 'COLLECTED' && (
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #22c55e',
              borderBottom: '4px solid #16a34a',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800 }}>
                  <KeyRound size={20} />
                  <span>Ashram Beneficiary Handover Verification</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  Supervisor: Swami Haridas (Care Incharge)
                </span>
              </div>
              
              <p style={{ fontSize: '0.8rem', color: '#15803d', marginBottom: '16px' }}>
                Ask Ashram Caretaker Swami Haridas for the 4-digit receiving confirmation code to log delivery:
              </p>

              <div style={{ display: 'flex', gap: '10px', maxWidth: '420px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={e => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ''));
                    if (otpError) setOtpError(false);
                  }}
                  className="form-input"
                  style={{
                    width: '130px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.3rem',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 900
                  }}
                />
                <button
                  onClick={() => handleVerifyDelivery(activeJob)}
                  className="btn btn-success"
                  style={{ flexShrink: 0 }}
                >
                  <Sparkles size={16} />
                  <span>Verify &amp; Complete Handover</span>
                </button>
              </div>

              {/* Quick Supervisor Code Helper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Supervisor Receiving Token:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEnteredOtp('8392');
                    setOtpError(false);
                  }}
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#166534',
                    cursor: 'pointer'
                  }}
                >
                  Tap to Auto-fill Incharge Code: 8392
                </button>
              </div>

              {otpError && (
                <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '8px' }}>
                  Invalid receiving code. Please enter the 4-digit code provided by Swami Haridas (8392).
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--emerald-500)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            All Assigned Deliveries Complete!
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 16px' }}>
            Rider Arun Sharma is currently on standby in the Vrindavan Raman Reti zone. 
            New surplus offers will ping automatically as restaurants report them.
          </p>
          <button 
            onClick={() => cache.setDemoStep(1)} 
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Launch Step 1 in Demo Runner
          </button>
        </div>
      )}
    </div>
  );
};
