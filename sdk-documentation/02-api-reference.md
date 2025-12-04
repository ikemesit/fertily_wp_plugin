# Fertily SDK - API Reference

## Base URLs

| Environment | Base URL |
|------------|----------|
| Development | `http://localhost:9000/api/sdk` |
| Staging | `https://staging-api.fertilyapp.com/api/sdk` |
| Production | `https://api.fertilyapp.com/api/sdk` |

## Authentication

### API Key Authentication
Used for admin endpoints and clinic self-service.

```http
Authorization: Bearer {api_key}
```

### JWT Token Authentication
Used for SDK session endpoints.

```http
Authorization: Bearer {jwt_token}
```

## Public Endpoints

### Get SDK Configuration

Retrieves SDK configuration for a clinic (called during initialization).

**Endpoint:** `GET /config`

**Query Parameters:**
- `clinic_id` (required): Clinic UUID
- `domain` (optional): Requesting domain for validation

**Response:**
```json
{
  "clinic_id": "uuid",
  "business_name": "Clinic Name",
  "features": ["ai_chat", "ivf_prediction"],
  "custom_branding": {},
  "feature_configs": {
    "ai_chat": {
      "custom_title": "AI Assistant",
      "custom_description": "Chat with our AI",
      "daily_limit": 100,
      "monthly_limit": 3000,
      "current_day_usage": 45,
      "current_month_usage": 1200
    }
  },
  "is_public": true,
  "primary_color": "#007bff",
  "secondary_color": "#6c757d",
  "accent_color": "#28a745",
  "background_color": "#ffffff",
  "text_color": "#212529",
  "button_style": "rounded",
  "font_family": "Inter, sans-serif",
  "logo_url": "https://example.com/logo.png"
}
```

**Status Codes:**
- `200 OK`: Configuration retrieved successfully
- `404 Not Found`: Clinic not found or SDK not enabled
- `403 Forbidden`: Domain not allowed

---

### Initialize SDK Session

Creates a new SDK session and returns JWT token.

**Endpoint:** `POST /sessions`

**Request Body:**
```json
{
  "clinic_id": "uuid",
  "domain": "example.com",
  "user_identifier": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "session_uuid",
  "config": {
    // Same as /config response
  },
  "error": null,
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

**Status Codes:**
- `200 OK`: Session created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Clinic not found

---

### Refresh SDK Session

Refreshes an existing session and returns new JWT token.

**Endpoint:** `POST /sessions/{session_id}/refresh`

**Headers:**
```http
Authorization: Bearer {current_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "jwt_token": "new_jwt_token",
  "session_id": "session_uuid",
  "expires_in": 86400,
  "expires_at": "2024-01-01T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Token refreshed successfully
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Session not found

---

### Request Feature Access

Requests access to a specific feature.

**Endpoint:** `POST /features/access`

**Request Body:**
```json
{
  "session_id": "session_uuid",
  "feature": "ai_chat",
  "additional_data": {
    "custom_param": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "feature": "ai_chat",
  "access_granted": true,
  "iframe_url": "https://embed.fertilyapp.com/chat?session_id=xxx&token=yyy",
  "config": {
    "custom_title": "AI Assistant",
    "daily_limit": 100
  },
  "error": null,
  "usage_remaining": {
    "daily": 55,
    "monthly": 1800
  }
}
```

**Status Codes:**
- `200 OK`: Access granted
- `403 Forbidden`: Access denied (quota exceeded, feature disabled)
- `401 Unauthorized`: Invalid session

---

## Admin Endpoints

All admin endpoints require authentication with admin role.

### List SDK-Enabled Clinics

**Endpoint:** `GET /admin/clinics`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 20)

**Headers:**
```http
Authorization: Bearer {admin_jwt_token}
```

**Response:**
```json
[
  {
    "clinic_id": "uuid",
    "name": "Clinic Name",
    "is_active": true,
    "sdk_enabled": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### List All SDK Resources

**Endpoint:** `GET /admin/resources`

**Response:**
```json
[
  {
    "clinic_id": "uuid",
    "clinic_name": "Clinic Name",
    "clinic_email": "clinic@example.com",
    "api_key": "api_key_here",
    "sdk_enabled": true,
    "is_active": true,
    "allow_public_access": false,
    "allowed_domains": ["example.com"],
    "webhook_url": "https://example.com/webhook",
    "custom_branding": {},
    "monthly_request_limit": 10000,
    "current_month_requests": 5432,
    "last_used_at": "2024-01-01T12:00:00Z",
    "enabled_features": ["ai_chat", "ivf_prediction"],
    "token_quotas": {
      "ai_assistant": {
        "total": 1000,
        "used": 450,
        "remaining": 550
      }
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Enable SDK for Clinic

**Endpoint:** `POST /admin/clinics/{clinic_id}/enable`

**Request Body:**
```json
{
  "allowed_domains": ["example.com", "www.example.com"],
  "tenant_name": "Clinic Business Name"
}
```

**Response:**
```json
{
  "message": "SDK enabled successfully",
  "clinic_id": "uuid"
}
```

---

### Create Feature Configuration

**Endpoint:** `POST /admin/clinics/{clinic_id}/features`

**Request Body:**
```json
{
  "feature": "ai_chat",
  "is_enabled": true,
  "config": {
    "custom_setting": "value"
  },
  "daily_limit": 100,
  "monthly_limit": 3000,
  "custom_title": "AI Fertility Assistant",
  "custom_description": "Chat with our AI expert",
  "custom_css": ".custom-class { color: blue; }"
}
```

**Response:**
```json
{
  "id": 123,
  "clinic_id": "uuid",
  "feature": "ai_chat",
  "is_enabled": true,
  "config": {},
  "daily_limit": 100,
  "monthly_limit": 3000,
  "current_day_usage": 0,
  "current_month_usage": 0,
  "custom_title": "AI Fertility Assistant",
  "custom_description": "Chat with our AI expert",
  "custom_css": ".custom-class { color: blue; }",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

---

### Get Clinic SDK Configuration

**Endpoint:** `GET /admin/clinics/{clinic_id}/config`

**Response:**
```json
{
  "clinic_id": "uuid",
  "api_key": "api_key_here",
  "sdk_enabled": true,
  "allowed_domains": ["example.com"],
  "webhook_url": "https://example.com/webhook",
  "custom_branding": {},
  "monthly_request_limit": 10000,
  "current_month_requests": 5432,
  "last_used_at": "2024-01-01T12:00:00Z"
}
```

---

### Update Clinic SDK Configuration

**Endpoint:** `PUT /admin/clinics/{clinic_id}/config`

**Request Body:**
```json
{
  "sdk_enabled": true,
  "is_active": true,
  "allow_public_access": false,
  "allowed_domains": ["example.com", "www.example.com"],
  "webhook_url": "https://example.com/webhook",
  "custom_branding": {
    "logo": "https://example.com/logo.png"
  },
  "monthly_request_limit": 15000,
  "enabled_features": [
    {
      "feature": "ai_chat",
      "is_enabled": true
    }
  ]
}
```

**Response:**
```json
{
  "clinic_id": "uuid",
  "api_key": "api_key_here",
  "sdk_enabled": true,
  "allowed_domains": ["example.com", "www.example.com"],
  "webhook_url": "https://example.com/webhook",
  "custom_branding": {},
  "monthly_request_limit": 15000,
  "current_month_requests": 5432,
  "last_used_at": "2024-01-01T12:00:00Z"
}
```

---

### List Clinic Features

**Endpoint:** `GET /admin/clinics/{clinic_id}/features`

**Response:**
```json
[
  {
    "id": 123,
    "clinic_id": "uuid",
    "feature": "ai_chat",
    "is_enabled": true,
    "config": {},
    "daily_limit": 100,
    "monthly_limit": 3000,
    "current_day_usage": 45,
    "current_month_usage": 1200,
    "custom_title": "AI Assistant",
    "custom_description": "Chat with AI",
    "custom_css": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

---

### Update Feature Configuration

**Endpoint:** `PUT /admin/clinics/{clinic_id}/features/{feature}`

**Request Body:**
```json
{
  "is_enabled": true,
  "config": {},
  "daily_limit": 150,
  "monthly_limit": 4000,
  "custom_title": "Updated Title",
  "custom_description": "Updated Description",
  "custom_css": ".new-class { }"
}
```

**Response:**
```json
{
  "id": 123,
  "clinic_id": "uuid",
  "feature": "ai_chat",
  "is_enabled": true,
  "config": {},
  "daily_limit": 150,
  "monthly_limit": 4000,
  "current_day_usage": 45,
  "current_month_usage": 1200,
  "custom_title": "Updated Title",
  "custom_description": "Updated Description",
  "custom_css": ".new-class { }",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-20T00:00:00Z"
}
```

---

### Get Clinic Usage Statistics

**Endpoint:** `GET /admin/clinics/{clinic_id}/stats`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response:**
```json
{
  "total_requests": 5432,
  "feature_usage": {
    "ai_chat": 3200,
    "ivf_prediction": 1500,
    "embryo_grading": 732
  },
  "average_response_time": 245.5,
  "error_rate": 1.2,
  "period_start": "2023-12-01T00:00:00Z",
  "period_end": "2024-01-01T00:00:00Z"
}
```

---

### Allocate Clinic Tokens

**Endpoint:** `POST /admin/clinics/{clinic_id}/tokens/allocate`

**Request Body:**
```json
{
  "resource_type": "ai_assistant",
  "amount": 1000,
  "reason": "Monthly allocation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully allocated 1000 tokens for ai_assistant",
  "clinic_id": "uuid",
  "resource_type": "ai_assistant",
  "amount": 1000
}
```

---

### Reduce Clinic Tokens

**Endpoint:** `POST /admin/clinics/{clinic_id}/tokens/reduce`

**Request Body:**
```json
{
  "resource_type": "ai_assistant",
  "amount": 500,
  "reason": "Adjustment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully reduced 500 tokens for ai_assistant",
  "clinic_id": "uuid",
  "resource_type": "ai_assistant",
  "amount": 500
}
```

---

## Clinic Self-Service Endpoints

These endpoints use API key authentication (clinic's own API key).

### Get Own Configuration

**Endpoint:** `GET /clinic/config`

**Headers:**
```http
Authorization: Bearer {clinic_api_key}
```

**Response:**
```json
{
  "clinic_id": "uuid",
  "business_name": "Clinic Name",
  "features": ["ai_chat", "ivf_prediction"],
  "custom_branding": {},
  "feature_configs": {},
  "is_public": false
}
```

---

### Get Own Usage Statistics

**Endpoint:** `GET /clinic/stats`

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

**Headers:**
```http
Authorization: Bearer {clinic_api_key}
```

**Response:**
```json
{
  "total_requests": 5432,
  "feature_usage": {},
  "average_response_time": 245.5,
  "error_rate": 1.2,
  "period_start": "2023-12-01T00:00:00Z",
  "period_end": "2024-01-01T00:00:00Z"
}
```

---

### Get Own Features

**Endpoint:** `GET /clinic/features`

**Headers:**
```http
Authorization: Bearer {clinic_api_key}
```

**Response:**
```json
[
  {
    "id": 123,
    "feature": "ai_chat",
    "is_enabled": true,
    "daily_limit": 100,
    "monthly_limit": 3000,
    "current_day_usage": 45,
    "current_month_usage": 1200
  }
]
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status Code | Meaning |
|------------|---------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions or quota exceeded |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per clinic
- **Admin endpoints**: 5000 requests per minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (Optional)

Clinics can configure webhook URLs to receive notifications.

### Events
- `session.created` - New session initialized
- `feature.accessed` - Feature accessed by user
- `quota.warning` - Usage approaching limit (80%)
- `quota.exceeded` - Usage limit exceeded

### Webhook Payload
```json
{
  "event": "feature.accessed",
  "timestamp": "2024-01-01T12:00:00Z",
  "clinic_id": "uuid",
  "data": {
    "session_id": "session_uuid",
    "feature": "ai_chat",
    "user_identifier": "optional"
  }
}
```
