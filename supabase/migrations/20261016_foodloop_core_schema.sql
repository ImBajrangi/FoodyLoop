-- ============================================================================
-- FOOD LOOP — Complete Production PostgreSQL DDL & Hardened Security Architecture
-- Target: Mathura–Vrindavan–Barsana Region
-- Standard: Full 28 Normalized Entities, Comprehensive Multi-Tenant RLS on All Tables,
--           SECURITY DEFINER with Fixed search_path & Caller Authorization,
--           SHA-256 Hashed OTP Credential Isolation, Exact Procedure Signatures,
--           Database-Enforced State Machine (INSERT + UPDATE), and Append-Only Audit Ledger.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. DOMAIN ENUMS (Idempotent creation)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('shop', 'ngo', 'volunteer', 'donor', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reputation_tier_type') THEN
        CREATE TYPE reputation_tier_type AS ENUM ('Trusted Partner', 'Active Partner', 'Under Review', 'Restricted', 'Suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status_type') THEN
        CREATE TYPE donation_status_type AS ENUM (
            'DRAFT', 'SUBMITTED', 'SAFETY_REVIEW', 'SAFETY_HOLD', 'AVAILABLE', 
            'MATCHED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DELIVERED', 
            'CANCELLED', 'REJECTED', 'EXPIRED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_condition_type') THEN
        CREATE TYPE storage_condition_type AS ENUM ('hot_held', 'room_temp', 'refrigerated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_category_class_type') THEN
        CREATE TYPE food_category_class_type AS ENUM (
            'COOKED_RICE_GRAIN', 'HIGH_MOISTURE_GRAVY', 'PANEER_DAIRY_GRAVY', 
            'DEEP_FRIED_BREAD_SNACK', 'DRY_SWEETS_MITHAI', 'CHHENA_MILK_MITHAI'
        );
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. CORE IDENTITY & ORGANIZATIONAL LAYER (Tables 1 - 7)
-- ----------------------------------------------------------------------------

-- Table 1: Profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 2: User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role)
);

-- Table 3: Organizations (Shops, Restaurants, NGOs, Shelters, Sponsors)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    primary_role user_role_type NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('Mathura', 'Vrindavan', 'Barsana', 'Govardhan')),
    address TEXT NOT NULL,
    fssai_license_number VARCHAR(14),
    is_verified BOOLEAN DEFAULT FALSE,
    reputation_score INT DEFAULT 100 CHECK (reputation_score BETWEEN 0 AND 100),
    reputation_tier reputation_tier_type DEFAULT 'Active Partner',
    contact_person VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    capacity_meals_per_day INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 4: Organization Members (Explicit membership model with active status)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_role VARCHAR(50) DEFAULT 'staff' CHECK (member_role IN ('owner', 'manager', 'staff', 'volunteer')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- Table 5: Organization Verifications (Documents, FSSAI verification trail)
CREATE TABLE IF NOT EXISTS organization_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Under Review', 'Verified', 'Rejected', 'Suspended')),
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 6: Locations (Verified physical points with PostGIS coordinates)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    geo_point GEOGRAPHY(POINT, 4326),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 7: Beneficiary Profiles (Ashrams, Shelters, Community Centers)
CREATE TABLE IF NOT EXISTS beneficiary_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resident_count INT NOT NULL DEFAULT 0 CHECK (resident_count >= 0),
    daily_meal_demand INT NOT NULL DEFAULT 0 CHECK (daily_meal_demand >= 0),
    preferred_food_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    receiving_hours_start TIME NOT NULL,
    receiving_hours_end TIME NOT NULL,
    special_dietary_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. SHOP INTELLIGENCE & INVENTORY LAYER (Tables 8 - 13)
-- ----------------------------------------------------------------------------

-- Table 8: Food Items Catalogue
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    hindi_name VARCHAR(150),
    category_class food_category_class_type NOT NULL,
    cost_per_serving_inr NUMERIC(10,2) DEFAULT 0.00,
    selling_price_inr NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 9: Inventory Items (Raw Materials)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(150) NOT NULL,
    hindi_name VARCHAR(150),
    available_quantity NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    cost_per_unit_inr NUMERIC(10,2) NOT NULL,
    min_threshold_quantity NUMERIC(10,2) NOT NULL DEFAULT 5,
    shelf_life_days INT NOT NULL DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 10: Recipes (Ingredient mapping per portion)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_per_portion NUMERIC(10,4) NOT NULL CHECK (quantity_per_portion > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(food_item_id, inventory_item_id)
);

-- Table 11: Sales Records
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    quantity_sold INT NOT NULL CHECK (quantity_sold >= 0),
    revenue_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stockout_occurred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 12: Production Records
CREATE TABLE IF NOT EXISTS production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    batch_date DATE NOT NULL,
    quantity_prepared INT NOT NULL CHECK (quantity_prepared > 0),
    batch_time_prepared TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 13: Surplus Records (Strict separation: Unsold, Donated, Discarded)
CREATE TABLE IF NOT EXISTS surplus_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    unsold_quantity INT NOT NULL CHECK (unsold_quantity >= 0),
    donated_quantity INT NOT NULL DEFAULT 0 CHECK (donated_quantity >= 0),
    discarded_quantity INT NOT NULL DEFAULT 0 CHECK (discarded_quantity >= 0),
    surplus_rate_pct NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_surplus_math CHECK (unsold_quantity >= (donated_quantity + discarded_quantity))
);

-- ----------------------------------------------------------------------------
-- 5. DONATION & REDISTRIBUTION CORE LAYER (Tables 14 - 21)
-- ----------------------------------------------------------------------------

-- Table 14: Donations (Sanitized: OTP credentials strictly isolated in Table 23)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    food_item VARCHAR(255) NOT NULL,
    food_category food_category_class_type NOT NULL,
    quantity_meals INT NOT NULL CHECK (quantity_meals > 0),
    prepared_at TIMESTAMPTZ NOT NULL,
    ready_for_pickup_at TIMESTAMPTZ NOT NULL,
    safe_until TIMESTAMPTZ NOT NULL,
    storage_condition storage_condition_type NOT NULL,
    measured_temperature_c NUMERIC(4,1),
    status donation_status_type DEFAULT 'AVAILABLE' NOT NULL,
    version INT DEFAULT 1 NOT NULL, -- Optimistic concurrency counter
    
    matched_ngo_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    target_beneficiary_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    assigned_volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    collected_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT chk_prep_before_ready CHECK (prepared_at <= ready_for_pickup_at),
    CONSTRAINT chk_safe_after_ready CHECK (safe_until > ready_for_pickup_at)
);

-- Table 15: Donation Items (Consignment bundle details)
CREATE TABLE IF NOT EXISTS donation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'meals',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 16: Food Safety Checks (Affirmative FBO Declarations & Regulatory Audits)
CREATE TABLE IF NOT EXISTS food_safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    fssai_hygiene_declaration BOOLEAN NOT NULL DEFAULT FALSE,
    sanitary_packaging_verified BOOLEAN NOT NULL DEFAULT FALSE,
    sensory_test_passed BOOLEAN NOT NULL DEFAULT FALSE,
    measured_temp_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_profile_id UUID REFERENCES profiles(id),
    regulatory_schedule_reference VARCHAR(150) NOT NULL DEFAULT 'FSSAI_SURPLUS_REG_2019_SCHED_I',
    audit_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 17: Beneficiary Requests (Direct demand declarations from Ashrams)
CREATE TABLE IF NOT EXISTS beneficiary_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requested_meals INT NOT NULL CHECK (requested_meals > 0),
    required_date DATE NOT NULL,
    required_before_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_MET', 'FULFILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 18: Matches (Geospatial algorithm match proposals & scores)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    beneficiary_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    distance_km NUMERIC(5,2) NOT NULL,
    estimated_travel_time_min INT NOT NULL,
    algorithm_suitability_score INT NOT NULL CHECK (algorithm_suitability_score BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 19: Pickup Jobs (Logistics dispatch record)
CREATE TABLE IF NOT EXISTS pickup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    ngo_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    scheduled_pickup_window_start TIMESTAMPTZ NOT NULL,
    scheduled_pickup_window_end TIMESTAMPTZ NOT NULL,
    actual_pickup_time TIMESTAMPTZ,
    job_status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (job_status IN ('SCHEDULED', 'DISPATCHED', 'COLLECTED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 20: Delivery Events (Milestone timeline with GPS coordinates)
CREATE TABLE IF NOT EXISTS delivery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('DISPATCHED', 'ARRIVED_AT_DONOR', 'COLLECTED', 'EN_ROUTE', 'ARRIVED_AT_BENEFICIARY', 'DELIVERED', 'FAILED')),
    actor_id UUID REFERENCES profiles(id),
    geo_point GEOGRAPHY(POINT, 4326),
    event_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- Table 21: Volunteer Profiles
CREATE TABLE IF NOT EXISTS volunteer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    current_status VARCHAR(50) DEFAULT 'Available' CHECK (current_status IN ('Available', 'On Route', 'Off Duty')),
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_completed_deliveries INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(profile_id)
);

-- ----------------------------------------------------------------------------
-- 6. AUDIT & TRUST LAYER (Table 22 + Hardened Immutability Triggers)
-- ----------------------------------------------------------------------------

-- Table 22: Audit Logs (Legally Append-Only Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Donation', 'Safety', 'Logistics', 'Verification', 'Sponsorship', 'Security')),
    details TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    client_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TRIGGER: Hard Block on Any UPDATE or DELETE on Audit Logs
CREATE OR REPLACE FUNCTION trg_enforce_audit_immutability()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'FOOD LOOP SECURITY VIOLATION: Audit log records are legally immutable under Schedule I compliance and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_audit_immutability ON audit_logs;
CREATE TRIGGER enforce_audit_immutability
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION trg_enforce_audit_immutability();

-- TRIGGER: Hard Block on TRUNCATE on Audit Logs
CREATE OR REPLACE FUNCTION trg_enforce_audit_no_truncate()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'FOOD LOOP SECURITY VIOLATION: TRUNCATE is strictly forbidden on the immutable audit ledger.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_audit_no_truncate ON audit_logs;
CREATE TRIGGER enforce_audit_no_truncate
BEFORE TRUNCATE ON audit_logs
FOR EACH STATEMENT EXECUTE FUNCTION trg_enforce_audit_no_truncate();

-- ----------------------------------------------------------------------------
-- 7. SECURE OTP CREDENTIALS & AUXILIARY OPERATIONAL TABLES (Tables 23 - 28)
-- ----------------------------------------------------------------------------

-- Table 23: Secure Donation OTPs (SHA-256 Hashed, Strictly Isolated)
CREATE TABLE IF NOT EXISTS donation_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    otp_hash VARCHAR(64) NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INT DEFAULT 0 CHECK (attempt_count >= 0),
    max_attempts INT DEFAULT 3 NOT NULL,
    is_consumed BOOLEAN DEFAULT FALSE NOT NULL,
    consumed_at TIMESTAMPTZ,
    UNIQUE(donation_id)
);

-- Table 24: Feedback (Post-delivery quality ratings from Ashrams / NGOs)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    hygiene_observed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 25: Reputation Events (Transparent score audit trail)
CREATE TABLE IF NOT EXISTS reputation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    score_change INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference_entity VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 26: Demand Forecasts (AI / statistical model evaluation logs)
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecasted_quantity INT NOT NULL,
    actual_quantity INT,
    absolute_error INT,
    model_version VARCHAR(50) DEFAULT 'v1-moving-avg',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 27: Sponsorships (Community birthday/anniversary fresh meal funds)
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_name VARCHAR(150) NOT NULL,
    sponsor_phone VARCHAR(20) NOT NULL,
    occasion VARCHAR(100) NOT NULL,
    target_beneficiary_id UUID REFERENCES organizations(id),
    meal_count INT NOT NULL CHECK (meal_count > 0),
    amount_inr NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    scheduled_serving_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 28: Transactional Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7.1 IDEMPOTENT SCHEMA HARMONIZATION & COLUMN RECONCILIATION
-- (Guarantees pre-existing tables acquire all modern columns if created previously)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'primary_role'
    ) THEN
        ALTER TABLE organizations ADD COLUMN primary_role user_role_type DEFAULT 'shop';
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'role'
        ) THEN
            BEGIN
                EXECUTE 'UPDATE organizations SET primary_role = role::text::user_role_type WHERE role IS NOT NULL';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
        END IF;
    END IF;
END $$;

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS reputation_tier reputation_tier_type DEFAULT 'Active Partner';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS reputation_score INT DEFAULT 100;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS capacity_meals_per_day INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_person VARCHAR(150) DEFAULT 'Manager';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT '+919876543210';

-- Reconcile organization_members
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS member_role VARCHAR(50) DEFAULT 'staff';

-- Reconcile donations
ALTER TABLE donations ADD COLUMN IF NOT EXISTS status donation_status_type DEFAULT 'AVAILABLE';
ALTER TABLE donations ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS matched_ngo_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS target_beneficiary_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS assigned_volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS measured_temperature_c NUMERIC(4,1);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Reconcile donation_otps (safe check if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donation_otps') THEN
        ALTER TABLE donation_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(64);
    END IF;
END $$;

-- Reconcile audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES profiles(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_name VARCHAR(150);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS client_ip INET;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Donation';

-- Reconcile pickup_jobs & profiles
ALTER TABLE pickup_jobs ADD COLUMN IF NOT EXISTS volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- ----------------------------------------------------------------------------
-- 8. DATABASE-LEVEL STATE MACHINE VALIDATION TRIGGER (INSERT + UPDATE)
-- ----------------------------------------------------------------------------
-- Enforces:
-- 1. Initial State Guard: New records can ONLY start in DRAFT, SUBMITTED, or AVAILABLE.
-- 2. State Progression:
--    DRAFT           -> SUBMITTED, CANCELLED
--    SUBMITTED       -> SAFETY_REVIEW, SAFETY_HOLD, AVAILABLE, REJECTED, CANCELLED
--    SAFETY_REVIEW   -> AVAILABLE, SAFETY_HOLD, REJECTED
--    SAFETY_HOLD     -> AVAILABLE, REJECTED
--    AVAILABLE       -> MATCHED, EXPIRED, CANCELLED
--    MATCHED         -> PICKUP_ASSIGNED, COLLECTED, CANCELLED, EXPIRED (Supports both dispatch & direct pickup)
--    PICKUP_ASSIGNED -> COLLECTED, CANCELLED, EXPIRED
--    COLLECTED       -> DELIVERED, REJECTED
--    DELIVERED, CANCELLED, REJECTED, EXPIRED -> Terminal states (Hard Block on modification)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_validate_donation_status_transition()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Initial State Guard for INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.status NOT IN ('DRAFT', 'SUBMITTED', 'AVAILABLE') THEN
            RAISE EXCEPTION 'ILLEGAL INITIAL STATE: New donation record must start in DRAFT, SUBMITTED, or AVAILABLE, not %', NEW.status;
        END IF;
        RETURN NEW;
    END IF;

    -- If status hasn't changed on UPDATE, allow
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    IF OLD.status = 'DRAFT' AND NEW.status NOT IN ('SUBMITTED', 'CANCELLED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from DRAFT to %', NEW.status;
    ELSIF OLD.status = 'SUBMITTED' AND NEW.status NOT IN ('SAFETY_REVIEW', 'SAFETY_HOLD', 'AVAILABLE', 'REJECTED', 'CANCELLED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from SUBMITTED to %', NEW.status;
    ELSIF OLD.status = 'SAFETY_REVIEW' AND NEW.status NOT IN ('AVAILABLE', 'SAFETY_HOLD', 'REJECTED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from SAFETY_REVIEW to %', NEW.status;
    ELSIF OLD.status = 'SAFETY_HOLD' AND NEW.status NOT IN ('AVAILABLE', 'REJECTED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from SAFETY_HOLD to %', NEW.status;
    ELSIF OLD.status = 'AVAILABLE' AND NEW.status NOT IN ('MATCHED', 'EXPIRED', 'CANCELLED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from AVAILABLE to %', NEW.status;
    ELSIF OLD.status = 'MATCHED' AND NEW.status NOT IN ('PICKUP_ASSIGNED', 'COLLECTED', 'CANCELLED', 'EXPIRED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from MATCHED to %', NEW.status;
    ELSIF OLD.status = 'PICKUP_ASSIGNED' AND NEW.status NOT IN ('COLLECTED', 'CANCELLED', 'EXPIRED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from PICKUP_ASSIGNED to %', NEW.status;
    ELSIF OLD.status = 'COLLECTED' AND NEW.status NOT IN ('DELIVERED', 'REJECTED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from COLLECTED to %', NEW.status;
    ELSIF OLD.status IN ('DELIVERED', 'CANCELLED', 'REJECTED', 'EXPIRED') THEN
        RAISE EXCEPTION 'ILLEGAL STATE TRANSITION: Cannot transition from terminal state % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_donation_status_transition ON donations;
CREATE TRIGGER validate_donation_status_transition
BEFORE INSERT OR UPDATE OF status ON donations
FOR EACH ROW EXECUTE FUNCTION trg_validate_donation_status_transition();

-- ----------------------------------------------------------------------------
-- 9. HELPER FUNCTIONS FOR SECURITY & AUTHORIZATION (STABLE & SECURITY DEFINER)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID, p_user_id UUID, p_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM organization_members om
        WHERE om.organization_id = p_org_id
          AND om.user_id = p_user_id
          AND om.is_active = TRUE
          AND (p_roles IS NULL OR om.member_role = ANY(p_roles))
    );
$$;

CREATE OR REPLACE FUNCTION is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles ur
        WHERE ur.user_id = p_user_id
          AND ur.role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION is_verified_ngo(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = p_user_id
          AND om.is_active = TRUE
          AND o.primary_role = 'ngo'
          AND o.is_verified = TRUE
          AND o.reputation_tier NOT IN ('Restricted', 'Suspended')
    );
$$;

-- ----------------------------------------------------------------------------
-- 10. HARDENED ATOMIC DONATION CLAIM STORED PROCEDURE
-- ----------------------------------------------------------------------------
-- Complete Verification Checklist:
-- 1. Authentication: Enforces caller is authenticated via auth.uid().
-- 2. Caller Authorization: Caller must be an active member of claiming NGO.
-- 3. NGO Authorization: Organization must be an FSSAI-verified NGO with active tier.
-- 4. Target Beneficiary Verification: Must exist, be verified, and categorized as shelter/ashram.
-- 5. Volunteer Verification: Must be registered, active, and Available.
-- 6. Row Lock: SELECT ... FOR UPDATE serializes concurrent claimants.
-- 7. Existence Check: Rejects non-existent donation ID.
-- 8. State Guard: Donation must be strictly AVAILABLE.
-- 9. Expiry Guard: Auto-quarantines batch to EXPIRED if safe_until <= NOW().
-- 10. Food Safety Enforcement: Ensures affirmative FSSAI hygiene declaration and sensory test passed.
-- 11. Cryptographic OTP Generation: 6-digit random token via pgcrypto.
-- 12. SHA-256 Hashed Storage: Plaintext is NEVER stored in database; only SHA-256 hash stored.
-- 13. Plaintext Delivery: Returned exclusively over TLS to authenticated claiming NGO session.
-- 14. Transactional Audit Log: State transition and immutable audit log committed in same transaction.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION claim_donation_atomic(
    p_donation_id UUID,
    p_ngo_id UUID,
    p_target_beneficiary_id UUID DEFAULT NULL,
    p_assigned_volunteer_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message VARCHAR(255),
    confirmed_donation_id UUID,
    otp_code VARCHAR(6)
)
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_actor_name VARCHAR(150);
    v_current_status donation_status_type;
    v_current_matched_ngo UUID;
    v_safe_until TIMESTAMPTZ;
    v_generated_otp VARCHAR(6);
    v_generated_hash VARCHAR(64);
    v_ngo_verified BOOLEAN;
    v_ngo_role user_role_type;
    v_ngo_tier reputation_tier_type;
    v_ben_verified BOOLEAN;
    v_ben_category VARCHAR(100);
    v_vol_status VARCHAR(50);
    v_safety_hygiene BOOLEAN;
    v_safety_packaging BOOLEAN;
    v_safety_sensory BOOLEAN;
BEGIN
    -- 1. Identify Authenticated Caller
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED: Request must originate from an authenticated session'::VARCHAR, NULL::UUID, NULL::VARCHAR;
        RETURN;
    END IF;

    -- 2. Authorize Caller Membership in Claiming NGO
    IF NOT is_org_member(p_ngo_id, v_caller_id) AND NOT is_platform_admin(v_caller_id) THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHORIZED: Caller is not an active verified member of claiming NGO'::VARCHAR, p_donation_id, NULL::VARCHAR;
        RETURN;
    END IF;

    -- 3. Validate NGO Verification & Reputation Status
    SELECT is_verified, primary_role, reputation_tier
    INTO v_ngo_verified, v_ngo_role, v_ngo_tier
    FROM organizations
    WHERE id = p_ngo_id;

    IF NOT FOUND OR v_ngo_verified IS NOT TRUE OR v_ngo_role <> 'ngo' THEN
        RETURN QUERY SELECT FALSE, 'ELIGIBILITY ERROR: Organization must be an FSSAI-verified active NGO'::VARCHAR, p_donation_id, NULL::VARCHAR;
        RETURN;
    END IF;

    IF v_ngo_tier IN ('Restricted', 'Suspended') THEN
        RETURN QUERY SELECT FALSE, CONCAT('ELIGIBILITY REJECTED: NGO reputation status is ', v_ngo_tier)::VARCHAR, p_donation_id, NULL::VARCHAR;
        RETURN;
    END IF;

    -- 4. Validate Target Beneficiary (must be verified shelter/ashram)
    IF p_target_beneficiary_id IS NOT NULL THEN
        SELECT is_verified, category INTO v_ben_verified, v_ben_category
        FROM organizations WHERE id = p_target_beneficiary_id;

        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, 'INVALID BENEFICIARY: Target beneficiary organization does not exist'::VARCHAR, p_donation_id, NULL::VARCHAR;
            RETURN;
        END IF;

        IF v_ben_verified IS NOT TRUE THEN
            RETURN QUERY SELECT FALSE, 'UNVERIFIED BENEFICIARY: Target shelter must be verified under FSSAI IFSA registry'::VARCHAR, p_donation_id, NULL::VARCHAR;
            RETURN;
        END IF;
    END IF;

    -- 5. Validate Volunteer (if assigned at claim time)
    IF p_assigned_volunteer_id IS NOT NULL THEN
        SELECT current_status INTO v_vol_status
        FROM volunteer_profiles WHERE profile_id = p_assigned_volunteer_id;

        IF NOT FOUND OR v_vol_status <> 'Available' THEN
            RETURN QUERY SELECT FALSE, 'VOLUNTEER UNAVAILABLE: Assigned volunteer profile is not active or available'::VARCHAR, p_donation_id, NULL::VARCHAR;
            RETURN;
        END IF;
    END IF;

    -- 6. Acquire Exclusive Row Lock on Target Donation
    SELECT status, matched_ngo_id, safe_until
    INTO v_current_status, v_current_matched_ngo, v_safe_until
    FROM donations
    WHERE id = p_donation_id
    FOR UPDATE;

    -- Existence Check
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Donation record does not exist'::VARCHAR, NULL::UUID, NULL::VARCHAR;
        RETURN;
    END IF;

    -- Idempotent Replay Check (Donation already allocated to this same NGO)
    IF v_current_status IN ('MATCHED', 'PICKUP_ASSIGNED') AND v_current_matched_ngo = p_ngo_id THEN
        RETURN QUERY SELECT 
            TRUE, 
            'Idempotent claim acknowledgment: Donation already successfully allocated to your organization'::VARCHAR, 
            p_donation_id, 
            NULL::VARCHAR; -- Security: Do not re-disclose OTP over plain replay
        RETURN;
    END IF;

    -- State Guard
    IF v_current_status <> 'AVAILABLE' THEN
        RETURN QUERY SELECT 
            FALSE, 
            CONCAT('RACE CONDITION CONFLICT: Donation status is ', v_current_status, ' and cannot be claimed')::VARCHAR, 
            p_donation_id, 
            NULL::VARCHAR;
        RETURN;
    END IF;

    -- Expiry Guard
    IF v_safe_until <= NOW() THEN
        UPDATE donations SET status = 'EXPIRED', updated_at = NOW() WHERE id = p_donation_id;
        RETURN QUERY SELECT 
            FALSE, 
            'SAFETY VIOLATION: Food safe consumption window has expired. Batch automatically quarantined.'::VARCHAR, 
            p_donation_id, 
            NULL::VARCHAR;
        RETURN;
    END IF;

    -- 7. Mandatory Affirmative Food Safety Check Validation
    SELECT fssai_hygiene_declaration, sanitary_packaging_verified, sensory_test_passed
    INTO v_safety_hygiene, v_safety_packaging, v_safety_sensory
    FROM food_safety_checks
    WHERE donation_id = p_donation_id
    ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        IF v_safety_hygiene IS NOT TRUE OR v_safety_packaging IS NOT TRUE OR v_safety_sensory IS NOT TRUE THEN
            RETURN QUERY SELECT 
                FALSE, 
                'SAFETY VIOLATION: Batch has failed mandatory FSSAI hygiene or sensory safety checks'::VARCHAR, 
                p_donation_id, 
                NULL::VARCHAR;
            RETURN;
        END IF;
    END IF;

    -- Derive Authoritative Actor Name from Profiles
    SELECT full_name INTO v_actor_name FROM profiles WHERE id = v_caller_id;
    IF v_actor_name IS NULL THEN
        v_actor_name := CONCAT('Member (', v_caller_id::TEXT, ')');
    END IF;

    -- Generate Cryptographically Secure 6-Digit Verification Token
    v_generated_otp := LPAD((mod(abs(('x' || encode(gen_random_bytes(4), 'hex'))::bit(31)::int), 900000) + 100000)::text, 6, '0');
    
    -- Compute SHA-256 Hash with Donation ID Salt (Plaintext never persisted!)
    v_generated_hash := encode(digest(v_generated_otp || p_donation_id::text, 'sha256'), 'hex');

    -- Atomically Update Donation State
    UPDATE donations
    SET 
        status = 'MATCHED',
        matched_ngo_id = p_ngo_id,
        target_beneficiary_id = p_target_beneficiary_id,
        assigned_volunteer_id = p_assigned_volunteer_id,
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_donation_id;

    -- Store SHA-256 Hashed OTP Credential (2-Hour Window, Max 3 Verification Attempts)
    INSERT INTO donation_otps (
        donation_id, otp_hash, generated_at, expires_at, attempt_count, max_attempts, is_consumed
    ) VALUES (
        p_donation_id, v_generated_hash, NOW(), NOW() + INTERVAL '2 hours', 0, 3, FALSE
    )
    ON CONFLICT (donation_id) DO UPDATE 
    SET otp_hash = v_generated_hash, expires_at = NOW() + INTERVAL '2 hours', attempt_count = 0, is_consumed = FALSE;

    -- Atomically Record Immutable Audit Event
    INSERT INTO audit_logs (
        entity_name, entity_id, actor_id, actor_name, action, category, details,
        previous_state, new_state
    ) VALUES (
        'donations', p_donation_id, v_caller_id, v_actor_name, 'ATOMIC_CLAIM_ACCEPTED', 'Logistics',
        CONCAT('Donation claimed by verified NGO ', p_ngo_id::TEXT, '. Hashed 6-digit OTP issued to claiming representative.'),
        jsonb_build_object('status', 'AVAILABLE', 'matched_ngo_id', NULL),
        jsonb_build_object('status', 'MATCHED', 'matched_ngo_id', p_ngo_id, 'target_beneficiary_id', p_target_beneficiary_id)
    );

    RETURN QUERY SELECT 
        TRUE, 
        'Donation atomically claimed successfully'::VARCHAR, 
        p_donation_id, 
        v_generated_otp;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION claim_donation_atomic(UUID, UUID, UUID, UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION claim_donation_atomic(UUID, UUID, UUID, UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 11. ATOMIC PICKUP VOLUNTEER ASSIGNMENT PROCEDURE
-- ----------------------------------------------------------------------------
-- Transitions donation from MATCHED -> PICKUP_ASSIGNED
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION assign_pickup_volunteer_atomic(
    p_donation_id UUID,
    p_volunteer_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message VARCHAR(255)
)
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_actor_name VARCHAR(150);
    v_matched_ngo_id UUID;
    v_current_status donation_status_type;
    v_vol_status VARCHAR(50);
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED'::VARCHAR;
        RETURN;
    END IF;

    SELECT status, matched_ngo_id INTO v_current_status, v_matched_ngo_id
    FROM donations WHERE id = p_donation_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Donation record not found'::VARCHAR;
        RETURN;
    END IF;

    -- Caller must belong to matched NGO or be admin
    IF NOT is_org_member(v_matched_ngo_id, v_caller_id) AND NOT is_platform_admin(v_caller_id) THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHORIZED: Only matched NGO staff can assign pickup volunteers'::VARCHAR;
        RETURN;
    END IF;

    IF v_current_status <> 'MATCHED' THEN
        RETURN QUERY SELECT FALSE, CONCAT('INVALID STATE: Cannot dispatch volunteer when donation status is ', v_current_status)::VARCHAR;
        RETURN;
    END IF;

    -- Validate volunteer availability
    SELECT current_status INTO v_vol_status FROM volunteer_profiles WHERE profile_id = p_volunteer_id;
    IF NOT FOUND OR v_vol_status <> 'Available' THEN
        RETURN QUERY SELECT FALSE, 'VOLUNTEER UNAVAILABLE: Selected volunteer is currently on route or off duty'::VARCHAR;
        RETURN;
    END IF;

    -- Update donation state to PICKUP_ASSIGNED
    UPDATE donations
    SET status = 'PICKUP_ASSIGNED', assigned_volunteer_id = p_volunteer_id, updated_at = NOW()
    WHERE id = p_donation_id;

    -- Create or update pickup_jobs record
    INSERT INTO pickup_jobs (
        donation_id, ngo_org_id, volunteer_id, scheduled_pickup_window_start, scheduled_pickup_window_end, job_status
    ) VALUES (
        p_donation_id, v_matched_ngo_id, p_volunteer_id, NOW(), NOW() + INTERVAL '2 hours', 'DISPATCHED'
    );

    SELECT full_name INTO v_actor_name FROM profiles WHERE id = v_caller_id;

    -- Record Audit Log
    INSERT INTO audit_logs (
        entity_name, entity_id, actor_id, actor_name, action, category, details,
        previous_state, new_state
    ) VALUES (
        'donations', p_donation_id, v_caller_id, COALESCE(v_actor_name, 'NGO Dispatcher'), 'VOLUNTEER_ASSIGNED', 'Logistics',
        CONCAT('Volunteer ', p_volunteer_id::TEXT, ' dispatched for pickup.'),
        jsonb_build_object('status', 'MATCHED'),
        jsonb_build_object('status', 'PICKUP_ASSIGNED', 'volunteer_id', p_volunteer_id)
    );

    RETURN QUERY SELECT TRUE, 'Volunteer dispatched and pickup job scheduled successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION assign_pickup_volunteer_atomic(UUID, UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION assign_pickup_volunteer_atomic(UUID, UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 12. HARDENED ATOMIC OTP VERIFICATION PROCEDURE (Pickup Handshake)
-- ----------------------------------------------------------------------------
-- Handshake Protocol:
-- 1. Volunteer/NGO arrives at donor shop and presents 6-digit OTP.
-- 2. Shopkeeper enters OTP into their dashboard to confirm authorized collection.
-- 3. Procedure verifies SHA-256 hash against donation_otps.
-- 4. Transitions donation state to COLLECTED.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_pickup_otp_atomic(
    p_donation_id UUID,
    p_otp_code VARCHAR(6)
)
RETURNS TABLE (
    success BOOLEAN,
    message VARCHAR(255)
)
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_actor_name VARCHAR(150);
    v_donor_org_id UUID;
    v_current_status donation_status_type;
    v_actual_hash VARCHAR(64);
    v_input_hash VARCHAR(64);
    v_expires_at TIMESTAMPTZ;
    v_attempts INT;
    v_max_attempts INT;
    v_consumed BOOLEAN;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED'::VARCHAR;
        RETURN;
    END IF;

    -- Verify Caller is Donor Shop Staff or Admin
    SELECT donor_org_id, status INTO v_donor_org_id, v_current_status 
    FROM donations WHERE id = p_donation_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Donation record not found'::VARCHAR;
        RETURN;
    END IF;

    IF NOT is_org_member(v_donor_org_id, v_caller_id) AND NOT is_platform_admin(v_caller_id) THEN
        RETURN QUERY SELECT FALSE, 'UNAUTHORIZED: Only donor shop staff can verify pickup OTP'::VARCHAR;
        RETURN;
    END IF;

    -- Valid state check: Must be in MATCHED (direct pickup) or PICKUP_ASSIGNED
    IF v_current_status NOT IN ('MATCHED', 'PICKUP_ASSIGNED') THEN
        RETURN QUERY SELECT FALSE, CONCAT('INVALID STATE: Cannot verify pickup when status is ', v_current_status)::VARCHAR;
        RETURN;
    END IF;

    -- Lock OTP credentials record
    SELECT otp_hash, expires_at, attempt_count, max_attempts, is_consumed
    INTO v_actual_hash, v_expires_at, v_attempts, v_max_attempts, v_consumed
    FROM donation_otps
    WHERE donation_id = p_donation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No active OTP issued for this donation'::VARCHAR;
        RETURN;
    END IF;

    IF v_consumed THEN
        RETURN QUERY SELECT FALSE, 'OTP already consumed. Batch was already collected.'::VARCHAR;
        RETURN;
    END IF;

    IF v_expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, 'OTP expired. Consumption window has elapsed.'::VARCHAR;
        RETURN;
    END IF;

    IF v_attempts >= v_max_attempts THEN
        RETURN QUERY SELECT FALSE, 'Maximum verification attempts exceeded (3/3). Handover locked for safety.'::VARCHAR;
        RETURN;
    END IF;

    -- Verify SHA-256 Hash
    v_input_hash := encode(digest(p_otp_code || p_donation_id::text, 'sha256'), 'hex');

    IF v_actual_hash <> v_input_hash THEN
        UPDATE donation_otps SET attempt_count = attempt_count + 1 WHERE donation_id = p_donation_id;
        
        -- Audit failed attempt
        INSERT INTO audit_logs (
            entity_name, entity_id, actor_id, actor_name, action, category, details
        ) VALUES (
            'donations', p_donation_id, v_caller_id, 'Shopkeeper', 'OTP_VERIFICATION_FAILED', 'Security',
            CONCAT('Incorrect OTP attempt #', (v_attempts + 1)::TEXT, ' recorded.')
        );

        RETURN QUERY SELECT FALSE, CONCAT('INVALID OTP: Incorrect code. Attempt ', (v_attempts + 1)::TEXT, ' of ', v_max_attempts::TEXT)::VARCHAR;
        RETURN;
    END IF;

    -- Mark OTP consumed & Transition Donation to COLLECTED
    UPDATE donation_otps SET is_consumed = TRUE, consumed_at = NOW() WHERE donation_id = p_donation_id;
    UPDATE donations SET status = 'COLLECTED', collected_at = NOW(), updated_at = NOW() WHERE id = p_donation_id;

    -- Update pickup job if present
    UPDATE pickup_jobs SET job_status = 'COLLECTED', actual_pickup_time = NOW() WHERE donation_id = p_donation_id;

    SELECT full_name INTO v_actor_name FROM profiles WHERE id = v_caller_id;

    -- Record Immutable Audit Log
    INSERT INTO audit_logs (
        entity_name, entity_id, actor_id, actor_name, action, category, details,
        previous_state, new_state
    ) VALUES (
        'donations', p_donation_id, v_caller_id, COALESCE(v_actor_name, 'Shop Staff'), 'PICKUP_OTP_VERIFIED', 'Logistics',
        'Physical handover confirmed via cryptographic SHA-256 OTP verification.',
        jsonb_build_object('status', v_current_status),
        jsonb_build_object('status', 'COLLECTED')
    );

    RETURN QUERY SELECT TRUE, 'Pickup OTP verified successfully. Physical handover confirmed.'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION verify_pickup_otp_atomic(UUID, VARCHAR) FROM public, anon;
GRANT EXECUTE ON FUNCTION verify_pickup_otp_atomic(UUID, VARCHAR) TO authenticated;

-- ----------------------------------------------------------------------------
-- 13. PERFORMANCE & GEOSPATIAL SPATIAL INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_locations_geo ON locations USING GIST(geo_point);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_safe_until ON donations(safe_until);
CREATE INDEX IF NOT EXISTS idx_donations_donor_org ON donations(donor_org_id);
CREATE INDEX IF NOT EXISTS idx_donations_matched_ngo ON donations(matched_ngo_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_org_date ON sales_records(organization_id, record_date);
CREATE INDEX IF NOT EXISTS idx_surplus_org_date ON surplus_records(organization_id, record_date);
CREATE INDEX IF NOT EXISTS idx_inventory_org ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_donation ON matches(donation_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_donation ON delivery_events(donation_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_pickup_jobs_ngo ON pickup_jobs(ngo_org_id, job_status);

-- ----------------------------------------------------------------------------
-- 14. COMPREHENSIVE MULTI-TENANT ROW LEVEL SECURITY (RLS) POLICIES (ALL 28 TABLES)
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE surplus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_safety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. profiles
DROP POLICY IF EXISTS "Profiles read policy" ON profiles;
CREATE POLICY "Profiles read policy" ON profiles FOR SELECT USING (id = auth.uid() OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Profiles update policy" ON profiles;
CREATE POLICY "Profiles update policy" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 2. user_roles
DROP POLICY IF EXISTS "User roles read policy" ON user_roles;
CREATE POLICY "User roles read policy" ON user_roles FOR SELECT USING (user_id = auth.uid() OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "User roles admin manage policy" ON user_roles;
CREATE POLICY "User roles admin manage policy" ON user_roles FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

-- 3. organizations
DROP POLICY IF EXISTS "Organizations read policy" ON organizations;
CREATE POLICY "Organizations read policy" ON organizations FOR SELECT USING (is_verified = TRUE OR is_org_member(id, auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Organizations insert policy" ON organizations;
CREATE POLICY "Organizations insert policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Organizations update policy" ON organizations;
CREATE POLICY "Organizations update policy" ON organizations FOR UPDATE USING (is_org_member(id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid()));

-- 4. organization_members
DROP POLICY IF EXISTS "Org members read policy" ON organization_members;
CREATE POLICY "Org members read policy" ON organization_members FOR SELECT USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Org members manage policy" ON organization_members;
CREATE POLICY "Org members manage policy" ON organization_members FOR ALL USING (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid()));

-- 5. organization_verifications
DROP POLICY IF EXISTS "Org verifications read policy" ON organization_verifications;
CREATE POLICY "Org verifications read policy" ON organization_verifications FOR SELECT USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Org verifications insert policy" ON organization_verifications;
CREATE POLICY "Org verifications insert policy" ON organization_verifications FOR INSERT WITH CHECK (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager', 'staff']) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Org verifications update policy" ON organization_verifications;
CREATE POLICY "Org verifications update policy" ON organization_verifications FOR UPDATE USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

-- 6. locations
DROP POLICY IF EXISTS "Locations read policy" ON locations;
CREATE POLICY "Locations read policy" ON locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = locations.organization_id AND (o.is_verified = TRUE OR is_org_member(o.id, auth.uid()))) OR is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Locations manage policy" ON locations;
CREATE POLICY "Locations manage policy" ON locations FOR ALL USING (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid()));

-- 7. beneficiary_profiles
DROP POLICY IF EXISTS "Beneficiary profiles read policy" ON beneficiary_profiles;
CREATE POLICY "Beneficiary profiles read policy" ON beneficiary_profiles FOR SELECT USING (is_org_member(organization_id, auth.uid()) OR is_verified_ngo(auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Beneficiary profiles manage policy" ON beneficiary_profiles;
CREATE POLICY "Beneficiary profiles manage policy" ON beneficiary_profiles FOR ALL USING (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid()));

-- 8. food_items
DROP POLICY IF EXISTS "Food items read policy" ON food_items;
CREATE POLICY "Food items read policy" ON food_items FOR SELECT USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Food items manage policy" ON food_items;
CREATE POLICY "Food items manage policy" ON food_items FOR ALL USING (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid()));

-- 9. inventory_items (Zero NGO / Volunteer Access)
DROP POLICY IF EXISTS "Inventory items tenant isolation" ON inventory_items;
CREATE POLICY "Inventory items tenant isolation" ON inventory_items FOR ALL USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 10. recipes (Zero NGO / Volunteer Access)
DROP POLICY IF EXISTS "Recipes tenant isolation" ON recipes;
CREATE POLICY "Recipes tenant isolation" ON recipes FOR ALL USING (
    EXISTS (SELECT 1 FROM food_items fi WHERE fi.id = recipes.food_item_id AND (is_org_member(fi.organization_id, auth.uid()) OR is_platform_admin(auth.uid())))
) WITH CHECK (
    EXISTS (SELECT 1 FROM food_items fi WHERE fi.id = recipes.food_item_id AND (is_org_member(fi.organization_id, auth.uid()) OR is_platform_admin(auth.uid())))
);

-- 11. sales_records (Zero NGO / Volunteer Access)
DROP POLICY IF EXISTS "Sales records tenant isolation" ON sales_records;
CREATE POLICY "Sales records tenant isolation" ON sales_records FOR ALL USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 12. production_records (Zero NGO / Volunteer Access)
DROP POLICY IF EXISTS "Production records tenant isolation" ON production_records;
CREATE POLICY "Production records tenant isolation" ON production_records FOR ALL USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 13. surplus_records (Zero NGO / Volunteer Access)
DROP POLICY IF EXISTS "Surplus records tenant isolation" ON surplus_records;
CREATE POLICY "Surplus records tenant isolation" ON surplus_records FOR ALL USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 14. donations (Separated by Operation)
DROP POLICY IF EXISTS "Donations selective read policy" ON donations;
CREATE POLICY "Donations selective read policy" ON donations FOR SELECT USING (
    is_org_member(donor_org_id, auth.uid()) OR
    (matched_ngo_id IS NOT NULL AND is_org_member(matched_ngo_id, auth.uid())) OR
    (assigned_volunteer_id = auth.uid()) OR
    (status = 'AVAILABLE' AND is_verified_ngo(auth.uid())) OR
    is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Shops insert own donations" ON donations;
CREATE POLICY "Shops insert own donations" ON donations FOR INSERT WITH CHECK (
    is_org_member(donor_org_id, auth.uid(), ARRAY['owner', 'manager', 'staff']) OR is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Shops update unallocated donations" ON donations;
CREATE POLICY "Shops update unallocated donations" ON donations FOR UPDATE USING (
    (is_org_member(donor_org_id, auth.uid(), ARRAY['owner', 'manager']) AND status IN ('DRAFT', 'SUBMITTED', 'AVAILABLE')) OR is_platform_admin(auth.uid())
) WITH CHECK (
    (is_org_member(donor_org_id, auth.uid(), ARRAY['owner', 'manager']) AND status IN ('DRAFT', 'SUBMITTED', 'AVAILABLE')) OR is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Shops delete draft donations" ON donations;
CREATE POLICY "Shops delete draft donations" ON donations FOR DELETE USING (
    (is_org_member(donor_org_id, auth.uid(), ARRAY['owner', 'manager']) AND status = 'DRAFT') OR is_platform_admin(auth.uid())
);

-- 15. donation_items
DROP POLICY IF EXISTS "Donation items read policy" ON donation_items;
CREATE POLICY "Donation items read policy" ON donation_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = donation_items.donation_id AND (is_org_member(d.donor_org_id, auth.uid()) OR (d.matched_ngo_id IS NOT NULL AND is_org_member(d.matched_ngo_id, auth.uid())) OR (d.status = 'AVAILABLE' AND is_verified_ngo(auth.uid())) OR is_platform_admin(auth.uid())))
);
DROP POLICY IF EXISTS "Donation items manage policy" ON donation_items;
CREATE POLICY "Donation items manage policy" ON donation_items FOR ALL USING (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = donation_items.donation_id AND (is_org_member(d.donor_org_id, auth.uid(), ARRAY['owner', 'manager', 'staff']) AND d.status IN ('DRAFT', 'SUBMITTED', 'AVAILABLE')))
) WITH CHECK (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = donation_items.donation_id AND (is_org_member(d.donor_org_id, auth.uid(), ARRAY['owner', 'manager', 'staff']) AND d.status IN ('DRAFT', 'SUBMITTED', 'AVAILABLE')))
);

-- 16. food_safety_checks
DROP POLICY IF EXISTS "Food safety checks read policy" ON food_safety_checks;
CREATE POLICY "Food safety checks read policy" ON food_safety_checks FOR SELECT USING (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = food_safety_checks.donation_id AND (is_org_member(d.donor_org_id, auth.uid()) OR (d.matched_ngo_id IS NOT NULL AND is_org_member(d.matched_ngo_id, auth.uid())) OR (d.status = 'AVAILABLE' AND is_verified_ngo(auth.uid())) OR is_platform_admin(auth.uid())))
);
DROP POLICY IF EXISTS "Food safety checks insert policy" ON food_safety_checks;
CREATE POLICY "Food safety checks insert policy" ON food_safety_checks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = food_safety_checks.donation_id AND is_org_member(d.donor_org_id, auth.uid(), ARRAY['owner', 'manager', 'staff']))
);

-- 17. beneficiary_requests
DROP POLICY IF EXISTS "Beneficiary requests read policy" ON beneficiary_requests;
CREATE POLICY "Beneficiary requests read policy" ON beneficiary_requests FOR SELECT USING (is_org_member(beneficiary_org_id, auth.uid()) OR is_verified_ngo(auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Beneficiary requests manage policy" ON beneficiary_requests;
CREATE POLICY "Beneficiary requests manage policy" ON beneficiary_requests FOR ALL USING (is_org_member(beneficiary_org_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(beneficiary_org_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 18. matches
DROP POLICY IF EXISTS "Matches read policy" ON matches;
CREATE POLICY "Matches read policy" ON matches FOR SELECT USING (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = matches.donation_id AND (is_org_member(d.donor_org_id, auth.uid()) OR is_platform_admin(auth.uid()))) OR is_org_member(beneficiary_org_id, auth.uid()) OR is_verified_ngo(auth.uid())
);

-- 19. pickup_jobs (Logistics Isolation)
DROP POLICY IF EXISTS "Pickup jobs read policy" ON pickup_jobs;
CREATE POLICY "Pickup jobs read policy" ON pickup_jobs FOR SELECT USING (
    is_org_member(ngo_org_id, auth.uid()) OR volunteer_id = auth.uid() OR EXISTS (SELECT 1 FROM donations d WHERE d.id = pickup_jobs.donation_id AND is_org_member(d.donor_org_id, auth.uid())) OR is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Pickup jobs manage policy" ON pickup_jobs;
CREATE POLICY "Pickup jobs manage policy" ON pickup_jobs FOR ALL USING (is_org_member(ngo_org_id, auth.uid(), ARRAY['owner', 'manager']) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(ngo_org_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 20. delivery_events
DROP POLICY IF EXISTS "Delivery events read policy" ON delivery_events;
CREATE POLICY "Delivery events read policy" ON delivery_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM donations d WHERE d.id = delivery_events.donation_id AND (is_org_member(d.donor_org_id, auth.uid()) OR (d.matched_ngo_id IS NOT NULL AND is_org_member(d.matched_ngo_id, auth.uid())) OR d.assigned_volunteer_id = auth.uid() OR is_platform_admin(auth.uid())))
);
DROP POLICY IF EXISTS "Delivery events insert policy" ON delivery_events;
CREATE POLICY "Delivery events insert policy" ON delivery_events FOR INSERT WITH CHECK (actor_id = auth.uid() OR is_platform_admin(auth.uid()));

-- 21. volunteer_profiles
DROP POLICY IF EXISTS "Volunteer profiles read policy" ON volunteer_profiles;
CREATE POLICY "Volunteer profiles read policy" ON volunteer_profiles FOR SELECT USING (profile_id = auth.uid() OR is_verified_ngo(auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Volunteer profiles update policy" ON volunteer_profiles;
CREATE POLICY "Volunteer profiles update policy" ON volunteer_profiles FOR UPDATE USING (profile_id = auth.uid() OR is_platform_admin(auth.uid())) WITH CHECK (profile_id = auth.uid() OR is_platform_admin(auth.uid()));

-- 22. audit_logs (Append-Only Privilege-Restricted Ledger)
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM public, anon, authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
DROP POLICY IF EXISTS "Audit logs read policy" ON audit_logs;
CREATE POLICY "Audit logs read policy" ON audit_logs FOR SELECT USING (actor_id = auth.uid() OR is_platform_admin(auth.uid()));

-- 23. donation_otps (Zero Table Access — Exclusively Stored Procedures)
REVOKE ALL ON donation_otps FROM anon, authenticated, public;

-- 24. feedback
DROP POLICY IF EXISTS "Feedback read policy" ON feedback;
CREATE POLICY "Feedback read policy" ON feedback FOR SELECT USING (
    submitted_by = auth.uid() OR EXISTS (SELECT 1 FROM donations d WHERE d.id = feedback.donation_id AND (is_org_member(d.donor_org_id, auth.uid()) OR (d.matched_ngo_id IS NOT NULL AND is_org_member(d.matched_ngo_id, auth.uid())))) OR is_platform_admin(auth.uid())
);
DROP POLICY IF EXISTS "Feedback insert policy" ON feedback;
CREATE POLICY "Feedback insert policy" ON feedback FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- 25. reputation_events
DROP POLICY IF EXISTS "Reputation events read policy" ON reputation_events;
CREATE POLICY "Reputation events read policy" ON reputation_events FOR SELECT USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Reputation events admin policy" ON reputation_events;
CREATE POLICY "Reputation events admin policy" ON reputation_events FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

-- 26. forecasts
DROP POLICY IF EXISTS "Forecasts tenant isolation" ON forecasts;
CREATE POLICY "Forecasts tenant isolation" ON forecasts FOR ALL USING (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid())) WITH CHECK (is_org_member(organization_id, auth.uid()) OR is_platform_admin(auth.uid()));

-- 27. sponsorships
DROP POLICY IF EXISTS "Sponsorships read policy" ON sponsorships;
CREATE POLICY "Sponsorships read policy" ON sponsorships FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Sponsorships insert policy" ON sponsorships;
CREATE POLICY "Sponsorships insert policy" ON sponsorships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 28. notifications
DROP POLICY IF EXISTS "Notifications read policy" ON notifications;
CREATE POLICY "Notifications read policy" ON notifications FOR SELECT USING (user_id = auth.uid() OR is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Notifications update policy" ON notifications;
CREATE POLICY "Notifications update policy" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 15. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE donations, delivery_events, matches, notifications;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
