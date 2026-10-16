import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Users, 
  Bike, 
  ArrowRight,
  Sparkles,
  Heart,
  KeyRound,
  X
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { Donation } from '../../types';

export const NgoHome: React.FC = () => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const currentNgo = state.ngos.find(n => n.id === state.activeNgoId) || state.ngos[0];
  const [selectedVolunteer, setSelectedVolunteer] = useState(state.volunteers[0].id);
  const [ngoTab, setNgoTab] = useState<'available' | 'claimed'>('available');
  const [claimedModal, setClaimedModal] = useState<{
    donation: Donation;
    otp: string;
    beneficiaryName: string;
    volunteerName: string;
  } | null>(null);

  // Available donations seeking match or assigned
  const availableDonations = state.donations.filter(d => 
    d.status === 'AVAILABLE' || d.status === 'SAFETY_REVIEW'
  );

  const claimedDonations = state.donations.filter(d =>
    d.matchedNgoId === currentNgo.id || d.status === 'MATCHED' || d.status === 'COLLECTED' || d.status === 'DELIVERED'
  );

  const handleAcceptMatch = (donation: Donation) => {
    // Run smart matching
    const matches = cache.findNearbyMatches(donation);
    const topMatch = matches[0];
    const volunteer = state.volunteers.find(v => v.id === selectedVolunteer) || state.volunteers[0];
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const beneficiaryName = topMatch?.beneficiary.name || 'Radharani Widow & Elder Care Ashram';

    cache.updateDonationStatus(donation.id, 'MATCHED', {
      matchedNgoId: currentNgo.id,
      matchedNgoName: currentNgo.name,
      targetBeneficiaryId: topMatch?.beneficiary.id || 'ben-1',
      targetBeneficiaryName: beneficiaryName,
      assignedVolunteerId: volunteer.id,
      assignedVolunteerName: volunteer.name,
      distanceKm: topMatch?.distanceKm || 2.1,
      estimatedTravelTimeMin: topMatch?.estimatedTravelTimeMin || 12,
      otpCode: generatedOtp
    });

    setClaimedModal({
      donation,
      otp: generatedOtp,
      beneficiaryName,
      volunteerName: volunteer.name
    });
  };

  return (
    <div>
      {/* Application Under Review Banner (for newly registered NGOs / Ashrams) */}
      {!currentNgo?.verified && (
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
                {isHindi ? 'संस्था/आश्रम पंजीकरण सत्यापन प्रक्रियाधीन' : 'Ashram / NGO Registration Under Review'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                {isHindi
                  ? 'आपका पंजीकरण आवेदन प्राप्त हो गया है। खाद्य सुरक्षा अधिकारी द्वारा सत्यापन उपरांत स्वचालित भोजन दावा सुविधा सक्रिय होगी।'
                  : 'Your organization application is received. Live food matching and distribution allocation will activate once verified by district authority.'}
              </div>
            </div>
          </div>
          <span className="badge badge-amber" style={{ fontSize: '0.76rem', fontWeight: 800 }}>
            {isHindi ? 'समीक्षाधीन (Under Review)' : 'Under Review'}
          </span>
        </div>
      )}

      {/* NGO Header */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        backgroundColor: '#ffffff'
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
              borderRadius: '14px',
              backgroundColor: '#e5f6fd',
              border: '2px solid #1cb0f6',
              color: '#1899d6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 #1899d6'
            }}>
              <Building2 size={30} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {currentNgo.name}
                </h2>
                <span className="badge" style={{ backgroundColor: '#e5f6fd', color: '#1899d6', border: '1.5px solid #1cb0f6' }}>
                  <ShieldCheck size={14} />
                  Verified Food Recovery
                </span>
                <span className="badge badge-neutral">
                  {currentNgo.city}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <MapPin size={14} />
                <span>{currentNgo.address}</span>
                <span>•</span>
                <span>{isHindi ? 'समन्वयक:' : 'Coordinator:'} {currentNgo.contactPerson} ({currentNgo.phone})</span>
              </div>
            </div>
          </div>

          {/* Quick Volunteer Selector for Dispatch */}
          <div style={{
            backgroundColor: 'var(--color-background)',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '2px solid #e5e5e5'
          }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'पिकअप हेतु सेवादार चुनें:' : 'Pickup Volunteer Courier:'}
            </label>
            <select
              value={selectedVolunteer}
              onChange={e => setSelectedVolunteer(e.target.value)}
              className="form-select"
              style={{ minHeight: '38px', fontSize: '0.84rem', padding: '4px 8px', fontWeight: 700 }}
            >
              {state.volunteers.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vehicleType} • {v.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacity Meter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '2px solid #f1f5f9'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Daily Recovery Capacity</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {currentNgo.capacity} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>meals/day</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Distributed Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#388e00' }}>
              {currentNgo.dailyServed} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>meals served</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Volunteer Fleet</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1899d6' }}>
              {currentNgo.activeVolunteers} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>riders in Braj</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Remaining Capacity</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e07f00' }}>
              {currentNgo.capacity - currentNgo.dailyServed} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>meals open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Available Surplus Feed, Right Beneficiary Ashrams */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Live Available Surplus from Restaurants */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-indicator" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  {isHindi ? 'अतिरिक्त भोजन प्रबंधन व प्रेषण' : 'Surplus Food & Courier Dispatch Hub'}
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {isHindi ? 'मथुरा - वृन्दावन - बरसाना के पंजीकृत हलवाइयों से।' : 'Hot meals available for immediate recovery in Braj.'}
              </p>
            </div>
            <span className="badge badge-emerald">
              {ngoTab === 'available' ? availableDonations.length : claimedDonations.length} {ngoTab === 'available' ? (isHindi ? 'उपलब्ध' : 'Available') : (isHindi ? 'मार्गस्थ' : 'Claimed')}
            </span>
          </div>

          {/* Sub-tabs for NGO: Available vs Claimed Dispatches */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setNgoTab('available')}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: ngoTab === 'available' ? 800 : 700,
                backgroundColor: ngoTab === 'available' ? '#58cc02' : '#f1f5f9',
                color: ngoTab === 'available' ? '#ffffff' : 'var(--color-text)',
                border: ngoTab === 'available' ? '2px solid #58a700' : '2px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              {isHindi ? 'उपलब्ध भोजन बैच' : 'Available Batches'} ({availableDonations.length})
            </button>
            <button
              onClick={() => setNgoTab('claimed')}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: ngoTab === 'claimed' ? 800 : 700,
                backgroundColor: ngoTab === 'claimed' ? '#1cb0f6' : '#f1f5f9',
                color: ngoTab === 'claimed' ? '#ffffff' : 'var(--color-text)',
                border: ngoTab === 'claimed' ? '2px solid #1899d6' : '2px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              {isHindi ? 'दावा किए गए व मार्गस्थ' : 'Claimed & In-Transit'} ({claimedDonations.length})
            </button>
          </div>

          {ngoTab === 'claimed' ? (
            claimedDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)' }}>
                <Bike size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {isHindi ? 'फिलहाल कोई सक्रिय प्रेषण नहीं है।' : 'No active dispatches currently claimed.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {claimedDonations.map(cDon => (
                  <div
                    key={cDon.id}
                    style={{
                      background: '#ffffff',
                      border: '2px solid #1cb0f6',
                      borderBottom: '4px solid #1899d6',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                          {cDon.foodItem}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          From: <strong>{cDon.donorShopName}</strong> ({cDon.city})
                        </div>
                      </div>
                      <span className={`badge ${cDon.status === 'DELIVERED' ? 'badge-emerald' : 'badge-saffron'}`} style={{ fontSize: '0.76rem' }}>
                        {cDon.status === 'MATCHED' ? 'Courier Assigned' : cDon.status === 'COLLECTED' ? 'In Transit to Ashram' : 'Delivered'}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Assigned Courier: </span>
                        <strong>{cDon.assignedVolunteerName || 'Arun Sharma (Vrindavan Express)'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Pickup OTP: </span>
                        <strong style={{ fontFamily: 'var(--font-mono)', letterSpacing: '2px', color: '#1d4ed8' }}>{cDon.otpCode || '4928'}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={15} />
                      <span>Destination: {cDon.targetBeneficiaryName || 'Radharani Widow & Elder Care Ashram'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : availableDonations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)' }}>
              <Heart size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {isHindi ? 'फिलहाल सभी भोजन बैच वितरित हो चुके हैं।' : 'All surplus batches currently matched or delivered!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {availableDonations.map(donation => {
                const matches = cache.findNearbyMatches(donation);
                const topMatch = matches[0];
                return (
                  <div
                    key={donation.id}
                    style={{
                      background: '#ffffff',
                      border: '2px solid #58cc02',
                      borderBottom: '4px solid #58a700',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                          {donation.foodItem}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          From: <strong>{donation.donorShopName}</strong> ({donation.city})
                        </div>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                        {donation.quantity} {donation.unit}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--color-background)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#388e00" />
                        Safe until: <strong>{new Date(donation.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                      <span>Storage: {donation.storageCondition}</span>
                    </div>

                    {/* AI Smart Match recommendation */}
                    {topMatch && (
                      <div style={{
                        backgroundColor: '#e8fcd9',
                        border: '1.5px solid #a5ed6e',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#388e00',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <strong>{isHindi ? 'सर्वोत्तम मिलान आश्रम:' : 'Target Ashram:'}</strong> {topMatch.beneficiary.name}
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {topMatch.distanceKm} km • {topMatch.estimatedTravelTimeMin} min delivery travel
                          </div>
                        </div>
                        <span className="badge badge-emerald">
                          {topMatch.beneficiary.currentMealRequirement} Req
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => handleAcceptMatch(donation)}
                      className="btn btn-primary"
                      style={{ width: '100%', minHeight: '44px', fontSize: '0.9rem', justifyContent: 'center' }}
                    >
                      <CheckCircle size={18} />
                      <span>{isHindi ? 'भोजन का दावा करें व ओटीपी प्राप्त करें' : 'CLAIM FOOD & GET PICKUP OTP'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Registered Beneficiaries (Ashrams, Shelters, Communities) */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '10px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {isHindi ? 'पंजीकृत आश्रम व आश्रय स्थल' : 'Verified Beneficiary Ashrams'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Registered elder ashrams &amp; shelters in Vrindavan, Mathura &amp; Barsana.
              </p>
            </div>
            <Users size={20} color="var(--color-text-muted)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {state.beneficiaries.map(ben => (
              <div
                key={ben.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #e5e5e5',
                  borderBottom: '3px solid #d4d4d4',
                  padding: '14px',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text)' }}>
                      {ben.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {ben.address} ({ben.city})
                    </div>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                    {ben.category}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <span>Residents: <strong>{ben.residentsCount}</strong></span>
                  <span style={{ color: '#e07f00', fontWeight: 800 }}>
                    Daily Demand: {ben.currentMealRequirement} meals
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Receiving Hours: {ben.receivingHours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claimed Success Modal with Clear OTP Display */}
      {claimedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setClaimedModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e8fcd9',
              border: '2px solid #a5ed6e',
              color: '#388e00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              {isHindi ? 'भोजन का दावा सफल!' : 'Donation Batch Claimed!'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              {isHindi
                ? 'दुकानदार से भोजन प्राप्त करते समय नीचे दिया गया 4-अंकीय पिकअप ओटीपी बताएं।'
                : 'Share this 4-digit handover OTP with the shopkeeper upon arrival to release the food.'}
            </p>

            {/* OTP Display Box */}
            <div style={{
              backgroundColor: '#fff4e5',
              border: '2px solid #ffc800',
              borderBottom: '4px solid #c26900',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#c26900', fontWeight: 700, textTransform: 'uppercase' }}>
                {isHindi ? 'सुरक्षित पिकअप ओटीपी कोड:' : 'SECURE HANDOVER OTP:'}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: '#1e293b',
                letterSpacing: '6px',
                fontFamily: 'var(--font-mono)',
                margin: '8px 0'
              }}>
                {claimedModal.otp}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                Valid for shop: <strong>{claimedModal.donation.donorShopName}</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-background)',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div><strong>Item:</strong> {claimedModal.donation.foodItem} ({claimedModal.donation.quantity} {claimedModal.donation.unit})</div>
              <div><strong>Destination:</strong> {claimedModal.beneficiaryName}</div>
              <div><strong>Courier:</strong> {claimedModal.volunteerName}</div>
            </div>

            <button
              onClick={() => setClaimedModal(null)}
              className="btn btn-primary"
              style={{ width: '100%', minHeight: '46px', fontSize: '0.95rem', justifyContent: 'center' }}
            >
              <span>{isHindi ? 'समझ गया' : 'GOT IT, CONTINUE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
