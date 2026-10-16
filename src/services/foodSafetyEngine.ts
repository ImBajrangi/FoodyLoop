import type { StorageCondition } from '../types';

export type FoodCategoryClass = 
  | 'COOKED_RICE_GRAIN'       // Rice, Khichdi (Bacillus cereus risk)
  | 'HIGH_MOISTURE_GRAVY'     // Dal, Sambar, Sabzi Gravy (Fermentation risk)
  | 'PANEER_DAIRY_GRAVY'      // Shahi Paneer, Kadhai Paneer (High microbial risk)
  | 'DEEP_FRIED_BREAD_SNACK'  // Poori, Samosa, Kachori (Lower water activity)
  | 'DRY_SWEETS_MITHAI'       // Besan Ladoo, Peda (High sugar/low moisture)
  | 'CHHENA_MILK_MITHAI';     // Rasgulla, Kalakand (High perishable risk)

export interface FoodSafetyRule {
  category: FoodCategoryClass;
  displayName: string;
  hindiName: string;
  maxAmbientHours: number;
  maxHotHeldHours: number;
  maxRefrigeratedHours: number;
  minHotHeldTempC: number;
  maxChilledTempC: number;
  riskLevel: 'High' | 'Moderate' | 'Low';
  microbialCaution: string;
  mandatoryPackaging: string;
  regulatorySource: string;
  scheduleReference: string;
}

export const FSSAI_FOOD_SAFETY_RULES: Record<FoodCategoryClass, FoodSafetyRule> = {
  COOKED_RICE_GRAIN: {
    category: 'COOKED_RICE_GRAIN',
    displayName: 'Cooked Rice & Khichdi Prasadam',
    hindiName: 'पका हुआ चावल एवं खिचड़ी',
    maxAmbientHours: 3.0,
    maxHotHeldHours: 4.5,
    maxRefrigeratedHours: 24.0,
    minHotHeldTempC: 65,
    maxChilledTempC: 5,
    riskLevel: 'High',
    microbialCaution: 'Vulnerable to Bacillus cereus spore germination if held in the danger zone (20°C-50°C).',
    mandatoryPackaging: 'Steam-vented thermal food containers, never stacked wet.',
    regulatorySource: 'FSSAI Surplus Food Regulations 2019 / Codex CAC/RCP 39-1993 §7.4',
    scheduleReference: 'Schedule I (Hygiene and Sanitary Practices for Surplus Food Recovery)'
  },
  HIGH_MOISTURE_GRAVY: {
    category: 'HIGH_MOISTURE_GRAVY',
    displayName: 'Dal, Lentil Soups & Vegetable Gravy',
    hindiName: 'दाल, सांभर एवं रसेदार सब्ज़ी',
    maxAmbientHours: 3.5,
    maxHotHeldHours: 5.0,
    maxRefrigeratedHours: 18.0,
    minHotHeldTempC: 65,
    maxChilledTempC: 5,
    riskLevel: 'High',
    microbialCaution: 'High moisture and neutral pH accelerate souring and bacterial proliferation.',
    mandatoryPackaging: 'Food-grade stainless steel dabbas with food-contact certified gaskets.',
    regulatorySource: 'FSSAI Surplus Food Regulations 2019 / F. No. 1-2/Standard/Surplus Food/2018',
    scheduleReference: 'Schedule I, Section 3 (Food Collection & Handling Requirements)'
  },
  PANEER_DAIRY_GRAVY: {
    category: 'PANEER_DAIRY_GRAVY',
    displayName: 'Paneer Dishes & Dairy Gravies',
    hindiName: 'पनीर एवं दुग्ध-आधारित ग्रेवी',
    maxAmbientHours: 2.5,
    maxHotHeldHours: 4.0,
    maxRefrigeratedHours: 12.0,
    minHotHeldTempC: 65,
    maxChilledTempC: 4,
    riskLevel: 'High',
    microbialCaution: 'High protein dairy matrix provides rapid substrate for microbial growth.',
    mandatoryPackaging: 'Strictly sealed food containers; immediate thermal transit required.',
    regulatorySource: 'FSSAI Food Safety and Standards (Licensing & Registration) Reg. 2011, Schedule 4',
    scheduleReference: 'Part V: Specific Hygienic Requirements for Dairy & Catering'
  },
  DEEP_FRIED_BREAD_SNACK: {
    category: 'DEEP_FRIED_BREAD_SNACK',
    displayName: 'Poori, Paratha, Samosa & Kachori',
    hindiName: 'पूरी, पराठा, समोसा एवं कचौरी',
    maxAmbientHours: 7.0,
    maxHotHeldHours: 6.0,
    maxRefrigeratedHours: 36.0,
    minHotHeldTempC: 55,
    maxChilledTempC: 8,
    riskLevel: 'Moderate',
    microbialCaution: 'Low water activity delays bacterial growth; guard against condensation sogginess.',
    mandatoryPackaging: 'Breathable food-grade parchment lined boxes; prevent moisture buildup.',
    regulatorySource: 'Codex Alimentarius Regional Standard for Quick Frozen Foods / FSSAI Guidelines',
    scheduleReference: 'General Principles of Food Hygiene (CXC 1-1969 rev 2020)'
  },
  DRY_SWEETS_MITHAI: {
    category: 'DRY_SWEETS_MITHAI',
    displayName: 'Besan Ladoo, Gond Ladoo & Dry Halwa',
    hindiName: 'बेसन लड्डू, पेड़ा एवं सूखे मिष्ठान',
    maxAmbientHours: 48.0,
    maxHotHeldHours: 0,
    maxRefrigeratedHours: 120.0,
    minHotHeldTempC: 0,
    maxChilledTempC: 15,
    riskLevel: 'Low',
    microbialCaution: 'High osmotic sugar concentration inhibits bacterial multiplication naturally.',
    mandatoryPackaging: 'Clean moisture-proof sweet boxes away from direct sunlight.',
    regulatorySource: 'FSSAI Guidance Document for Traditional Indian Sweets & Confectionery (2020)',
    scheduleReference: 'Shelf Life and Storage Protocol for Traditional Mithai'
  },
  CHHENA_MILK_MITHAI: {
    category: 'CHHENA_MILK_MITHAI',
    displayName: 'Chhena, Rasgulla & Milk Kalakand',
    hindiName: 'छेना, रसगुल्ला एवं कलाकंद',
    maxAmbientHours: 2.0,
    maxHotHeldHours: 0,
    maxRefrigeratedHours: 24.0,
    minHotHeldTempC: 0,
    maxChilledTempC: 4,
    riskLevel: 'High',
    microbialCaution: 'Immediate cold chain mandatory. Do not distribute if held ambient >2 hrs.',
    mandatoryPackaging: 'Insulated cooler box with gel ice packs.',
    regulatorySource: 'FSSAI Traditional Dairy Products Safety Protocol (Order F.No. Stds/SP(S&H)/Mithai/2019)',
    scheduleReference: 'Perishable Dairy Sweets Display & Distribution Norms'
  }
};

export function classifyFoodItem(foodName: string): FoodCategoryClass {
  const lower = foodName.toLowerCase();
  if (lower.includes('paneer')) return 'PANEER_DAIRY_GRAVY';
  if (lower.includes('rice') || lower.includes('khichdi') || lower.includes('chawal')) return 'COOKED_RICE_GRAIN';
  if (lower.includes('dal') || lower.includes('curry') || lower.includes('sabzi') || lower.includes('chole')) return 'HIGH_MOISTURE_GRAVY';
  if (lower.includes('poori') || lower.includes('samosa') || lower.includes('kachori') || lower.includes('roti')) return 'DEEP_FRIED_BREAD_SNACK';
  if (lower.includes('rasgulla') || lower.includes('kalakand') || lower.includes('rabdi')) return 'CHHENA_MILK_MITHAI';
  if (lower.includes('ladoo') || lower.includes('mithai') || lower.includes('sweet') || lower.includes('peda')) return 'DRY_SWEETS_MITHAI';
  return 'HIGH_MOISTURE_GRAVY';
}

export interface FoodSafetyAssessment {
  categoryRule: FoodSafetyRule;
  allowedSafeHours: number;
  safeUntil: Date;
  status: 'COMPLIANT' | 'SAFETY_HOLD' | 'REJECTED_EXPIRED';
  warnings: string[];
  regulatoryAuditHeader: string;
  statutoryDisclaimer: string;
}

export function evaluateFoodSafety(
  foodItem: string,
  storageCondition: StorageCondition,
  preparedAt: Date,
  measuredTempC?: number
): FoodSafetyAssessment {
  const categoryClass = classifyFoodItem(foodItem);
  const rule = FSSAI_FOOD_SAFETY_RULES[categoryClass];

  let allowedHours = rule.maxAmbientHours;
  if (storageCondition === 'hot_held') {
    allowedHours = rule.maxHotHeldHours;
  } else if (storageCondition === 'refrigerated') {
    allowedHours = rule.maxRefrigeratedHours;
  }

  const safeUntil = new Date(preparedAt.getTime() + allowedHours * 3600000);
  const now = new Date();
  const isPastWindow = now.getTime() >= safeUntil.getTime();

  const warnings: string[] = [];
  let status: 'COMPLIANT' | 'SAFETY_HOLD' | 'REJECTED_EXPIRED' = 'COMPLIANT';

  if (isPastWindow) {
    status = 'REJECTED_EXPIRED';
    warnings.push(`EXPIRED HARD BLOCK: Prepared at ${preparedAt.toLocaleTimeString()}, exceeds ${allowedHours}h limit under ${rule.scheduleReference}. Distribution prohibited.`);
  } else {
    // Check Temperature Uncertainty
    if (storageCondition === 'hot_held') {
      if (measuredTempC !== undefined && measuredTempC < rule.minHotHeldTempC) {
        status = 'SAFETY_HOLD';
        warnings.push(`TEMPERATURE DANGER ZONE HOLD: Hot-held food measured at ${measuredTempC}°C, below the mandatory ${rule.minHotHeldTempC}°C threshold. Placed on SAFETY_HOLD pending supervisor review.`);
      } else if (measuredTempC === undefined) {
        warnings.push(`Notice: Continuous thermal logging required. Minimum holding standard: ≥${rule.minHotHeldTempC}°C.`);
      }
    }

    const remainingHrs = ((safeUntil.getTime() - now.getTime()) / 3600000).toFixed(1);
    if (Number(remainingHrs) < 1.0) {
      warnings.push(`EXPEDITE TRANSIT: Less than 1 hour remaining in safe window (${remainingHrs}h left).`);
    }
  }

  return {
    categoryRule: rule,
    allowedSafeHours: allowedHours,
    safeUntil,
    status,
    warnings,
    regulatoryAuditHeader: `Governed by: ${rule.regulatorySource} • Ref: ${rule.scheduleReference}`,
    statutoryDisclaimer: 
      'REGULATORY BOUNDARY: Digital affirmative declaration by Food Business Operator (FBO) confirms compliance with Schedule I hygiene requirements. ' +
      'Platform certification does NOT replace mandatory sensory inspection, tamper-seal verification, or statutory FSSAI inspection.'
  };
}
