export type UserRole = 'shop' | 'ngo' | 'volunteer' | 'donor' | 'admin';

export type Language = 'en' | 'hi';

export type ReputationTier = 'Trusted Partner' | 'Active Partner' | 'Under Review' | 'Restricted' | 'Suspended';

export type StorageCondition = 'hot_held' | 'room_temp' | 'refrigerated';

export type DonationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SAFETY_REVIEW'
  | 'AVAILABLE'
  | 'MATCHED'
  | 'PICKUP_ASSIGNED'
  | 'COLLECTED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Shop {
  id: string;
  name: string;
  category: string;
  location: string;
  address: string;
  city: 'Mathura' | 'Vrindavan' | 'Barsana';
  rating: number;
  reputationScore: number;
  reputationTier: ReputationTier;
  verified: boolean;
  fssaiNumber: string;
  phone: string;
  contactPerson: string;
  lat: number;
  lng: number;
  totalDonatedMeals: number;
  activeSurplusMeals: number;
}

export interface Ngo {
  id: string;
  name: string;
  category: 'Food Recovery' | 'Charitable Trust' | 'Shelter Management' | 'Community Kitchen';
  address: string;
  city: 'Mathura' | 'Vrindavan' | 'Barsana';
  capacity: number;
  dailyServed: number;
  verified: boolean;
  contactPerson: string;
  phone: string;
  lat: number;
  lng: number;
  activeVolunteers: number;
  reputationTier?: ReputationTier;
  reputationScore?: number;
  fssaiNumber?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  category: 'Ashram' | 'Night Shelter' | 'Community Settlement' | 'Elder Care';
  address: string;
  city: 'Mathura' | 'Vrindavan' | 'Barsana';
  residentsCount: number;
  currentMealRequirement: number;
  preferredFoods: string[];
  receivingHours: string;
  lat: number;
  lng: number;
  verified: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'E-Scooter (Insulated Box)' | 'Delivery Van' | 'Cargo Bike';
  city: 'Mathura' | 'Vrindavan' | 'Barsana';
  currentStatus: 'Available' | 'On Route' | 'Off Duty';
  completedDeliveries: number;
  rating: number;
}

export interface FoodSafetyChecklist {
  preparedFresh: boolean;
  hygieneDeclaration: boolean;
  cleanPackaging: boolean;
  temperatureVerified: boolean;
  withinWindow: boolean;
}

export interface Donation {
  id: string;
  donorShopId: string;
  donorShopName: string;
  city: 'Mathura' | 'Vrindavan' | 'Barsana';
  foodItem: string;
  foodCategory: 'Cooked Meals' | 'Snacks / Sweets' | 'Breads / Roti' | 'Rice & Lentils';
  quantity: number;
  unit: string;
  preparedAt: string;
  readyAt: string;
  safeUntil: string;
  storageCondition: StorageCondition;
  packagingStatus: string;
  handlingInstructions: string;
  allergenNotice: string;
  status: DonationStatus;
  fssaiChecklist: FoodSafetyChecklist;
  matchedNgoId?: string;
  matchedNgoName?: string;
  targetBeneficiaryId?: string;
  targetBeneficiaryName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  distanceKm?: number;
  estimatedTravelTimeMin?: number;
  otpCode?: string;
  createdAt: string;
  collectedAt?: string;
  deliveredAt?: string;
}

export interface ItemIntelligenceRecord {
  id: string;
  name: string;
  hindiName: string;
  avgDailyPrepared: number;
  avgDailySold: number;
  avgDailySurplus: number;
  surplusRate: number; // percentage
  productionCostInr: number;
  sellingPriceInr: number;
  salesVariability: 'Low' | 'Moderate' | 'High';
  aiInsight: string;
  demandTrend: number[]; // 7-day trend
}

export interface RawMaterial {
  id: string;
  name: string;
  hindiName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  expiryDays: number;
  minThreshold: number;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  name: string;
  quantityPerPortion: number;
  unit: string;
}

export interface Recipe {
  id: string;
  itemName: string;
  portionUnit: string;
  ingredients: RecipeIngredient[];
}

export interface DemandForecast {
  date: string;
  dayOfWeek: string;
  festivalEvent?: string;
  expectedDemandLow: number;
  expectedDemandHigh: number;
  suggestedPreparation: number;
  predictedSurplus: number;
  stockoutRisk: 'Low' | 'Moderate' | 'Elevated';
  confidenceScore: number; // 0-100%
  explainableReason: string;
}

export interface Sponsorship {
  id: string;
  sponsorName: string;
  phone: string;
  occasion: string; // e.g. Birthday, Anniversary, Remembrance
  honoreeName: string;
  preferredDate: string;
  preferredCity: 'Mathura' | 'Vrindavan' | 'Barsana';
  mealsSponsored: number;
  budgetInr: number;
  beneficiaryLocationId: string;
  beneficiaryLocationName: string;
  status: 'Pledged' | 'Paid & Allocated' | 'Meals Prepared' | 'Completed';
  dedicationMessage: string;
  certificateId: string;
  createdAt: string;
}

export interface ReputationAudit {
  id: string;
  shopId: string;
  timestamp: string;
  change: number;
  event: string;
  newScore: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'Safety' | 'Verification' | 'Donation' | 'Logistics' | 'Sponsorship';
  details: string;
}
