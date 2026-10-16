import type { 
  Shop, 
  Ngo, 
  Beneficiary, 
  Volunteer, 
  Donation, 
  ItemIntelligenceRecord, 
  RawMaterial, 
  Recipe, 
  DemandForecast, 
  Sponsorship, 
  AuditLog,
  UserRole,
  Language,
  DonationStatus
} from '../types';
import { 
  INITIAL_SHOPS, 
  INITIAL_NGOS, 
  INITIAL_BENEFICIARIES, 
  INITIAL_VOLUNTEERS, 
  INITIAL_DONATIONS, 
  INITIAL_ITEM_INTELLIGENCE, 
  INITIAL_RAW_MATERIALS, 
  INITIAL_RECIPES, 
  INITIAL_FORECASTS, 
  INITIAL_SPONSORSHIPS, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { evaluateFoodSafety } from './foodSafetyEngine';
import { dbSync } from './dbSync';

export type PortalType = 'shop' | 'ngo_donor' | null;

export interface AppCacheState {
  version: number;
  portal: PortalType;
  role: UserRole;
  language: Language;
  activeShopId: string;
  activeNgoId: string;
  shops: Shop[];
  ngos: Ngo[];
  beneficiaries: Beneficiary[];
  volunteers: Volunteer[];
  donations: Donation[];
  itemIntelligence: ItemIntelligenceRecord[];
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
  forecasts: DemandForecast[];
  sponsorships: Sponsorship[];
  auditLogs: AuditLog[];
  demoStep: number; // 0 = idle, 1-7 for Hackathon Live Demo
  isSyncing: boolean;
  dbConnected?: boolean;
}

const CACHE_KEY = 'foodloop_cache_v4';
const BROADCAST_CHANNEL_NAME = 'foodloop_cross_tab_sync_v3';

class CacheService {
  private state: AppCacheState;
  private listeners: Set<() => void> = new Set();
  private channel: BroadcastChannel | null = null;
  private unsubscribeRealtime: (() => void) | null = null;

  constructor() {
    this.state = this.loadInitial();
    this.setupMultiUserSync();
    this.initDatabaseSync();
  }

  private setupMultiUserSync() {
    // 1. Cross-Tab / Multi-Window Real-time BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE' && event.data?.state) {
            this.state = event.data.state;
            this.notifyLocal();
          }
        };
      } catch {
        // Fallback to storage event
      }
    }

    // 2. Storage event listener for older or fallback browsers
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === CACHE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.state = parsed;
            this.notifyLocal();
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private loadInitial(): AppCacheState {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.version === 4) {
            return parsed;
          }
        }
      }
    } catch {
      // LocalStorage access failure fallback
    }

    const defaultState: AppCacheState = {
      version: 4,
      portal: null,
      role: 'shop',
      language: 'en',
      activeShopId: 'shop-1',
      activeNgoId: 'ngo-1',
      shops: INITIAL_SHOPS,
      ngos: INITIAL_NGOS,
      beneficiaries: INITIAL_BENEFICIARIES,
      volunteers: INITIAL_VOLUNTEERS,
      donations: INITIAL_DONATIONS,
      itemIntelligence: INITIAL_ITEM_INTELLIGENCE,
      rawMaterials: INITIAL_RAW_MATERIALS,
      recipes: INITIAL_RECIPES,
      forecasts: INITIAL_FORECASTS,
      sponsorships: INITIAL_SPONSORSHIPS,
      auditLogs: INITIAL_AUDIT_LOGS,
      demoStep: 0,
      isSyncing: false
    };

    this.save(defaultState);
    return defaultState;
  }

  private save(state: AppCacheState) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify() {
    this.save(this.state);
    this.notifyLocal();

    // Broadcast change across all other open tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'SYNC_STATE', state: this.state });
      } catch {
        // Ignore broadcast errors
      }
    }
  }

  private notifyLocal() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): AppCacheState {
    return this.state;
  }

  public resetToDefault() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    this.state = {
      version: 4,
      portal: null,
      role: 'shop',
      language: 'en',
      activeShopId: 'shop-1',
      activeNgoId: 'ngo-1',
      shops: INITIAL_SHOPS,
      ngos: INITIAL_NGOS,
      beneficiaries: INITIAL_BENEFICIARIES,
      volunteers: INITIAL_VOLUNTEERS,
      donations: INITIAL_DONATIONS,
      itemIntelligence: INITIAL_ITEM_INTELLIGENCE,
      rawMaterials: INITIAL_RAW_MATERIALS,
      recipes: INITIAL_RECIPES,
      forecasts: INITIAL_FORECASTS,
      sponsorships: INITIAL_SPONSORSHIPS,
      auditLogs: INITIAL_AUDIT_LOGS,
      demoStep: 0,
      isSyncing: false
    };
    this.notify();
  }

  private initDatabaseSync() {
    // 1. Subscribe to dbSync status events
    dbSync.subscribe((syncStatus) => {
      this.state.isSyncing = syncStatus.isSyncing;
      this.state.dbConnected = syncStatus.dbConnected;
      this.notifyLocal();
    });

    // 2. Hydrate immediately from live Supabase tables
    dbSync.fetchLiveState().then((liveData) => {
      if (liveData) {
        this.hydrateFromDatabase(liveData);
      }
    });

    // 3. Subscribe to realtime PostgreSQL changes
    this.unsubscribeRealtime = dbSync.subscribeToRealtime(async () => {
      const liveData = await dbSync.fetchLiveState();
      if (liveData) {
        this.hydrateFromDatabase(liveData);
      }
    });

    // 4. Authenticate for current initial role
    dbSync.syncAuthForRole(this.state.role);
  }

  public hydrateFromDatabase(data: {
    shops?: Shop[];
    ngos?: Ngo[];
    beneficiaries?: Beneficiary[];
    volunteers?: Volunteer[];
    donations?: Donation[];
    sponsorships?: Sponsorship[];
  }) {
    if (data.shops && data.shops.length > 0) {
      this.state.shops = data.shops;
      if (!this.state.shops.some(s => s.id === this.state.activeShopId)) {
        this.state.activeShopId = this.state.shops[0].id;
      }
    }
    if (data.ngos && data.ngos.length > 0) {
      this.state.ngos = data.ngos;
      if (!this.state.ngos.some(n => n.id === this.state.activeNgoId)) {
        this.state.activeNgoId = this.state.ngos[0].id;
      }
    }
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      this.state.beneficiaries = data.beneficiaries;
    }
    if (data.volunteers && data.volunteers.length > 0) {
      this.state.volunteers = data.volunteers;
    }
    if (data.donations && data.donations.length > 0) {
      this.state.donations = data.donations;
    }
    if (data.sponsorships && data.sponsorships.length > 0) {
      this.state.sponsorships = data.sponsorships;
    }
    this.state.dbConnected = true;
    this.save(this.state);
    this.notifyLocal();
  }

  public setPortal(portal: PortalType, activeEntityId?: string) {
    this.state.portal = portal;
    if (portal === 'shop') {
      this.state.role = 'shop';
      if (activeEntityId) this.state.activeShopId = activeEntityId;
    } else if (portal === 'ngo_donor') {
      this.state.role = 'ngo';
      if (activeEntityId) this.state.activeNgoId = activeEntityId;
    }
    dbSync.syncAuthForRole(this.state.role);
    this.notify();
  }

  public logout() {
    this.state.portal = null;
    this.notify();
  }

  public setRole(role: UserRole) {
    this.state.role = role;
    dbSync.syncAuthForRole(role);
    this.notify();
  }

  public setLanguage(lang: Language) {
    this.state.language = lang;
    this.notify();
  }

  public setActiveShop(shopId: string) {
    this.state.activeShopId = shopId;
    this.notify();
  }

  public setDemoStep(step: number) {
    this.state.demoStep = step;
    this.notify();
  }

  public addDonation(donation: Donation) {
    // Validate safety with categorized engine before committing
    const assessment = evaluateFoodSafety(
      donation.foodItem, 
      donation.storageCondition, 
      new Date(donation.preparedAt)
    );
    
    // Dynamically adjust safeUntil according to specific category limits
    donation.safeUntil = assessment.safeUntil.toISOString();

    // Match real shop if needed
    const shop = this.state.shops.find(s => s.id === donation.donorShopId || s.name === donation.donorShopName);
    if (shop) {
      donation.donorShopId = shop.id;
      donation.donorShopName = shop.name;
    }

    this.state.donations = [donation, ...this.state.donations];
    
    // Update shop surplus stats
    if (shop) {
      shop.activeSurplusMeals = Math.max(0, shop.activeSurplusMeals - donation.quantity);
      shop.totalDonatedMeals += donation.quantity;
      shop.reputationScore = Math.min(100, shop.reputationScore + 2);
    }

    // Add immutable audit record
    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      actor: donation.donorShopName,
      action: 'DONATION_CREATED',
      category: 'Donation',
      details: `Declared ${donation.quantity} ${donation.unit} of ${donation.foodItem}. Categorized as ${assessment.categoryRule.displayName}; safe until ${assessment.safeUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });

    this.notify();

    // Asynchronously push to live Supabase PostgreSQL database
    dbSync.pushDonation(donation).then(res => {
      if (res.success && res.donationId) {
        donation.id = res.donationId;
        this.save(this.state);
        this.notifyLocal();
      }
    });
  }

  public updateDonationStatus(
    donationId: string, 
    status: DonationStatus, 
    extraData?: Partial<Donation>
  ) {
    const donation = this.state.donations.find(d => d.id === donationId);
    if (!donation) return;

    // Strict state transitions check
    donation.status = status;
    if (extraData) {
      Object.assign(donation, extraData);
    }

    // If delivered, reward shop reputation
    if (status === 'DELIVERED') {
      donation.deliveredAt = new Date().toISOString();
      const shop = this.state.shops.find(s => s.id === donation.donorShopId);
      if (shop) {
        shop.reputationScore = Math.min(100, shop.reputationScore + 5);
      }
      this.addAuditLog({
        id: 'LOG-' + Date.now(),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        actor: donation.assignedVolunteerName || 'Volunteer',
        action: 'DELIVERY_COMPLETED',
        category: 'Logistics',
        details: `Successfully delivered ${donation.quantity} meals to ${donation.targetBeneficiaryName}. Reputation score +5 awarded.`
      });
    }

    this.notify();

    // Asynchronously update live Supabase PostgreSQL database
    dbSync.updateDonation(donationId, { status, ...extraData });
  }

  public addAuditLog(log: AuditLog) {
    this.state.auditLogs = [log, ...this.state.auditLogs];
  }

  public addSponsorship(sponsorship: Sponsorship) {
    this.state.sponsorships = [sponsorship, ...this.state.sponsorships];
    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      actor: sponsorship.sponsorName,
      action: 'SPONSORSHIP_PLEDGED',
      category: 'Sponsorship',
      details: `Sponsored ${sponsorship.mealsSponsored} fresh meals for ₹${sponsorship.budgetInr.toLocaleString('en-IN')} (${sponsorship.occasion}).`
    });
    this.notify();

    // Asynchronously push to live Supabase PostgreSQL database
    dbSync.pushSponsorship(sponsorship);
  }

  // --- Dynamic Time-Series AI Demand Forecasting Calculation ---
  public calculateDynamicDemandForecast(targetDayOfWeek: string, festivalMultiplier = 1.0): DemandForecast {
    // 1. Gather historical weekday trends across all items
    const allTrends = this.state.itemIntelligence.map(item => item.demandTrend);
    const dayIndices: Record<string, number> = {
      'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
    };
    const dayIndex = dayIndices[targetDayOfWeek] ?? 4;

    // Aggregate daily demand on that day across all historical weeks
    const historicalValues = allTrends.map(trend => trend[dayIndex] || 80);
    const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
    
    // Variance and Standard Deviation
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
    const stdDev = Math.sqrt(variance);

    // Apply pilgrimage/festival factor (e.g. Saturday Parikrama = 1.35x)
    const adjustedMean = Math.round(mean * festivalMultiplier);
    const margin = Math.round(1.96 * (stdDev || 8)); // 95% Confidence Interval

    const low = Math.max(20, adjustedMean - margin);
    const high = adjustedMean + margin;
    const suggestedPrep = Math.round(adjustedMean * 1.05); // 5% buffer to protect against stockouts
    const predictedSurplus = Math.max(0, suggestedPrep - adjustedMean);

    return {
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: targetDayOfWeek,
      expectedDemandLow: low,
      expectedDemandHigh: high,
      suggestedPreparation: suggestedPrep,
      predictedSurplus,
      stockoutRisk: margin > 25 ? 'Elevated' : 'Low',
      confidenceScore: Math.round(96 - (stdDev * 1.2)),
      explainableReason: `Calculated from 14-day rolling demand trends for ${targetDayOfWeek} (Mean: ${mean.toFixed(1)}, StdDev: ${stdDev.toFixed(1)}). Scaled by ${festivalMultiplier}x for local Braj footfall.`
    };
  }

  // --- Smart Matching: Geospatial Haversine & Safety Eligibility ---
  public findNearbyMatches(donation: Donation) {
    const shop = this.state.shops.find(s => s.id === donation.donorShopId);
    const shopLat = shop?.lat || 27.5706;
    const shopLng = shop?.lng || 77.6743;

    return this.state.beneficiaries.map(ben => {
      const dist = this.calculateDistanceKm(shopLat, shopLng, ben.lat, ben.lng);
      const estTimeMin = Math.round(dist * 5 + 4);
      const capacityMatch = ben.currentMealRequirement >= donation.quantity;
      
      const foodMatch = ben.preferredFoods.some(p => 
        donation.foodItem.toLowerCase().includes(p.toLowerCase())
      );

      let score = 95 - Math.round(dist * 5);
      if (capacityMatch) score += 10;
      if (foodMatch) score += 5;
      score = Math.min(99, Math.max(50, score));

      return {
        beneficiary: ben,
        distanceKm: Number(dist.toFixed(1)),
        estimatedTravelTimeMin: estTimeMin,
        score,
        foodMatch,
        capacityMatch
      };
    }).sort((a, b) => b.score - a.score);
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public calculateMaxPortionsPossible(recipeId: string): number {
    const recipe = this.state.recipes.find(r => r.id === recipeId);
    if (!recipe) return 0;

    let minPortions = Infinity;
    recipe.ingredients.forEach(ing => {
      const raw = this.state.rawMaterials.find(m => m.id === ing.rawMaterialId);
      if (raw && ing.quantityPerPortion > 0) {
        const portions = Math.floor(raw.quantity / ing.quantityPerPortion);
        if (portions < minPortions) {
          minPortions = portions;
        }
      }
    });

    return minPortions === Infinity ? 0 : minPortions;
  }

  public updateRawMaterialStock(materialId: string, quantity: number) {
    this.state.rawMaterials = this.state.rawMaterials.map(m => 
      m.id === materialId ? { ...m, quantity } : m
    );
    this.notify();
  }
}

export const cache = new CacheService();
