import React from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../services/useAppState';
import { Donation } from '../types';

export const HackathonDemoBanner: React.FC = () => {
  const { state, cache } = useAppState();
  const currentStep = state.demoStep;

  const demoSteps = [
    {
      step: 1,
      title: 'Shop Surplus Declaration',
      hindiTitle: 'दुकानदार द्वारा 30 थाली सरप्लस घोषणा',
      role: 'shop' as const,
      desc: 'Krishna Bhojanalaya declares 30 fresh Dal Rice & Poori meals available at Raman Reti, Vrindavan.'
    },
    {
      step: 2,
      title: 'FSSAI Safety & Window Verification',
      hindiTitle: 'FSSAI खाद्य सुरक्षा एवं विंडो सत्यापन',
      role: 'shop' as const,
      desc: 'System calculates 5-hour safe window (safe till 16:30). Temperature 68°C and food-grade packaging validated.'
    },
    {
      step: 3,
      title: 'Geospatial Smart Matching',
      hindiTitle: 'जियोस्पेशियल स्मार्ट मिलान',
      role: 'ngo' as const,
      desc: 'System matches with Radharani Widow & Elder Care Ashram (2.1 km away, requires 100 meals, preference match 96%).'
    },
    {
      step: 4,
      title: 'NGO Acceptance & Dispatch',
      hindiTitle: 'एनजीओ द्वारा स्वीकार एवं राइडर असाइन',
      role: 'ngo' as const,
      desc: 'Braj Seva Foundation accepts donation. Volunteer Arun Sharma dispatched with thermal e-scooter.'
    },
    {
      step: 5,
      title: 'Pickup Inspection & Delivery Handover',
      hindiTitle: 'पिकअप निरीक्षण एवं ओटीपी सुपुर्दगी',
      role: 'volunteer' as const,
      desc: 'Volunteer presents pickup OTP #4928 to donor shop, collects food, and completes verified handover at Ashram.'
    },
    {
      step: 6,
      title: 'Shop Analytics & Reputation Bonus',
      hindiTitle: 'दुकानदार प्रतिष्ठा स्कोर वृद्धि (+5)',
      role: 'shop' as const,
      desc: 'Krishna Bhojanalaya reputation reaches 100 (Trusted Partner). Surplus rate updated in analytics.'
    },
    {
      step: 7,
      title: 'AI Demand & Surplus Forecasting',
      hindiTitle: 'एआई मांग पूर्वानुमान एवं उत्पादन परामर्श',
      role: 'shop' as const,
      desc: 'Model forecasts 140-165 plates for Saturday pilgrimage rush. Recommends preparing 152 plates.'
    }
  ];

  const handleNextStep = () => {
    const next = currentStep >= 7 ? 1 : currentStep + 1;
    executeStep(next);
  };

  const executeStep = (stepNumber: number) => {
    cache.setDemoStep(stepNumber);

    if (stepNumber === 1) {
      cache.setRole('shop');
      // Create new active demo donation if not already created
      const existing = state.donations.find(d => d.id === 'DEMO-DONATION-1');
      if (!existing) {
        const demoDonation: Donation = {
          id: 'DEMO-DONATION-1',
          donorShopId: 'ff22da9a-2623-4387-af37-6a8bb50bb19f',
          donorShopName: "Govinda's Restaurant & Bhojanalaya",
          city: 'Vrindavan',
          foodItem: 'Pure Sattvik Dal Rice & Fresh Poori Sabzi',
          foodCategory: 'Cooked Meals',
          quantity: 30,
          unit: 'meals',
          preparedAt: new Date(Date.now() - 45 * 60000).toISOString(),
          readyAt: new Date(Date.now() - 15 * 60000).toISOString(),
          safeUntil: new Date(Date.now() + 4 * 3600000).toISOString(),
          storageCondition: 'hot_held',
          packagingStatus: 'Thermal insulated stainless steel containers, sealed with safety tag',
          handlingInstructions: 'Keep warm (>65°C), do not expose to direct dust or moisture.',
          allergenNotice: 'Pure vegetarian sattvik (No onion, no garlic). Contains ghee.',
          status: 'AVAILABLE',
          fssaiChecklist: {
            preparedFresh: true,
            hygieneDeclaration: true,
            cleanPackaging: true,
            temperatureVerified: true,
            withinWindow: true
          },
          createdAt: new Date().toISOString()
        };
        cache.addDonation(demoDonation);
      }
    } else if (stepNumber === 2) {
      cache.setRole('shop');
      cache.updateDonationStatus('DEMO-DONATION-1', 'SAFETY_REVIEW');
    } else if (stepNumber === 3) {
      cache.setRole('ngo');
      cache.updateDonationStatus('DEMO-DONATION-1', 'AVAILABLE', {
        matchedNgoId: '09afa3ca-3498-4446-96f0-5b566ebdeb53',
        matchedNgoName: 'Braj Seva Foundation',
        targetBeneficiaryId: 'effc569d-b896-4ace-8b24-72f9ab9d6afd',
        targetBeneficiaryName: 'Radharani Widow & Elder Care Ashram',
        distanceKm: 2.1,
        estimatedTravelTimeMin: 12
      });
    } else if (stepNumber === 4) {
      cache.setRole('ngo');
      cache.updateDonationStatus('DEMO-DONATION-1', 'MATCHED', {
        assignedVolunteerId: 'd40e3757-896f-4108-bba6-53059f846cba',
        assignedVolunteerName: 'Arun Sharma',
        otpCode: '4928'
      });
    } else if (stepNumber === 5) {
      cache.setRole('volunteer');
      cache.updateDonationStatus('DEMO-DONATION-1', 'COLLECTED');
    } else if (stepNumber === 6) {
      cache.setRole('shop');
      cache.updateDonationStatus('DEMO-DONATION-1', 'DELIVERED');
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // fallback
      }
    } else if (stepNumber === 7) {
      cache.setRole('shop');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      color: 'white',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '12px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(249, 115, 22, 0.2)',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            color: '#fb923c',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <Sparkles size={16} />
            <span>HACKATHON LIVE DEMO</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {currentStep === 0 
                  ? '7-Step End-to-End Presentation Workflow' 
                  : `Step ${currentStep} of 7: ${demoSteps[currentStep - 1].title}`}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {currentStep === 0 
                ? 'Follow Krishna Bhojanalaya (30 meals) → Safety → Smart Match → Braj Seva NGO → Delivery → AI Forecast'
                : demoSteps[currentStep - 1].desc}
            </p>
          </div>
        </div>

        {/* Step dots & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {demoSteps.map(s => {
              const isActive = currentStep === s.step;
              const isPast = currentStep > s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => executeStep(s.step)}
                  title={`Step ${s.step}: ${s.title}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    minHeight: '28px',
                    padding: 0,
                    borderRadius: '50%',
                    background: isActive 
                      ? '#f97316' 
                      : isPast 
                      ? '#10b981' 
                      : 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isPast ? <CheckCircle2 size={14} /> : s.step}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNextStep}
            className="btn btn-primary"
            style={{
              minHeight: '36px',
              padding: '0 14px',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #f97316, #ea580c)'
            }}
          >
            {currentStep === 0 ? (
              <>
                <Play size={15} />
                <span>Start Live Demo</span>
              </>
            ) : currentStep === 7 ? (
              <>
                <RotateCcw size={15} />
                <span>Restart Demo</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => cache.setDemoStep(0)}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '4px 8px'
              }}
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
