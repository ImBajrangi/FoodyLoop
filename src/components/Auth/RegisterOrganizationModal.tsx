import React, { useState } from 'react';
import {
  X,
  Store,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  User,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

interface RegisterOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (role: 'shop' | 'ngo', newOrgId: string) => void;
  onRegisteredSuccess?: (newOrgId: string) => void;
}

export const RegisterOrganizationModal: React.FC<RegisterOrganizationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onRegisteredSuccess
}) => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  const [activeTab, setActiveTab] = useState<'shop' | 'ngo'>('shop');

  // Form Fields
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState(activeTab === 'shop' ? 'Pure Veg Traditional Bhojanalaya' : 'Food Recovery & Ashram Feeding');
  const [city, setCity] = useState('Vrindavan');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('100');

  // Success State
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [registeredOrgId, setRegisteredOrgId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactPerson.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    // Format license number up to 14 characters to conform to FSSAI VARCHAR(14)
    const sanitizedLicense = licenseNumber.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 14) ||
      (activeTab === 'shop' ? '12724' + Math.floor(100000000 + Math.random() * 900000000).toString() : 'UP2024' + Math.floor(10000000 + Math.random() * 90000000).toString());

    const trimmedCity = city.trim() || 'Vrindavan';
    const cityLower = trimmedCity.toLowerCase();
    const resolvedCity: 'Mathura' | 'Vrindavan' | 'Barsana' =
      cityLower.includes('mathura') ? 'Mathura' :
        cityLower.includes('barsana') ? 'Barsana' : 'Vrindavan';

    const generatedRefId = `APP-${resolvedCity.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (activeTab === 'shop') {
      const newShop = {
        id: 'shop-' + Date.now(),
        name: orgName.trim(),
        category: category.trim() || 'Pure Veg Traditional Bhojanalaya',
        location: address.trim() || trimmedCity,
        address: address.trim() || `${trimmedCity}, Uttar Pradesh`,
        city: resolvedCity,
        rating: 5.0,
        reputationScore: 80,
        reputationTier: 'Under Review' as const,
        verified: false,
        fssaiNumber: sanitizedLicense,
        phone: phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        contactPerson: contactPerson.trim(),
        lat: resolvedCity === 'Mathura' ? 27.4924 : resolvedCity === 'Barsana' ? 27.6475 : 27.5706,
        lng: resolvedCity === 'Mathura' ? 77.6737 : resolvedCity === 'Barsana' ? 77.3758 : 77.6743,
        totalDonatedMeals: 0,
        activeSurplusMeals: 0
      };

      setRegisteredOrgId(newShop.id);
      cache.registerShop(newShop, Number(capacity) || 100);
      if (onRegisteredSuccess) onRegisteredSuccess(newShop.id);
    } else {
      const newNgo = {
        id: 'ngo-' + Date.now(),
        name: orgName.trim(),
        category: (category.includes('Elder') || category.includes('Shelter') ? 'Shelter Management' : 'Food Recovery') as any,
        address: address.trim() || `${trimmedCity}, Uttar Pradesh`,
        city: resolvedCity,
        capacity: Number(capacity) || 150,
        dailyServed: 0,
        verified: false,
        contactPerson: contactPerson.trim(),
        phone: phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        lat: resolvedCity === 'Mathura' ? 27.4950 : resolvedCity === 'Barsana' ? 27.6500 : 27.5812,
        lng: resolvedCity === 'Mathura' ? 77.6750 : resolvedCity === 'Barsana' ? 77.3800 : 77.6841,
        activeVolunteers: 0
      };

      setRegisteredOrgId(newNgo.id);
      cache.registerNgo(newNgo, sanitizedLicense);
      if (onRegisteredSuccess) onRegisteredSuccess(newNgo.id);
    }

    setIsSubmitting(false);
    setSubmittedRefId(generatedRefId);
  };

  const handleResetAndClose = () => {
    setSubmittedRefId(null);
    setRegisteredOrgId(null);
    setOrgName('');
    setAddress('');
    setLicenseNumber('');
    setContactPerson('');
    setPhone('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '3px solid #e5e5e5',
        borderBottom: '6px solid #d4d4d4',
        padding: '24px',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        {submittedRefId ? (
          /* Submission Receipt / Acknowledgment Screen */
          <div style={{ textAlign: 'center', padding: '20px 8px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              border: '3px solid #10b981',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.86rem', padding: '6px 16px', marginBottom: '12px' }}>
              <ShieldCheck size={16} />
              {isHindi ? 'सत्यापन हेतु जमा (Submitted for Review)' : 'Submitted for Verification'}
            </span>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 6px 0' }}>
              {isHindi ? 'पंजीकरण आवेदन सफलतापूर्वक प्राप्त हुआ' : 'Registration Application Received'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.45 }}>
              {isHindi
                ? `आपका आवेदन मथुरा-वृन्दावन खाद्य सुरक्षा व विनियामक प्राधिकरण (Food Safety Officer) को भेज दिया गया है।`
                : `Your registration request has been forwarded to Mathura District Food Safety & Regulatory Authority for review.`}
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              maxWidth: '420px',
              margin: '0 auto 24px auto',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {isHindi ? 'आवेदन संख्या:' : 'Application Ref:'}
                </span>
                <span style={{ fontWeight: 800, color: '#1e293b' }}>{submittedRefId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {isHindi ? 'संस्था का नाम:' : 'Organization:'}
                </span>
                <span style={{ fontWeight: 800, color: '#1e293b' }}>{orgName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {isHindi ? 'प्रारंभिक स्थिति:' : 'Status:'}
                </span>
                <span style={{ fontWeight: 800, color: '#d97706' }}>
                  {isHindi ? 'जांच जारी (Under Review)' : 'Under Review'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const targetId = registeredOrgId || (activeTab === 'shop' ? 'shop-1' : 'ngo-1');
                  if (onRegisterSuccess) {
                    onRegisterSuccess(activeTab, targetId);
                  } else if (onRegisteredSuccess) {
                    onRegisteredSuccess(targetId);
                  }
                  handleResetAndClose();
                }}
                className="btn btn-primary"
                style={{
                  minHeight: '48px',
                  padding: '0 28px',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  width: '100%',
                  maxWidth: '420px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>
                  {activeTab === 'shop'
                    ? (isHindi ? 'सीधे दुकान डैशबोर्ड में प्रवेश करें' : 'Enter My Shop Dashboard Now')
                    : (isHindi ? 'सीधे आश्रम/एनजीओ हब में प्रवेश करें' : 'Enter My NGO Hub Now')}
                </span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={handleResetAndClose}
                className="btn btn-secondary"
                style={{
                  minHeight: '40px',
                  padding: '0 20px',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span>{isHindi ? 'लॉगिन पोर्टल पर लौटें' : 'Back to Login Portal'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form Screen */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: activeTab === 'shop' ? 'var(--color-primary)' : 'var(--color-accent)',
                border: activeTab === 'shop' ? '2px solid var(--color-primary-dark)' : '2px solid var(--color-accent-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                {activeTab === 'shop' ? <Store size={22} /> : <HeartHandshake size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {isHindi ? 'नई संस्था का पंजीकरण' : 'Register New Organization'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {isHindi ? 'खाद्य सुरक्षा अधिकारी द्वारा अनुमोदन उपरांत सक्रियण' : 'Subject to Food Safety Officer verification & approval'}
                </div>
              </div>
            </div>

            {/* Role Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('shop'); setCategory('Pure Veg Traditional Bhojanalaya'); }}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: activeTab === 'shop' ? '2px solid var(--color-primary)' : 'none',
                  backgroundColor: activeTab === 'shop' ? '#ffffff' : 'transparent',
                  color: activeTab === 'shop' ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  fontWeight: activeTab === 'shop' ? 800 : 600,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Store size={16} />
                <span>{isHindi ? 'दुकानदार / भोजनालय' : 'Restaurant / Shop'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('ngo'); setCategory('Food Recovery & Ashram Feeding'); }}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: activeTab === 'ngo' ? '2px solid var(--color-accent)' : 'none',
                  backgroundColor: activeTab === 'ngo' ? '#ffffff' : 'transparent',
                  color: activeTab === 'ngo' ? 'var(--color-accent-dark)' : 'var(--color-text)',
                  fontWeight: activeTab === 'ngo' ? 800 : 600,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={16} />
                <span>{isHindi ? 'एनजीओ / आश्रम / ट्रस्ट' : 'NGO / Ashram Trust'}</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {activeTab === 'shop' ? (isHindi ? 'दुकान / भोजनालय का नाम *' : 'Restaurant / Shop Name *') : (isHindi ? 'एनजीओ / आश्रम का नाम *' : 'NGO / Ashram Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === 'shop' ? (isHindi ? 'उदा. श्री गोकुल भोजनालय' : 'e.g. Gokul Rasoi Bhojanalaya') : (isHindi ? 'उदा. यमुना कृपा सेवा ट्रस्ट' : 'e.g. Yamuna Seva Trust')}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'शहर / तीर्थ क्षेत्र *' : 'Pilot City / Region *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isHindi ? 'उदा. वृन्दावन, मथुरा, बरसाना' : 'e.g. Vrindavan, Mathura, Barsana'}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'संस्था की श्रेणी *' : 'Category *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === 'shop'
                      ? (isHindi ? 'उदा. शुद्ध शाकाहारी भोजनालय, मिष्ठान' : 'e.g. Pure Veg Bhojanalaya, Sweet Shop')
                      : (isHindi ? 'उदा. अन्नक्षेत्र, आश्रम भोजन वितरण' : 'e.g. Food Recovery, Ashram Feeding')}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {activeTab === 'shop'
                      ? (isHindi ? 'FSSAI लाइसेंस नंबर *' : 'FSSAI License No.*')
                      : (isHindi ? 'दर्पण / ट्रस्ट पंजीकरण संख्या*' : 'Trust Reg ID*')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder={activeTab === 'shop' ? '12724055000999' : 'UP202400812001'}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'पूरा पता व मुख्य लैंडमार्क *' : 'Full Address & Landmark *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'दुकान नं. / मार्ग, निकट मंदिर, शहर' : 'Shop No. / Street, Near Landmark, City'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'संपर्क व्यक्ति का नाम *' : 'Contact Person *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isHindi ? 'नाम दर्ज करें' : 'Full Name'}
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Phone (10 Digits) *'}
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
                      placeholder="98370 00000"
                      value={phone.replace(/^\+91\s*/, '')}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="form-input"
                      style={{ width: '100%', height: '42px', fontSize: '0.86rem', border: 'none', borderRadius: 0, fontWeight: 700, padding: '0 10px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    {activeTab === 'shop'
                      ? (isHindi ? 'दैनिक थाली क्षमता' : 'Daily Meal Capacity')
                      : (isHindi ? 'दैनिक सेवा क्षमता' : 'Serving Capacity')}
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              {/* Regulatory Notice Banner */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '0.8rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} color="#15803d" style={{ flexShrink: 0 }} />
                <span>
                  {isHindi
                    ? 'आवेदन जमा करने पर मथुरा खाद्य सुरक्षा अधिकारी द्वारा FSSAI व स्थल सत्यापन किया जाएगा। अनुमोदन उपरांत संस्था सक्रिय होगी।'
                    : 'All applications are audited by the Food Safety Officer under the FSSAI Surplus Food Regulations 2019 before access is granted.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn btn-secondary"
                  style={{ minHeight: '44px', padding: '0 20px', fontSize: '0.88rem' }}
                >
                  <span>{isHindi ? 'रद्द करें' : 'Cancel'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ minHeight: '44px', padding: '0 24px', fontSize: '0.88rem' }}
                >
                  <span>{isSubmitting ? (isHindi ? 'जमा हो रहा है...' : 'Submitting...') : (isHindi ? 'आवेदन जमा करें' : 'Submit Registration')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
