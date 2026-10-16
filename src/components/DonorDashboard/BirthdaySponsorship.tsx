import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Gift, 
  CheckCircle2, 
  Download,
  Info,
  Award,
  User,
  Phone,
  Heart,
  ShieldCheck,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../../services/useAppState';
import { Sponsorship } from '../../types';

interface BirthdaySponsorshipProps {
  onViewCertificate: (sponsorship: Sponsorship) => void;
}

export const BirthdaySponsorship: React.FC<BirthdaySponsorshipProps> = ({ onViewCertificate }) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const [sponsorName, setSponsorName] = useState('Gaurav & Pooja Bansal');
  const [phone, setPhone] = useState('+91 98112 33451');
  const [occasion, setOccasion] = useState('Birthday Celebration');
  const [honoreeName, setHonoreeName] = useState('Keshav Bansal (Age 7)');
  const [preferredDate, setPreferredDate] = useState('2026-10-25');
  const [preferredCity, setPreferredCity] = useState<'Mathura' | 'Vrindavan' | 'Barsana'>('Vrindavan');
  const [mealsCount, setMealsCount] = useState<number>(300);
  const [beneficiaryTarget, setBeneficiaryTarget] = useState('ben-1');
  const [dedicationMessage, setDedicationMessage] = useState(
    'On the auspicious 7th birthday of Keshav. May Lord Krishna grant him health and compassion.'
  );

  const costPerMeal = 40; // ₹40/meal for pure sattvik nutritious meal
  const totalBudget = mealsCount * costPerMeal;

  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSponsorship, setLastSponsorship] = useState<Sponsorship | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetBen = state.beneficiaries.find(b => b.id === beneficiaryTarget) || state.beneficiaries[0];

    const newSpon: Sponsorship = {
      id: `SPON-${Date.now().toString().slice(-4)}`,
      sponsorName,
      phone,
      occasion,
      honoreeName,
      preferredDate,
      preferredCity,
      mealsSponsored: Number(mealsCount),
      budgetInr: totalBudget,
      beneficiaryLocationId: targetBen.id,
      beneficiaryLocationName: targetBen.name,
      status: 'Paid & Allocated',
      dedicationMessage,
      certificateId: `CERT-FL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };

    cache.addSponsorship(newSpon);
    setLastSponsorship(newSpon);
    setIsSuccess(true);

    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {
      // fallback
    }
  };

  const mealPresets = [
    {
      count: 100,
      labelEn: 'Small Ashram Seva',
      labelHi: 'छोटा आश्रम सेवा',
      popular: false
    },
    {
      count: 200,
      labelEn: 'Widows & Elders Care',
      labelHi: 'वृद्धा व माता आश्रम',
      popular: false
    },
    {
      count: 300,
      labelEn: 'Full Community Bhandara',
      labelHi: 'पूर्ण सामुदायिक भंडारा',
      popular: true
    },
    {
      count: 500,
      labelEn: 'Grand Pilgrim Seva',
      labelHi: 'विशाल परिक्रमा सेवा',
      popular: false
    }
  ];

  const occasionOptions = [
    { id: 'Birthday Celebration', labelEn: 'Birthday Celebration', labelHi: 'जन्मदिन उत्सव' },
    { id: 'Wedding Anniversary', labelEn: 'Wedding Anniversary', labelHi: 'वैवाहिक वर्षगांठ' },
    { id: 'Punya Tithi / In Loving Memory', labelEn: 'In Loving Memory', labelHi: 'पावन पुण्यतिथि' },
    { id: 'Thanksgiving / Shukrana', labelEn: 'Thanksgiving / Shukrana', labelHi: 'शुकराना व कृतज्ञता' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #ffffff 100%)',
        border: '2px solid #fed7aa',
        borderBottom: '5px solid #f97316',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 #c2410c',
              flexShrink: 0
            }}>
              <Gift size={28} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                {isHindi ? 'पवित्र भंडारा व ताजा अन्नदान संकल्प' : 'Sponsor Fresh Meals for Sacred Community Bhandara'}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                {isHindi
                  ? 'जन्मदिन, पुण्यतिथि या वर्षगांठ पर वृन्दावन-मथुरा के आश्रमों में वृद्ध संतों व माताओं के लिए ताजा सात्विक भोजन समर्पित करें।'
                  : 'Dedicate freshly prepared Sattvik meals to registered Ashrams in Vrindavan, Mathura and Barsana on special life milestones.'}
              </p>
            </div>
          </div>

          {/* Value Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              color: '#065f46',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              <ShieldCheck size={14} color="#059669" />
              100% Tax Deductible (80G)
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              color: '#1e40af',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              <Award size={14} color="#2563eb" />
              Honor Certificate
            </span>
          </div>
        </div>

        {/* Informational Context Strip */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #fed7aa',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          color: '#7c2d12'
        }}>
          <Info size={18} color="#ea580c" style={{ flexShrink: 0 }} />
          <span>
            <strong>{isHindi ? 'सेवा नियम:' : 'Fresh Cooking Note:'}</strong>{' '}
            {isHindi
              ? 'अतिरिक्त भोजन बचाव (Surplus Rescue) पूरी तरह निःशुल्क होता है। यह प्रायोजन (Sponsorship) आपके संकल्प पर प्रमाणित सामुदायिक रसोई द्वारा ₹40/थाली की शुद्ध लागत पर ताजा बनाया जाता है।'
              : 'Surplus food rescue is zero-cost redistribution. Sponsored meals are cooked 100% fresh on your chosen date by certified kitchens at direct raw-material cost (₹40 per full meal).'}
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && lastSponsorship && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderBottom: '4px solid #22c55e',
          borderRadius: '16px',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          animation: 'fadeIn 300ms ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#14532d' }}>
                {isHindi ? 'अन्नदान संकल्प सफलतापूर्वक पंजीकृत हुआ!' : 'Meal Sponsorship Successfully Authorized!'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
                {lastSponsorship.mealsSponsored} {isHindi ? 'ताजा थालियां' : 'meals allocated for'} {lastSponsorship.beneficiaryLocationName} • Certificate #{lastSponsorship.certificateId}
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewCertificate(lastSponsorship)}
            className="btn btn-primary"
            style={{ minHeight: '40px', fontSize: '0.84rem' }}
          >
            <Award size={16} />
            <span>{isHindi ? 'प्रमाण पत्र देखें' : 'View Honor Certificate'}</span>
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left Column: Form Card */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderBottom: '5px solid #cbd5e1',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2px solid #f1f5f9' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              border: '1.5px solid #fdba74',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                {isHindi ? 'अन्नदान सेवा विवरण' : 'Sponsor a Meal Distribution'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                {isHindi ? 'शुभ अवसर चुनें और थालियों की संख्या निर्धारित करें' : 'Select auspicious occasion and choose portion volume'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Step 1: Occasion Pill Selector */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                {isHindi ? '1. पावन अवसर चुनें (Occasion Type):' : '1. Select Auspicious Occasion:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {occasionOptions.map(occ => {
                  const isSelected = occasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: isSelected ? '#fff7ed' : '#f8fafc',
                        color: isSelected ? '#c2410c' : '#475569',
                        border: isSelected ? '2px solid #f97316' : '1.5px solid #e2e8f0',
                        boxShadow: isSelected ? '0 3px 0 #ea580c' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isHindi ? occ.labelHi : occ.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Donor & Honoree Details */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                {isHindi ? '2. यजमान व नामांकित व्यक्ति (Donor & Honoree):' : '2. Donor & Honoree Information:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>{isHindi ? 'यजमान / परिवार का नाम' : 'Donor / Family Name'}</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Ramesh & Sunita Sharma"
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} />
                    <span>{isHindi ? 'संपर्क मोबाइल' : 'Contact Phone'}</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={12} />
                    <span>{isHindi ? 'किसके नाम पर सेवा समर्पित है (Honoree Name / Relation)' : 'Honoree Name (Whose occasion is being celebrated)'}</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={honoreeName}
                    onChange={e => setHonoreeName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Aarav Sharma (Birthday) or Late Shri..."
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Date & Region */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  <span>{isHindi ? 'प्रायोजन तिथि' : 'Preferred Date'}</span>
                </div>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} />
                  <span>{isHindi ? 'ब्रज क्षेत्र' : 'Region in Braj'}</span>
                </div>
                <select
                  value={preferredCity}
                  onChange={e => setPreferredCity(e.target.value as typeof preferredCity)}
                  className="form-select"
                >
                  <option value="Vrindavan">Vrindavan (Prem Mandir / Parikrama)</option>
                  <option value="Mathura">Mathura (Yamuna Ghat Shelters)</option>
                  <option value="Barsana">Barsana (Radha Rani Marg)</option>
                </select>
              </div>
            </div>

            {/* Step 4: Meal Volume Presets (Rich 4-Card Selector) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? '3. थालियों की संख्या चुनें (Meals to Sponsor):' : '3. Choose Meal Volume (₹40 per full meal):'}
                </label>
                <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 800 }}>
                  {mealsCount} {isHindi ? 'थाली चयनित' : 'Selected'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {mealPresets.map(preset => {
                  const isSelected = mealsCount === preset.count;
                  const price = preset.count * costPerMeal;

                  return (
                    <div
                      key={preset.count}
                      onClick={() => setMealsCount(preset.count)}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                        border: isSelected ? '2px solid #f97316' : '1.5px solid #e2e8f0',
                        borderBottom: isSelected ? '4px solid #ea580c' : '3px solid #cbd5e1',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {preset.popular && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '10px',
                          backgroundColor: '#f97316',
                          color: '#ffffff',
                          fontSize: '0.66rem',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          textTransform: 'uppercase'
                        }}>
                          {isHindi ? 'लोकप्रिय' : 'Popular'}
                        </span>
                      )}

                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: isSelected ? '#c2410c' : '#1e293b' }}>
                        {preset.count} {isHindi ? 'थालियां' : 'Meals'}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                        {isHindi ? preset.labelHi : preset.labelEn}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Target Beneficiary Ashram */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? '4. लक्षित पंजीकृत आश्रम / आश्रय स्थल:' : '4. Target Verified Ashram / Shelter:'}
              </label>
              <select
                value={beneficiaryTarget}
                onChange={e => setBeneficiaryTarget(e.target.value)}
                className="form-select"
              >
                {state.beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city} • {isHindi ? `क्षमता: ${b.residentsCount} निवासी` : `Capacity: ${b.residentsCount} residents`})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 6: Dedication Message */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? '5. समर्पण व आशीर्वाद संदेश (Banner & Certificate):' : '5. Dedication Message (Printed on Certificate):'}
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  {dedicationMessage.length}/140
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={140}
                value={dedicationMessage}
                onChange={e => setDedicationMessage(e.target.value)}
                className="form-input"
                style={{ resize: 'none', height: 'auto', padding: '10px 12px' }}
                placeholder="e.g. In holy remembrance of... or With Radha Rani's divine blessings..."
              />
            </div>

            {/* Live Investment Summary Strip */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '16px',
              borderRadius: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                  {isHindi ? 'अनुमानित सेवा योगदान (Pure Raw Cost):' : 'Total Seva Contribution (Pure Raw Cost):'}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ea580c' }}>
                  ₹{totalBudget.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                    ({mealsCount} × ₹40)
                  </span>
                </div>
              </div>

              <span style={{
                backgroundColor: '#dcfce7',
                border: '1.5px solid #86efac',
                color: '#15803d',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 900
              }}>
                {mealsCount} {isHindi ? 'सात्विक थालियां सुनिश्चित' : 'Servings Guaranteed'}
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                minHeight: '48px',
                fontSize: '0.96rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <HeartHandshake size={20} />
              <span>
                {isHindi
                  ? `अन्नदान संकल्प स्वीकृत करें (₹${totalBudget.toLocaleString('en-IN')})`
                  : `Pledge & Authorize Food Distribution (₹${totalBudget.toLocaleString('en-IN')})`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Active & Completed Sponsorship Cards */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderBottom: '5px solid #cbd5e1',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? 'सामुदायिक सेवादार संकल्प' : 'Community Sponsorships & Certificates'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                  {isHindi ? 'हाल ही में किए गए अन्नदान व डिजिटल सम्मान प्रमाण पत्र' : 'Recent community pledges and verified honor certificates'}
                </p>
              </div>
            </div>

            <span style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              {state.sponsorships.length} {isHindi ? 'संकल्प' : 'Pledges'}
            </span>
          </div>

          {/* List of Sponsorship Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {state.sponsorships.map(sp => (
              <div
                key={sp.id}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderBottom: '4px solid #cbd5e1',
                  padding: '18px',
                  borderRadius: '16px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Top Row: Honoree & Meal Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#fff7ed',
                      color: '#c2410c',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      marginBottom: '4px',
                      border: '1px solid #fed7aa'
                    }}>
                      {sp.occasion}
                    </span>
                    <h4 style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                      {sp.honoreeName}
                    </h4>
                  </div>

                  <span style={{
                    backgroundColor: '#dcfce7',
                    border: '1.5px solid #86efac',
                    color: '#15803d',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 900
                  }}>
                    {sp.mealsSponsored} {isHindi ? 'थालियां' : 'Meals'} (₹{sp.budgetInr.toLocaleString('en-IN')})
                  </span>
                </div>

                {/* Donor & Location Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  <User size={12} />
                  <span>{isHindi ? 'यजमान:' : 'Donor:'} <strong>{sp.sponsorName}</strong></span>
                  <span>•</span>
                  <MapPin size={12} />
                  <span>{sp.preferredCity}</span>
                </div>

                {/* Styled Quote Box */}
                <div style={{
                  backgroundColor: '#fffdfa',
                  border: '1px solid #fed7aa',
                  borderLeft: '4px solid #f97316',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#7c2d12',
                  fontStyle: 'italic',
                  marginBottom: '14px',
                  lineHeight: '1.45'
                }}>
                  "{sp.dedicationMessage}"
                </div>

                {/* Beneficiary & Action Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1.5px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                    <Building2 size={14} color="#ea580c" />
                    <span>
                      {isHindi ? 'आश्रम:' : 'Beneficiary:'}{' '}
                      <strong style={{ color: '#0f172a' }}>{sp.beneficiaryLocationName}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onViewCertificate(sp)}
                    className="btn btn-secondary"
                    style={{
                      minHeight: '34px',
                      padding: '0 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={14} />
                    <span>{isHindi ? 'प्रमाण पत्र देखें' : 'View Certificate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
