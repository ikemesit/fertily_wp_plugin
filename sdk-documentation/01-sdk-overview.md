# Fertily SDK - Technical Overview

## What is the Fertily SDK?

The Fertily SDK is an embeddable JavaScript library that allows fertility clinics to integrate AI-powered fertility features into their websites. It's a white-label solution that provides:

- **AI Fertility Assistant** - Conversational AI for fertility questions
- **IVF Success Predictor** - ML-based success rate predictions
- **Embryo Grading** - AI-powered embryo quality assessment
- **Appointment Booking** - Schedule consultations
- **Cycle Tracking** - Fertility cycle monitoring
- **Expert Consultation** - Connect with specialists
- **Secure Payments** - Escrow wallet for treatment payments

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Clinic Website                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Fertily SDK (JavaScript)                     │  │
│  │  - Initialization                                    │  │
│  │  - Session Management                                │  │
│  │  - UI Components (Popup/Modal)                       │  │
│  │  - Authentication                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Fertily Backend API (FastAPI)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SDK Routes (/api/sdk/)                              │  │
│  │  - Session initialization                            │  │
│  │  - Configuration retrieval                           │  │
│  │  - Feature access control                            │  │
│  │  - Usage tracking                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL)                               │  │
│  │  - Clinic configurations                             │  │
│  │  - Feature settings                                  │  │
│  │  - Usage logs                                        │  │
│  │  - Session data                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│           Embed Server (Feature Implementations)            │
│  - AI Chat Interface                                        │
│  - IVF Prediction Form                                      │
│  - Embryo Grading Tool                                      │
│  - Appointment Booking                                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Multi-Tenancy
Each clinic is a separate tenant with:
- Unique Clinic ID (tenant ID)
- Isolated configuration
- Separate usage tracking
- Independent feature enablement

### 2. Session-Based Architecture
- SDK creates a session on initialization
- Session includes JWT token for authentication
- Token expires after 24 hours (auto-refreshed)
- Session tracks feature usage

### 3. Feature-Based Access Control
- Features are enabled/disabled per clinic
- Usage limits enforced (daily/monthly)
- Token quotas for AI features
- Real-time access validation

### 4. Iframe-Based Embedding
- Features load in secure iframes
- Prevents CSS conflicts
- Isolates feature code
- Maintains security boundaries

## Data Flow

### Initialization Flow
```
1. Website loads SDK JavaScript
   ↓
2. SDK.init() called with clinic ID
   ↓
3. POST /api/sdk/sessions
   - Creates session
   - Returns JWT token
   - Returns configuration
   ↓
4. SDK stores token and config
   ↓
5. SDK ready for feature requests
```

### Feature Access Flow
```
1. User clicks feature button
   ↓
2. SDK checks if authenticated (for private SDKs)
   ↓
3. POST /api/sdk/features/access
   - Validates session
   - Checks feature access
   - Validates token quota
   - Increments usage counter
   ↓
4. Returns iframe URL
   ↓
5. SDK displays feature in popup
   ↓
6. Usage logged to database
```

### Token Refresh Flow
```
1. SDK detects token expiring soon
   ↓
2. POST /api/sdk/sessions/{session_id}/refresh
   ↓
3. Backend validates current token
   ↓
4. Returns new JWT token
   ↓
5. SDK updates stored token
   ↓
6. Schedules next refresh
```

## Environment Configuration

### Development
- API Base: `http://localhost:9000`
- Embed Base: `http://localhost:9000/api/embed`
- Debug mode enabled
- Detailed logging

### Staging
- API Base: `https://staging-api.fertilyapp.com`
- Embed Base: `https://staging-api.fertilyapp.com/api/embed`
- Testing environment
- Limited logging

### Production
- API Base: `https://api.fertilyapp.com`
- Embed Base: `https://api.fertilyapp.com/api/embed`
- Production environment
- Error logging only

## Security Model

### Authentication Layers
1. **Clinic Authentication**: API key validates clinic
2. **Session Authentication**: JWT token validates session
3. **User Authentication**: Optional user login for private SDKs
4. **Domain Validation**: Whitelist of allowed domains

### Token Structure
```json
{
  "subject": "user_id or clinic_id",
  "session_id": "unique_session_id",
  "clinic_id": "clinic_uuid",
  "type": "SDK_SESSION",
  "scope": "CLINIC or CLINIC_USER",
  "guest_identifier": "optional_guest_id",
  "exp": 1234567890
}
```

### Access Control
- Feature-level permissions
- Usage quota enforcement
- Rate limiting
- Domain restrictions

## Performance Considerations

### Lazy Loading
- SDK script loaded asynchronously
- Features loaded on-demand
- Iframe content lazy-loaded

### Caching
- Configuration cached in session
- Token cached until expiry
- Static assets cached by CDN

### Optimization
- Minified JavaScript
- Compressed assets
- CDN delivery
- Async initialization

## Error Handling

### Client-Side Errors
- Network failures → Retry with exponential backoff
- Invalid configuration → Show user-friendly error
- Token expiry → Auto-refresh
- Feature unavailable → Display message

### Server-Side Errors
- Invalid clinic ID → 404 Not Found
- Quota exceeded → 403 Forbidden
- Server error → 500 Internal Server Error
- Rate limit → 429 Too Many Requests

## Monitoring & Analytics

### Tracked Metrics
- Session creation count
- Feature usage by type
- Response times
- Error rates
- Token consumption
- Active sessions

### Usage Logs
Each request logs:
- Timestamp
- Clinic ID
- Feature accessed
- User agent
- IP address
- Response time
- Status code
- Error messages (if any)

## Integration Points

### Frontend Integration
```javascript
// Basic integration
<script src="https://cdn.fertilyapp.com/fertily-sdk.js"></script>
<script>
  FertilySDK.init({
    tenantId: 'clinic-123',
    environment: 'production'
  });
</script>
```

### Backend Integration
- Admin API for configuration
- Webhook notifications (optional)
- Usage reporting API
- Token management API

## Customization Options

### Visual Customization
- Primary color
- Secondary color
- Accent color
- Background color
- Text color
- Button style (rounded/square/pill)
- Font family
- Logo URL
- Custom CSS

### Behavioral Customization
- Auto-initialization
- Feature availability
- Usage limits
- Domain restrictions
- Authentication requirements

## Versioning

### SDK Versioning
- Current version: 1.0.0
- Semantic versioning (MAJOR.MINOR.PATCH)
- Backward compatibility maintained
- Deprecation notices provided

### API Versioning
- API version in URL path
- Multiple versions supported
- Migration guides provided
- Sunset policy communicated

## Support & Documentation

### Resources
- API documentation
- Integration guides
- Code examples
- Troubleshooting guides
- FAQ

### Support Channels
- Email support
- Developer portal
- Status page
- Community forum
