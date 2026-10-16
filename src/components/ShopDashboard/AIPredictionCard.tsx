import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Compass,
  Clock,
  TrendingUp,
  Flame
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import type { DemandForecast } from '../../types';

interface RollingDayConfig {
  dateStr: string;
  dayIndex: number;
  dayName: string;
  dayNameHi: string;
  displayDayName: string;
  dateNumber: number;
  monthName: string;
  shortLabelEn: string;
  shortLabelHi: string;
  fullLabelEn: string;
  fullLabelHi: string;
  multiplier: number;
  rushHi: string;
  rushEn: string;
  eventHi: string;
  eventEn: string;
  kitchenAdviceHi: string;
  kitchenAdviceEn: string;
  isToday: boolean;
  isTomorrow: boolean;
}

export const AIPredictionCard: React.FC = () => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';

  // Dynamically compute the 7 rolling calendar days starting from current local date
  const rollingDays: RollingDayConfig[] = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const dayShortEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayShortHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

    const multipliers: Record<string, {
      mult: number;
      rushHi: string;
      rushEn: string;
      eventHi: string;
      eventEn: string;
      adviceHi: string;
      adviceEn: string;
    }> = {
      'Monday': {
        mult: 1.10,
        rushHi: '+10% सोमवारी दर्शन व शिव मंदिर प्रवाह',
        rushEn: '+10% Somwar Darshan Footfall',
        eventHi: 'सोमवार विशेष दर्शन',
        eventEn: 'Monday Temple Flow',
        adviceHi: 'सोमवार सुबह 11:30 बजे मुख्य बैच शुरू करें। दाल-चावल की सामान्य मांग रहेगी।',
        adviceEn: 'Start main batch at 11:30 AM. Steady lunch footfall expected for Dal Rice thalis.'
      },
      'Tuesday': {
        mult: 1.15,
        rushHi: '+15% मंगला आरती व हनुमान मंदिर भीड़',
        rushEn: '+15% Mangal Aarti & Temple Crowd',
        eventHi: 'मंगलवार नियमित प्रवाह',
        eventEn: 'Tuesday Regular Aarti',
        adviceHi: 'मंगलवार दोपहर बाद बूंदी व पूरी-सब्जी की मांग बढ़ती है। शाम 4 बजे छोटा अतिरिक्त बैच रखें।',
        adviceEn: 'Afternoon Prasad demand rises post 4 PM. Keep a lean reserve of Poori Sabzi.'
      },
      'Wednesday': {
        mult: 1.25,
        rushHi: '+25% व्रत, फलाहार व खिचड़ी मांग',
        rushEn: '+25% Vrat Prasad Demand',
        eventHi: 'बुधवार व्रत व सेवा विशेष',
        eventEn: 'Wednesday Vrat Flow',
        adviceHi: 'बुधवार को खिचड़ी व फलाहारी भोजन की मांग अधिक रहती है। भारी ग्रेवी आइटम सीमित रखें।',
        adviceEn: 'High demand for light Sattvik meals and Khichdi. Keep heavy gravies calibrated.'
      },
      'Thursday': {
        mult: 1.20,
        rushHi: '+20% आश्रम भंडारा व साधु सेवा मांग',
        rushEn: '+20% Ashram Bhandara Demand',
        eventHi: 'गुरुवार सत्संग प्रवाह',
        eventEn: 'Thursday Satsang Flow',
        adviceHi: 'गुरुवार दोपहर आश्रम दर्शनार्थियों का प्रवाह अधिक रहेगा। 1 बजे का बैच तैयार रखें।',
        adviceEn: 'Ashram pilgrims peak between 12:30 PM to 2:00 PM. Optimize midday roti preparation.'
      },
      'Friday': {
        mult: 1.25,
        rushHi: '+25% बांके बिहारी वीकेंड पूर्व भीड़',
        rushEn: '+25% Weekend Eve Rush',
        eventHi: 'शुक्रवार संध्या आरती',
        eventEn: 'Friday Weekend Eve',
        adviceHi: 'शुक्रवार शाम से दिल्ली-एनसीआर से आने वाले तीर्थयात्री बढ़ने लगते हैं। शाम का बैच 20% बड़ा रखें।',
        adviceEn: 'Incoming pilgrims arrive starting Friday evening. Increase dinner preparation batch by 20%.'
      },
      'Saturday': {
        mult: 1.35,
        rushHi: '+35% भारी वृन्दावन परिक्रमा भीड़',
        rushEn: '+35% Pilgrim Parikrama Surge',
        eventHi: 'शनिवार परिक्रमा मेला',
        eventEn: 'Saturday Parikrama Surge',
        adviceHi: 'शनिवार दोपहर 1 से 3 बजे के बीच परिक्रमा मार्ग पर भारी भीड़ रहेगी। दाल-चावल व पूरी की मांग सबसे अधिक रहेगी।',
        adviceEn: 'Heavy parikrama traffic between 1:00 PM to 3:30 PM. Focus on high-throughput Poori Sabzi.'
      },
      'Sunday': {
        mult: 1.45,
        rushHi: '+45% चरम मंदिर दर्शन व तीर्थयात्री भीड़',
        rushEn: '+45% Peak Weekend Darshan Crowds',
        eventHi: 'रविवार महा-आरती दर्शन',
        eventEn: 'Sunday Maha Aarti Rush',
        adviceHi: 'रविवार पूरे दिन बांके बिहारी व प्रेम मंदिर दर्शनार्थियों की अधिकतम भीड़ रहेगी। नियमित अंतराल पर ताजा बैच बनाएं।',
        adviceEn: 'Peak footfall across Mathura-Vrindavan all day. Stagger production into 3 fresh batches to avoid spoilage.'
      }
    };

    const today = new Date();
    const days: RollingDayConfig[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayOfWeekIdx = d.getDay();
      const dayName = dayNames[dayOfWeekIdx];
      const dayNameHi = dayNamesHi[dayOfWeekIdx];
      const dateNumber = d.getDate();
      const monthName = d.toLocaleString('en-US', { month: 'short' });

      const config = multipliers[dayName] || {
        mult: 1.0,
        rushHi: 'सामान्य ग्राहक',
        rushEn: 'Regular footfall',
        eventHi: 'दैनिक प्रवाह',
        eventEn: 'Daily Flow',
        adviceHi: 'मांग संतुलित रहेगी। सुबह 11:30 बजे मुख्य बैच शुरू करें।',
        adviceEn: 'Demand is balanced. Standard batch preparation recommended.'
      };

      const isToday = i === 0;
      const isTomorrow = i === 1;

      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayIndex: i,
        dayName,
        dayNameHi,
        displayDayName: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayName,
        dateNumber,
        monthName,
        shortLabelEn: isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : `${dayShortEn[dayOfWeekIdx]} ${dateNumber}`,
        shortLabelHi: isToday ? 'आज' : isTomorrow ? 'कल' : `${dayShortHi[dayOfWeekIdx]} ${dateNumber}`,
        fullLabelEn: isToday 
          ? `Today (${dayName}, ${dateNumber} ${monthName})` 
          : isTomorrow 
          ? `Tomorrow (${dayName}, ${dateNumber} ${monthName})`
          : `${dayName}, ${dateNumber} ${monthName}`,
        fullLabelHi: isToday 
          ? `आज (${dayNameHi}, ${dateNumber} ${monthName})` 
          : isTomorrow 
          ? `कल (${dayNameHi}, ${dateNumber} ${monthName})`
          : `${dayNameHi}, ${dateNumber} ${monthName}`,
        multiplier: config.mult,
        rushHi: config.rushHi,
        rushEn: config.rushEn,
        eventHi: config.eventHi,
        eventEn: config.eventEn,
        kitchenAdviceHi: config.adviceHi,
        kitchenAdviceEn: config.adviceEn,
        isToday,
        isTomorrow
      });
    }

    return days;
  }, []);

  // Default to Tomorrow (dayIndex = 1) for proactive kitchen preparation planning
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);

  const activeDay = rollingDays[selectedDayIndex] || rollingDays[1] || rollingDays[0];

  const forecast: DemandForecast = useMemo(() => {
    return cache.calculateDynamicDemandForecast(activeDay.dayName, activeDay.multiplier);
  }, [cache, activeDay]);

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '2px solid #e5e5e5',
      borderBottom: '4px solid #d4d4d4',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#e5f6fd',
              border: '2px solid #1cb0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1899d6',
              boxShadow: '0 3px 0 #1899d6'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                {isHindi ? 'दैनिक गतिशील थाली पूर्वानुमान (Daily AI Kitchen Prep)' : 'Daily Dynamic Kitchen Batch Forecast'}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                • {isHindi ? 'मथुरा-वृन्दावन 7-दिवसीय कैलेंडर से लाइव कनेक्टेड' : 'Live 7-Day Braj Pilgrim Calendar Connected'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {isHindi
              ? 'प्रत्येक दिन के अनुसार मंदिर उत्सव, परिक्रमा व भक्तों की भीड़ का सटीक गतिशील आकलन।'
              : 'Dynamic daily meal batch prediction calibrated to rolling footfall trends and pilgrimage rushes.'}
          </p>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #93c5fd',
          color: '#1d4ed8',
          padding: '8px 16px',
          borderRadius: '14px',
          fontSize: '0.86rem',
          fontWeight: 800,
          boxShadow: '0 3px 0 #60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Clock size={16} />
          <span>{activeDay.dateStr}</span>
        </div>
      </div>

      {/* Dynamic 7-Day Rolling Selector Pills */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {isHindi ? 'दिन चुनें (7-दिवसीय गतिशील शेड्यूल):' : 'Select Day for Demand Projection (Rolling 7 Days):'}
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            {isHindi ? 'सक्रिय चयन: ' : 'Selected: '}{isHindi ? activeDay.fullLabelHi : activeDay.fullLabelEn}
          </span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
          gap: '8px' 
        }}>
          {rollingDays.map((day) => {
            const isSelected = day.dayIndex === selectedDayIndex;
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  backgroundColor: isSelected ? '#1cb0f6' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--color-text)',
                  border: isSelected ? '2px solid #1cb0f6' : '2px solid #e2e8f0',
                  borderBottom: isSelected ? '4px solid #1899d6' : '4px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>{isHindi ? day.shortLabelHi : day.shortLabelEn}</span>
                </div>
                <div style={{ 
                  fontSize: '0.70rem', 
                  opacity: isSelected ? 0.95 : 0.7,
                  fontWeight: 600
                }}>
                  {day.multiplier > 1.2 ? `+${Math.round((day.multiplier - 1) * 100)}%` : 'Base'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Dynamic Forecast Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        border: '2px solid #86efac',
        borderBottom: '5px solid #22c55e',
        borderRadius: '16px',
        padding: '22px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.82rem', padding: '4px 12px' }}>
                <Users size={14} />
                {isHindi ? activeDay.rushHi : activeDay.rushEn}
              </span>
              <span style={{
                fontSize: '0.78rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                color: '#475569'
              }}>
                {isHindi ? activeDay.eventHi : activeDay.eventEn}
              </span>
            </div>

            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
              {activeDay.isToday 
                ? (isHindi ? 'आज के लिए अनुशंसित थाली उत्पादन:' : 'Recommended Kitchen Batch for Today:')
                : activeDay.isTomorrow
                ? (isHindi ? 'कल के लिए अनुशंसित थाली उत्पादन:' : 'Recommended Kitchen Batch for Tomorrow:')
                : (isHindi ? `${activeDay.dayNameHi} (${activeDay.dateNumber} ${activeDay.monthName}) के लिए अनुशंसित उत्पादन:` : `Recommended Batch for ${activeDay.dayName} (${activeDay.dateNumber} ${activeDay.monthName}):`)}
            </h4>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803d', lineHeight: 1 }}>
              {forecast.suggestedPreparation}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 800, marginTop: '4px' }}>
              {isHindi ? `अनुमानित सीमा: ${forecast.expectedDemandLow} - ${forecast.expectedDemandHigh} थालियां` : `Range: ${forecast.expectedDemandLow} - ${forecast.expectedDemandHigh} plates`}
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #bbf7d0'
        }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'स्टॉक खत्म होने का जोखिम' : 'Stockout Risk'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {isHindi ? 'अत्यंत कम (सुरक्षित)' : 'Very Low (Safe)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'अतिरिक्त बचने का अनुमान' : 'Expected Surplus'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c2410c', marginTop: '2px' }}>
              ~{forecast.predictedSurplus} {isHindi ? 'थालियां' : 'plates'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? 'पूर्वानुमान सटीकता' : 'Forecast Confidence'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>
              {forecast.confidenceScore}% {isHindi ? 'सटीक' : 'Confidence'}
            </div>
          </div>
        </div>

        {/* Actionable Advice Banner */}
        <div style={{
          marginTop: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.86rem',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={18} color="#16a34a" style={{ flexShrink: 0 }} />
          <span>
            <strong>{isHindi ? 'रसोई प्रमुख को सलाह:' : 'Kitchen Advice:'}</strong>{' '}
            {isHindi ? activeDay.kitchenAdviceHi : activeDay.kitchenAdviceEn}{' '}
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              ({forecast.explainableReason})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
