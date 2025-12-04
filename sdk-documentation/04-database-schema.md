# Fertily SDK - Database Schema

## Overview

The SDK uses PostgreSQL with SQLAlchemy ORM. All tables use UUID for clinic IDs and support multi-tenancy.

## Tables

### clinics
Stores clinic information and basic configuration.

```sql
CREATE TABLE clinics (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    license_number VARCHAR(100),
    established_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    sdk_enabled BOOLEAN DEFAULT FALSE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    customer_id VARCHAR(100) UNIQUE,  -- Stripe customer ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clinics_is_active ON clinics(is_active);
CREATE INDEX idx_clinics_sdk_enabled ON clinics(sdk_enabled);
CREATE INDEX idx_clinics_customer_id ON clinics(customer_id);
```

**Relationships:**
- One-to-One: `clinic_configs`
- One-to-Many: `sdk_feature_configs`, `sdk_usage_logs`, `sdk_sessions`, `user_roles`

---

### clinic_configs
Stores detailed SDK configuration for each clinic.

```sql
CREATE TABLE clinic_configs (
    id SERIAL PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    business_domain VARCHAR(255),
    contact_person VARCHAR(255),
    allowed_domains JSONB DEFAULT '[]',
    webhook_url VARCHAR(500),
    custom_branding JSONB DEFAULT '{}',
    sdk_enabled BOOLEAN DEFAULT FALSE,
    monthly_request_limit INTEGER DEFAULT 1000,
    current_month_requests INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- SDK Public Access Control
    allow_public_access BOOLEAN DEFAULT FALSE,
    
    -- SDK Visual Customization
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    accent_color VARCHAR(7) DEFAULT '#28a745',
    background_color VARCHAR(7) DEFAULT '#ffffff',
    text_color VARCHAR(7) DEFAULT '#212529',
    button_style VARCHAR(20) DEFAULT 'rounded',
    font_family VARCHAR(100) DEFAULT 'Inter, sans-serif',
    logo_url VARCHAR(500),
    custom_css TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_clinic_configs_clinic_id ON clinic_configs(clinic_id);
CREATE INDEX idx_clinic_configs_api_key ON clinic_configs(api_key);
CREATE INDEX idx_clinic_configs_sdk_enabled ON clinic_configs(sdk_enabled);
CREATE INDEX idx_clinic_configs_allow_public ON clinic_configs(allow_public_access);
```

**Fields:**
- `api_key`: Unique API key for clinic authentication (auto-generated UUID)
- `allowed_domains`: JSON array of whitelisted domains
- `custom_branding`: JSON object for additional branding settings
- `sdk_enabled`: Master switch for SDK access
- `allow_public_access`: Whether SDK requires user authentication

---

### sdk_feature_configs
Stores configuration for individual features per clinic.

```sql
CREATE TABLE sdk_feature_configs (
    id SERIAL PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    feature VARCHAR(50) NOT NULL,  -- Enum: ai_chat, ivf_prediction, etc.
    
    -- Feature Control
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    
    -- Usage Limits
    daily_limit INTEGER,
    monthly_limit INTEGER,
    current_day_usage INTEGER DEFAULT 0,
    current_month_usage INTEGER DEFAULT 0,
    
    -- UI Customization
    custom_title VARCHAR(255),
    custom_description TEXT,
    custom_css TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_clinic_feature UNIQUE (clinic_id, feature)
);

CREATE INDEX idx_sdk_feature_configs_clinic_id ON sdk_feature_configs(clinic_id);
CREATE INDEX idx_sdk_feature_configs_feature ON sdk_feature_configs(feature);
CREATE INDEX idx_sdk_feature_configs_enabled ON sdk_feature_configs(is_enabled);
```

**Feature Values:**
- `ai_chat`
- `ivf_prediction`
- `embryo_grading`
- `escrow_wallet`
- `appointment_booking`
- `cycle_tracking`
- `expert_consultation`

---

### sdk_usage_logs
Logs all SDK API requests for analytics and billing.

```sql
CREATE TABLE sdk_usage_logs (
    id SERIAL PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    
    -- Request Information
    feature VARCHAR(50),
    endpoint VARCHAR(255),
    method VARCHAR(10),  -- GET, POST, etc.
    
    -- Client Information
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),  -- IPv6 compatible
    referer_domain VARCHAR(255),
    
    -- Response Information
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    
    -- Usage Metadata
    session_id VARCHAR(255),
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sdk_usage_logs_clinic_id ON sdk_usage_logs(clinic_id);
CREATE INDEX idx_sdk_usage_logs_feature ON sdk_usage_logs(feature);
CREATE INDEX idx_sdk_usage_logs_created_at ON sdk_usage_logs(created_at);
CREATE INDEX idx_sdk_usage_logs_session_id ON sdk_usage_logs(session_id);
CREATE INDEX idx_sdk_usage_logs_status_code ON sdk_usage_logs(status_code);
```

**Usage:**
- Analytics and reporting
- Billing calculations
- Performance monitoring
- Error tracking

---

### sdk_sessions
Tracks active SDK sessions for users.

```sql
CREATE TABLE sdk_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    
    -- User Information
    user_id VARCHAR(255) REFERENCES users(id),
    guest_identifier VARCHAR(255),
    
    -- Session Data
    features_used JSONB DEFAULT '[]',
    session_data JSONB DEFAULT '{}',
    
    -- Client Information
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- Session Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sdk_sessions_session_id ON sdk_sessions(session_id);
CREATE INDEX idx_sdk_sessions_clinic_id ON sdk_sessions(clinic_id);
CREATE INDEX idx_sdk_sessions_user_id ON sdk_sessions(user_id);
CREATE INDEX idx_sdk_sessions_is_active ON sdk_sessions(is_active);
CREATE INDEX idx_sdk_sessions_expires_at ON sdk_sessions(expires_at);
```

**Session Lifecycle:**
1. Created on SDK initialization
2. Updated on each feature access
3. Expires after 24 hours
4. Can be refreshed to extend expiry

---

### user_roles
Stores role assignments with tenant scoping (used for permissions).

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    
    -- Tenant Scoping
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    tenant_id VARCHAR(50) NOT NULL,
    
    -- Permit.io Sync Tracking
    permit_synced BOOLEAN DEFAULT FALSE,
    sync_error TEXT,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    
    -- Permissions Mapping
    permissions JSONB,  -- {"ai_chat": ["use", "export"], "patient": ["read", "update"]}
    
    -- Audit Information
    assigned_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_role_tenant UNIQUE (user_id, role, tenant_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_clinic_id ON user_roles(clinic_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_permit_synced ON user_roles(permit_synced);
CREATE INDEX idx_user_roles_assigned_by ON user_roles(assigned_by);
```

**Permissions Structure:**
```json
{
  "ai_chat": ["use", "view_history", "export"],
  "patient_resource": ["create", "read", "update"],
  "appointment": ["create", "read", "update", "confirm"]
}
```

---

### permit_sync_logs
Logs Permit.io synchronization events for debugging.

```sql
CREATE TABLE permit_sync_logs (
    id SERIAL PRIMARY KEY,
    
    -- Sync Operation Details
    operation VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    
    -- Sync Status
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Request/Response Data
    request_data TEXT,
    response_data TEXT,
    
    -- Timing Information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_permit_sync_logs_operation ON permit_sync_logs(operation);
CREATE INDEX idx_permit_sync_logs_entity_type ON permit_sync_logs(entity_type);
CREATE INDEX idx_permit_sync_logs_entity_id ON permit_sync_logs(entity_id);
CREATE INDEX idx_permit_sync_logs_tenant_id ON permit_sync_logs(tenant_id);
CREATE INDEX idx_permit_sync_logs_status ON permit_sync_logs(status);
CREATE INDEX idx_permit_sync_logs_created_at ON permit_sync_logs(created_at);
CREATE INDEX idx_permit_sync_logs_next_retry_at ON permit_sync_logs(next_retry_at);
```

---

## Relationships Diagram

```
clinics (1) ──────── (1) clinic_configs
   │
   ├── (1) ──────── (many) sdk_feature_configs
   │
   ├── (1) ──────── (many) sdk_usage_logs
   │
   ├── (1) ──────── (many) sdk_sessions
   │
   └── (1) ──────── (many) user_roles

users (1) ──────── (many) user_roles
users (1) ──────── (many) sdk_sessions
```

---

## Common Queries

### Get Clinic with SDK Configuration
```sql
SELECT 
    c.*,
    cc.api_key,
    cc.sdk_enabled,
    cc.allowed_domains,
    cc.custom_branding,
    cc.primary_color,
    cc.secondary_color
FROM clinics c
LEFT JOIN clinic_configs cc ON c.id = cc.clinic_id
WHERE c.id = :clinic_id;
```

### Get Enabled Features for Clinic
```sql
SELECT 
    feature,
    is_enabled,
    daily_limit,
    monthly_limit,
    current_day_usage,
    current_month_usage,
    custom_title
FROM sdk_feature_configs
WHERE clinic_id = :clinic_id
  AND is_enabled = TRUE;
```

### Get Usage Statistics
```sql
SELECT 
    feature,
    COUNT(*) as total_requests,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
FROM sdk_usage_logs
WHERE clinic_id = :clinic_id
  AND created_at >= :start_date
  AND created_at <= :end_date
GROUP BY feature;
```

### Get Active Sessions
```sql
SELECT 
    session_id,
    user_id,
    guest_identifier,
    features_used,
    last_activity_at
FROM sdk_sessions
WHERE clinic_id = :clinic_id
  AND is_active = TRUE
  AND expires_at > NOW();
```

### Check Feature Access
```sql
SELECT 
    sfc.is_enabled,
    sfc.daily_limit,
    sfc.monthly_limit,
    sfc.current_day_usage,
    sfc.current_month_usage,
    cc.monthly_request_limit,
    cc.current_month_requests
FROM sdk_feature_configs sfc
JOIN clinic_configs cc ON sfc.clinic_id = cc.clinic_id
WHERE sfc.clinic_id = :clinic_id
  AND sfc.feature = :feature;
```

---

## Data Retention

### Usage Logs
- Retained for 90 days
- Aggregated for long-term analytics
- Cleanup job runs daily

### Sessions
- Expired sessions deleted after 7 days
- Active sessions maintained
- Cleanup job runs hourly

### Sync Logs
- Retained for 30 days
- Successful syncs deleted after 7 days
- Failed syncs retained for debugging

---

## Indexes Strategy

### Performance Indexes
- Foreign keys (automatic)
- Frequently queried columns (clinic_id, feature, created_at)
- Unique constraints (api_key, session_id)

### Composite Indexes
- `(clinic_id, feature)` for feature lookups
- `(clinic_id, created_at)` for usage queries
- `(is_active, expires_at)` for session cleanup

---

## Migrations

Migrations are managed using Alembic.

### Key Migrations
1. `24_refactor_sdk_to_clinic_based.py` - Initial SDK tables
2. `30_add_sdk_enabled_to_clinics.py` - SDK enablement flag
3. `36_add_sdk_customization_fields.py` - Visual customization

### Running Migrations
```bash
# Upgrade to latest
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# Show current version
alembic current
```

---

## Backup Strategy

### Daily Backups
- Full database backup
- Stored for 30 days
- Automated via cron job

### Point-in-Time Recovery
- WAL archiving enabled
- 7-day recovery window

### Critical Tables
Priority backup for:
- `clinics`
- `clinic_configs`
- `sdk_feature_configs`
- `user_roles`
