import { supabase, supabaseAdmin, signInDemoUser, isSupabaseConfigured } from './supabase';
import type { 
  Shop, 
  Ngo, 
  Beneficiary, 
  Volunteer, 
  Donation, 
  Sponsorship, 
  UserRole,
  ReputationTier,
  StorageCondition,
  DonationStatus
} from '../types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  dbConnected: boolean;
  error: string | null;
  activeRole: UserRole;
}

class DatabaseSyncService {
  private status: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    dbConnected: false,
    error: null,
    activeRole: 'shop'
  };

  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private realtimeChannel: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private handleNetworkChange(online: boolean) {
    this.status.isOnline = online;
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.status));
  }

  public subscribe(cb: (status: SyncStatus) => void): () => void {
    this.listeners.add(cb);
    cb(this.status);
    return () => this.listeners.delete(cb);
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Ensure user is authenticated with Supabase matching their current role
   */
  public async syncAuthForRole(role: UserRole): Promise<void> {
    this.status.activeRole = role;
    if (!isSupabaseConfigured) return;
    try {
      await signInDemoUser(role);
    } catch (err: any) {
      console.warn('Sync auth role warning:', err?.message);
    }
  }

  /**
   * Fetch all live entities from Supabase PostgreSQL tables
   */
  public async fetchLiveState(): Promise<{
    shops?: Shop[];
    ngos?: Ngo[];
    beneficiaries?: Beneficiary[];
    volunteers?: Volunteer[];
    donations?: Donation[];
    sponsorships?: Sponsorship[];
  } | null> {
    if (!isSupabaseConfigured) return null;

    this.status.isSyncing = true;
    this.status.error = null;
    this.notify();

    try {
      const [orgsRes, donsRes, benRes, volRes, profRes, sponsRes] = await Promise.all([
        supabaseAdmin.from('organizations').select('*'),
        supabaseAdmin.from('donations').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('beneficiary_profiles').select('*'),
        supabaseAdmin.from('volunteer_profiles').select('*'),
        supabaseAdmin.from('profiles').select('*'),
        supabaseAdmin.from('sponsorships').select('*').order('created_at', { ascending: false })
      ]);

      if (orgsRes.error) throw orgsRes.error;

      const orgs = orgsRes.data || [];
      const orgMap = new Map(orgs.map(o => [o.id, o]));
      const profMap = new Map((profRes.data || []).map(p => [p.id, p]));

      // 1. Map Organizations to Shops
      const shops: Shop[] = orgs.filter(o => o.role === 'shop').map(o => ({
        id: o.id,
        name: o.name,
        category: o.category || 'Pure Veg Traditional Bhojanalaya',
        location: o.address || o.city,
        address: o.address || '',
        city: (o.city as any) || 'Vrindavan',
        rating: 4.9,
        reputationScore: o.reputation_score || 98,
        reputationTier: (o.reputation_tier || 'Trusted Partner') as ReputationTier,
        verified: Boolean(o.is_verified),
        fssaiNumber: o.fssai_license_number || '12723056000412',
        phone: o.contact_phone || '+91 98371 45290',
        contactPerson: o.contact_person || 'Radheshyam Agarwal',
        lat: 27.5706,
        lng: 77.6743,
        totalDonatedMeals: 1420,
        activeSurplusMeals: 30
      }));

      // 2. Map Organizations to NGOs
      const ngos: Ngo[] = orgs.filter(o => o.role === 'ngo').map(o => ({
        id: o.id,
        name: o.name,
        category: (o.category?.includes('Elderly') ? 'Elder Care' : 'Food Recovery') as any,
        address: o.address || '',
        city: (o.city as any) || 'Vrindavan',
        capacity: o.capacity_meals_per_day || 250,
        dailyServed: 180,
        verified: Boolean(o.is_verified),
        contactPerson: o.contact_person || 'Dr. Anuradha Goswami',
        phone: o.contact_phone || '+91 98971 20002',
        lat: 27.5812,
        lng: 77.6841,
        activeVolunteers: 8
      }));

      // 3. Map Beneficiary Profiles
      const beneficiaries: Beneficiary[] = (benRes.data || []).map(b => {
        const org = orgMap.get(b.organization_id);
        const startTime = b.receiving_hours_start ? String(b.receiving_hours_start).slice(0, 5) : '10:00';
        const endTime = b.receiving_hours_end ? String(b.receiving_hours_end).slice(0, 5) : '20:00';
        return {
          id: b.id,
          name: org ? org.name : 'Vrindavan Ashram',
          category: 'Elder Care',
          address: org ? org.address : 'Near Kaliya Ghat, Vrindavan, UP',
          city: (org?.city as any) || 'Vrindavan',
          residentsCount: b.resident_count || 85,
          currentMealRequirement: b.daily_meal_demand || 120,
          preferredFoods: b.preferred_categories || ['Cooked Meals', 'Rice & Lentils'],
          receivingHours: `${startTime} - ${endTime}`,
          lat: 27.5840,
          lng: 77.6910,
          verified: true
        };
      });

      // 4. Map Volunteer Profiles
      const volunteers: Volunteer[] = (volRes.data || []).map(v => {
        const prof = profMap.get(v.profile_id);
        return {
          id: v.id,
          name: prof ? prof.full_name : 'Arun Sharma',
          phone: prof ? prof.phone : '+91 98971 22340',
          vehicleType: v.vehicle_type?.includes('E-Scooter') ? 'E-Scooter (Insulated Box)' : 'Delivery Van',
          city: (v.city as any) || 'Vrindavan',
          currentStatus: v.current_status || 'Available',
          completedDeliveries: v.total_completed_deliveries || 142,
          rating: Number(v.rating) || 4.95
        };
      });

      // 5. Map Donations Table
      const donations: Donation[] = (donsRes.data || []).map(d => {
        const donorOrg = orgMap.get(d.donor_org_id);
        const matchedOrg = d.matched_ngo_id ? orgMap.get(d.matched_ngo_id) : undefined;
        const targetBenOrg = d.target_beneficiary_id ? orgMap.get(d.target_beneficiary_id) : undefined;
        const volProf = d.assigned_volunteer_id ? profMap.get(d.assigned_volunteer_id) : undefined;

        let foodCat: Donation['foodCategory'] = 'Cooked Meals';
        if (d.food_category === 'COOKED_RICE_GRAIN') foodCat = 'Rice & Lentils';
        else if (d.food_category === 'DRY_SWEETS_MITHAI' || d.food_category === 'DAIRY_PRASAD') foodCat = 'Snacks / Sweets';
        else if (d.food_category === 'BAKERY_BREAD') foodCat = 'Breads / Roti';

        return {
          id: d.id,
          donorShopId: d.donor_org_id,
          donorShopName: donorOrg ? donorOrg.name : 'Krishna Bhojanalaya',
          city: (donorOrg?.city as any) || 'Vrindavan',
          foodItem: d.food_item,
          foodCategory: foodCat,
          quantity: d.quantity_meals,
          unit: 'Meals',
          preparedAt: d.prepared_at,
          readyAt: d.ready_for_pickup_at,
          safeUntil: d.safe_until,
          storageCondition: (d.storage_condition as StorageCondition) || 'hot_held',
          packagingStatus: 'FSSAI Grade 5 Insulated Hot-Tiffin Pack',
          handlingInstructions: 'Maintain >60°C hot holding until distribution',
          allergenNotice: 'Pure Sattvik, contains Dairy. Nut-free.',
          status: (d.status as DonationStatus) || 'AVAILABLE',
          fssaiChecklist: {
            preparedFresh: true,
            hygieneDeclaration: true,
            cleanPackaging: true,
            temperatureVerified: true,
            withinWindow: true
          },
          matchedNgoId: d.matched_ngo_id || undefined,
          matchedNgoName: matchedOrg?.name,
          targetBeneficiaryId: d.target_beneficiary_id || undefined,
          targetBeneficiaryName: targetBenOrg?.name,
          assignedVolunteerId: d.assigned_volunteer_id || undefined,
          assignedVolunteerName: volProf?.full_name,
          otpCode: d.pickup_otp || undefined,
          createdAt: d.created_at,
          collectedAt: d.collected_at || undefined,
          deliveredAt: d.delivered_at || undefined
        };
      });

      // 6. Map Sponsorships
      const sponsorships: Sponsorship[] = (sponsRes.data || []).map(s => {
        const targetOrg = s.target_beneficiary_id ? orgMap.get(s.target_beneficiary_id) : undefined;
        return {
          id: s.id,
          sponsorName: s.sponsor_name,
          phone: s.sponsor_phone,
          occasion: s.occasion,
          honoreeName: s.sponsor_name,
          preferredDate: s.scheduled_serving_date,
          preferredCity: 'Vrindavan',
          mealsSponsored: s.meal_count,
          budgetInr: Number(s.amount_inr),
          beneficiaryLocationId: s.target_beneficiary_id || '',
          beneficiaryLocationName: targetOrg ? targetOrg.name : 'Radharani Widow & Elder Care Ashram',
          status: s.payment_status === 'COMPLETED' ? 'Paid & Allocated' : 'Pledged',
          dedicationMessage: `Dedicated on ${s.occasion}`,
          certificateId: 'CERT-' + s.id.slice(0, 8).toUpperCase(),
          createdAt: s.created_at
        };
      });

      this.status.dbConnected = true;
      this.status.lastSyncedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.status.isSyncing = false;
      this.notify();

      return { shops, ngos, beneficiaries, volunteers, donations, sponsorships };
    } catch (err: any) {
      console.warn('Fetch live state failed, using local cache:', err?.message);
      this.status.isSyncing = false;
      this.status.error = err?.message || 'Database sync error';
      this.notify();
      return null;
    }
  }

  /**
   * Push newly created surplus donation to Supabase PostgreSQL table
   */
  public async pushDonation(donation: Donation): Promise<{ success: boolean; donationId?: string; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true, donationId: donation.id };
    }

    try {
      let dbCategory = 'HIGH_MOISTURE_GRAVY';
      if (donation.foodCategory === 'Rice & Lentils') dbCategory = 'COOKED_RICE_GRAIN';
      else if (donation.foodCategory === 'Snacks / Sweets') dbCategory = 'DRY_SWEETS_MITHAI';
      else if (donation.foodCategory === 'Breads / Roti') dbCategory = 'BAKERY_BREAD';

      // Fallback to real Krishna Bhojanalaya UUID if shop-1 legacy ID is provided
      const realDonorOrgId = donation.donorShopId === 'shop-1' 
        ? 'ff22da9a-2623-4387-af37-6a8bb50bb19f' 
        : donation.donorShopId;

      const payload = {
        donor_org_id: realDonorOrgId,
        food_item: donation.foodItem,
        food_category: dbCategory,
        quantity_meals: donation.quantity,
        prepared_at: donation.preparedAt,
        ready_for_pickup_at: donation.readyAt || donation.preparedAt,
        safe_until: donation.safeUntil,
        storage_condition: donation.storageCondition,
        status: donation.status,
        pickup_otp: donation.otpCode || Math.floor(1000 + Math.random() * 9000).toString()
      };

      const { data, error } = await supabaseAdmin.from('donations').insert(payload).select().single();
      if (error) throw error;

      // Add to server audit logs
      await this.pushAuditLog(
        'donations',
        data.id,
        donation.donorShopName,
        'DONATION_CREATED',
        'Donation',
        `Declared ${donation.quantity} meals of ${donation.foodItem}.`
      );

      return { success: true, donationId: data.id };
    } catch (err: any) {
      console.warn('Push donation error:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Update donation status in Supabase PostgreSQL table
   */
  public async updateDonation(
    donationId: string, 
    updates: Partial<Donation>
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.matchedNgoId) {
        dbUpdates.matched_ngo_id = updates.matchedNgoId === 'ngo-1' 
          ? '09afa3ca-3498-4446-96f0-5b566ebdeb53' 
          : updates.matchedNgoId;
      }
      if (updates.targetBeneficiaryId) dbUpdates.target_beneficiary_id = updates.targetBeneficiaryId;
      if (updates.assignedVolunteerId) dbUpdates.assigned_volunteer_id = updates.assignedVolunteerId;
      if (updates.otpCode) dbUpdates.pickup_otp = updates.otpCode;
      if (updates.collectedAt) dbUpdates.collected_at = updates.collectedAt;
      if (updates.deliveredAt) dbUpdates.delivered_at = updates.deliveredAt;

      const { error } = await supabaseAdmin
        .from('donations')
        .update(dbUpdates)
        .eq('id', donationId);

      if (error) throw error;

      // Log server audit
      if (updates.status === 'DELIVERED') {
        await this.pushAuditLog(
          'donations',
          donationId,
          updates.assignedVolunteerName || 'Volunteer',
          'DELIVERY_COMPLETED',
          'Logistics',
          `Delivered ${updates.quantity || 0} meals to ${updates.targetBeneficiaryName || 'Beneficiary'}.`
        );
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Update donation in Supabase warning:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Push sponsorship to Supabase PostgreSQL table
   */
  public async pushSponsorship(sponsorship: Sponsorship): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const payload = {
        sponsor_name: sponsorship.sponsorName,
        sponsor_phone: sponsorship.phone,
        occasion: sponsorship.occasion,
        target_beneficiary_id: '276be08a-482f-4b74-82a0-75206a3fdf03', // Radharani Widow Ashram
        meal_count: sponsorship.mealsSponsored,
        amount_inr: sponsorship.budgetInr,
        payment_status: 'COMPLETED',
        scheduled_serving_date: sponsorship.preferredDate || new Date().toISOString().split('T')[0]
      };

      const { error } = await supabaseAdmin.from('sponsorships').insert(payload);
      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.warn('Push sponsorship error:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Record server audit log
   */
  public async pushAuditLog(
    entityName: string,
    entityId: string,
    actorName: string,
    action: string,
    category: 'Donation' | 'Safety' | 'Logistics' | 'Verification' | 'Sponsorship' | 'Security',
    details: string
  ): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabaseAdmin.from('audit_logs').insert({
        entity_name: entityName,
        entity_id: entityId.includes('-') && entityId.length === 36 ? entityId : 'ff22da9a-2623-4387-af37-6a8bb50bb19f',
        actor_name: actorName,
        action: action,
        category: category,
        new_state: { details }
      });
    } catch {
      // Ignore background audit log errors
    }
  }

  /**
   * Register a new Restaurant / Shop or NGO in Supabase organizations
   */
  public async registerOrganization(payload: {
    name: string;
    role: 'shop' | 'ngo';
    category: string;
    city: 'Mathura' | 'Vrindavan' | 'Barsana';
    address: string;
    fssaiLicenseNumber: string;
    contactPerson: string;
    contactPhone: string;
    capacityMealsPerDay: number;
  }): Promise<{ success: boolean; orgId?: string; error?: string }> {
    if (!isSupabaseConfigured) return { success: true, orgId: 'org-' + Date.now() };

    try {
      const sanitizedLicense = payload.fssaiLicenseNumber.replace(/[^a-zA-Z0-9]/g, '').slice(0, 14);

      const dbPayload = {
        name: payload.name,
        role: payload.role,
        category: payload.category,
        city: payload.city,
        address: payload.address,
        fssai_license_number: sanitizedLicense,
        is_verified: false,
        reputation_score: 80,
        reputation_tier: 'Under Review',
        contact_person: payload.contactPerson,
        contact_phone: payload.contactPhone,
        capacity_meals_per_day: payload.capacityMealsPerDay
      };

      const { data, error } = await supabaseAdmin.from('organizations').insert(dbPayload).select().single();
      if (error) throw error;

      await this.pushAuditLog(
        'organizations',
        data.id,
        payload.contactPerson,
        'ORGANIZATION_REGISTERED',
        'Verification',
        `New ${payload.role === 'shop' ? 'Restaurant / Shop' : 'NGO'} applied for registration: ${payload.name} (${payload.city}). License/Ref: ${sanitizedLicense}.`
      );

      return { success: true, orgId: data.id };
    } catch (err: any) {
      console.warn('Register org error:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Approve Organization by Food Safety Officer / Admin
   */
  public async approveOrganization(orgId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { data, error } = await supabaseAdmin.from('organizations').update({
        is_verified: true,
        reputation_tier: 'Active Partner',
        reputation_score: 95
      }).eq('id', orgId).select();

      if (error) throw error;

      await this.pushAuditLog(
        'organizations',
        orgId,
        'Food Safety Officer Mathura',
        'ORGANIZATION_APPROVED',
        'Verification',
        `Authorized and approved organization ${data?.[0]?.name || orgId} for Food Loop operations.`
      );

      return { success: true };
    } catch (err: any) {
      console.warn('Approve org warning:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Reject or Flag Organization for Physical Inspection
   */
  public async rejectOrganization(orgId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabaseAdmin.from('organizations').update({
        is_verified: false,
        reputation_tier: 'Restricted'
      }).eq('id', orgId);

      if (error) throw error;

      await this.pushAuditLog(
        'organizations',
        orgId,
        'Food Safety Officer Mathura',
        'ORGANIZATION_RESTRICTED',
        'Verification',
        `Flagged for regulatory inspection: ${reason || 'Physical verification pending'}.`
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  /**
   * Listen to real-time changes on public:donations and trigger local update
   */
  public subscribeToRealtime(onDonationChange: () => void): () => void {
    if (!isSupabaseConfigured) return () => {};

    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = supabase
      .channel('public:donations_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => {
          onDonationChange();
        }
      )
      .subscribe();

    return () => {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
    };
  }
}

export const dbSync = new DatabaseSyncService();
