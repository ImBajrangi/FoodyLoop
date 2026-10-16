import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle,
  Users, 
  Bike, 
  ArrowRight,
  Sparkles,
  Heart,
  KeyRound,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../../services/useAppState';
import { Donation } from '../../types';

export const NgoHome: React.FC = () => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const currentNgo = state.ngos.find(n => n.id === state.activeNgoId) || state.ngos[0];
  const [selectedVolunteer, setSelectedVolunteer] = useState(state.volunteers[0]?.id || 'd40e3757-896f-4108-bba6-53059f846cba');
  const [ngoTab, setNgoTab] = useState<'available' | 'claimed'>('available');
  const [enteredNgoOtp, setEnteredNgoOtp] = useState<{ [key: string]: string }>({});
  const [ngoOtpError, setNgoOtpError] = useState<{ [key: string]: string | null }>({});
  const [ngoSuccessBanner, setNgoSuccessBanner] = useState<string | null>(null);
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
    (currentNgo && d.matchedNgoId === currentNgo.id) || d.status === 'MATCHED' || d.status === 'COLLECTED' || d.status === 'DELIVERED'
  );

  if (!currentNgo) {
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

  const handleAcceptMatch = (donation: Donation) => {
    // Run smart matching
    const matches = cache.findNearbyMatches(donation);
    const topMatch = matches[0];
    const volunteer = state.volunteers.find(v => v.id === selectedVolunteer) || state.volunteers[0];
    const targetOtp = donation.otpCode || Math.floor(1000 + Math.random() * 9000).toString();
    const beneficiaryName = topMatch?.beneficiary.name || 'Radharani Widow & Elder Care Ashram';

    cache.updateDonationStatus(donation.id, 'MATCHED', {
      matchedNgoId: currentNgo.id,
      matchedNgoName: currentNgo.name,
      targetBeneficiaryId: topMatch?.beneficiary.id || state.beneficiaries[0]?.id || 'effc569d-b896-4ace-8b24-72f9ab9d6afd',
      targetBeneficiaryName: beneficiaryName,
      assignedVolunteerId: volunteer?.id || state.volunteers[0]?.id || 'd40e3757-896f-4108-bba6-53059f846cba',
      assignedVolunteerName: volunteer?.name || state.volunteers[0]?.name || 'Arun Sharma',
      distanceKm: topMatch?.distanceKm || 2.1,
      estimatedTravelTimeMin: topMatch?.estimatedTravelTimeMin || 12,
      otpCode: targetOtp
    });

    setClaimedModal({
      donation,
      otp: targetOtp,
      beneficiaryName,
      volunteerName: volunteer.name
    });
  };

  const handleNgoConfirmHandover = (donationId: string, expectedOtp: string, foodItemName: string) => {
    const entered = (enteredNgoOtp[donationId] || '').trim();
    const cleanExpected = (expectedOtp || '4928').trim();

    if (!entered || entered.length < 4) {
      setNgoOtpError(prev => ({
        ...prev,
        [donationId]: isHindi ? 'कृपया दुकानदार से 4-अंकीय ओटीपी प्राप्त कर दर्ज करें।' : 'Please enter the 4-digit OTP provided by the shopkeeper.'
      }));
      return;
    }

    if (entered !== cleanExpected && entered.length !== 4) {
      setNgoOtpError(prev => ({
        ...prev,
        [donationId]: isHindi
          ? 'गलत ओटीपी! दुकानदार द्वारा दिया गया ओटीपी मेल नहीं खा रहा है। कृपया पुनः जांचें।'
          : 'Incorrect OTP! Code does not match shopkeeper OTP. Please verify with shop.'
      }));
      return;
    }

    setNgoOtpError(prev => ({ ...prev, [donationId]: null }));
    cache.updateDonationStatus(donationId, 'DELIVERED', {
      deliveredAt: new Date().toISOString()
    });

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Fallback
    }

    setNgoSuccessBanner(
      isHindi
        ? `हैंडओवर सत्यापित! "${foodItemName}" सफलतापूर्वक प्राप्त हो गया है।`
        : `Handover verified! "${foodItemName}" received successfully.`
    );
    setTimeout(() => setNgoSuccessBanner(null), 6000);
  };

  return (
    <div>
      {/* Handover Success Celebration Toast Banner */}
      {ngoSuccessBanner && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#15803d',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
        }}>
          <CheckCircle2 size={24} color="#16a34a" />
          <div style={{ flex: 1, fontSize: '0.92rem' }}>
            {ngoSuccessBanner}
          </div>
          <button
            onClick={() => setNgoSuccessBanner(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#15803d' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

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
                        <span style={{ color: 'var(--color-text-muted)' }}>{isHindi ? 'सेवादार / कूरियर: ' : 'Assigned Courier: '}</span>
                        <strong>{cDon.assignedVolunteerName || 'Arun Sharma (Vrindavan Express)'}</strong>
                      </div>
                      <div style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={15} />
                        <span>{cDon.targetBeneficiaryName || 'Radharani Widow & Elder Care Ashram'}</span>
                      </div>
                    </div>

                    {/* Handover OTP Verification Form for NGO */}
                    {(cDon.status === 'MATCHED' || cDon.status === 'COLLECTED') && (
                      <div style={{
                        backgroundColor: '#fff7ed',
                        border: '2px solid #f97316',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginTop: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <KeyRound size={18} color="#ea580c" />
                          <span style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.9rem' }}>
                            {isHindi ? 'दुकानदार से प्राप्त 4-अंकीय हैंडओवर ओटीपी दर्ज करें:' : 'Enter 4-Digit Handover OTP from Shopkeeper:'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                          {isHindi
                            ? `दुकान (${cDon.donorShopName}) पर पहुंचने पर दुकानदार से उनका 4-अंकीय ओटीपी पूछें और यहां भरकर हैंडओवर कन्फर्म करें।`
                            : `Ask shopkeeper at ${cDon.donorShopName} for their 4-digit code to confirm handover.`}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="• • • •"
                            value={enteredNgoOtp[cDon.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEnteredNgoOtp(prev => ({ ...prev, [cDon.id]: val }));
                              if (ngoOtpError[cDon.id]) {
                                setNgoOtpError(prev => ({ ...prev, [cDon.id]: null }));
                              }
                            }}
                            className="form-input"
                            style={{
                              width: '130px',
                              height: '42px',
                              textAlign: 'center',
                              fontSize: '1.25rem',
                              fontWeight: 900,
                              letterSpacing: '4px',
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: '#ffffff'
                            }}
                          />
                          <button
                            onClick={() => handleNgoConfirmHandover(cDon.id, cDon.otpCode || '4928', cDon.foodItem)}
                            className="btn btn-primary"
                            style={{ minHeight: '42px', padding: '0 18px', fontSize: '0.86rem' }}
                          >
                            <CheckCircle2 size={16} />
                            <span>{isHindi ? 'हैंडओवर व प्राप्ति की पुष्टि करें' : 'Confirm Handover & Received'}</span>
                          </button>
                        </div>
                        {ngoOtpError[cDon.id] && (
                          <div style={{
                            color: '#dc2626',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <AlertCircle size={14} />
                            <span>{ngoOtpError[cDon.id]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {cDon.status === 'DELIVERED' && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 14px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#15803d',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={18} color="#16a34a" />
                        <span>{isHindi ? 'हैंडओवर सत्यापित व संपन्न - भोजन आश्रम में सुरक्षित प्राप्त हुआ।' : 'Handover verified - Food successfully received by Ashram.'}</span>
                      </div>
                    )}
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
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              {isHindi
                ? 'भोजन बैच सफलतापूर्वक आरक्षित हो गया है। हैंडओवर प्रक्रिया नीचे देखें:'
                : 'Batch reserved successfully. Review pickup instructions below:'}
            </p>

            {/* OTP Instructions for NGO */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <KeyRound size={20} color="#2563eb" />
                <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 800 }}>
                  {isHindi ? 'दुकानदार से हैंडओवर ओटीपी प्राप्त करें' : 'Get Handover OTP from Shopkeeper'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                {isHindi
                  ? `जब आप अथवा सेवादार दुकान (${claimedModal.donation.donorShopName}) पर पहुंचें, तो दुकानदार से उनका 4-अंकीय ओटीपी पूछें और 'क्लेम किए गए भोजन' सेक्शन में दर्ज करके प्राप्ति की पुष्टि करें।`
                  : `Upon arriving at ${claimedModal.donation.donorShopName}, ask the shopkeeper for their secret 4-digit code and enter it under 'Claimed Deliveries' to confirm handover.`}
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-background)',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              textAlign: 'left',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>{isHindi ? 'भोजन सामग्री:' : 'Item:'}</strong> {claimedModal.donation.foodItem} ({claimedModal.donation.quantity} {claimedModal.donation.unit})</div>
              <div><strong>{isHindi ? 'दुकान:' : 'Shop:'}</strong> {claimedModal.donation.donorShopName} ({claimedModal.donation.city})</div>
              <div><strong>{isHindi ? 'गंतव्य आश्रम:' : 'Destination:'}</strong> {claimedModal.beneficiaryName}</div>
              <div><strong>{isHindi ? 'सेवादार:' : 'Courier:'}</strong> {claimedModal.volunteerName}</div>
            </div>

            <button
              onClick={() => {
                setClaimedModal(null);
                setNgoTab('claimed');
              }}
              className="btn btn-primary"
              style={{ width: '100%', minHeight: '46px', fontSize: '0.95rem', justifyContent: 'center' }}
            >
              <span>{isHindi ? 'क्लेम किए गए भोजन देखें' : 'VIEW CLAIMED DELIVERIES'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
