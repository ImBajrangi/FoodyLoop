import {
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
  AuditLog
} from '../types';

// All live demo data is persisted in and served from Supabase PostgreSQL tables:
// - organizations (Shops & NGOs)
// - donations (Surplus food donations)
// - beneficiary_profiles
// - volunteer_profiles
// - inventory_items (Raw Materials)
// - food_items (Item Intelligence & Menus)
// - recipes
// - forecasts
// - sponsorships
// - audit_logs
// Local mock arrays are empty by default; data hydrates dynamically from Supabase database.

export const INITIAL_SHOPS: Shop[] = [];
export const INITIAL_NGOS: Ngo[] = [];
export const INITIAL_BENEFICIARIES: Beneficiary[] = [];
export const INITIAL_VOLUNTEERS: Volunteer[] = [];
export const INITIAL_DONATIONS: Donation[] = [];
export const INITIAL_ITEM_INTELLIGENCE: ItemIntelligenceRecord[] = [];
export const INITIAL_RAW_MATERIALS: RawMaterial[] = [];
export const INITIAL_RECIPES: Recipe[] = [];
export const INITIAL_FORECASTS: DemandForecast[] = [];
export const INITIAL_SPONSORSHIPS: Sponsorship[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
