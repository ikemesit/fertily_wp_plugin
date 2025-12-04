# Fertily SDK - JavaScript SDK Reference

## Installation

### CDN (Recommended)
```html
<script src="https://cdn.fertilyapp.com/fertily-sdk.js"></script>
```

### NPM (Coming Soon)
```bash
npm install @fertily/sdk
```

## Initialization

### Basic Initialization
```javascript
FertilySDK.init({
  tenantId: 'your-clinic-id',
  environment: 'production'
});
```

### Full Configuration
```javascript
FertilySDK.init({
  tenantId: 'your-clinic-id',           // Required: Your clinic ID
  environment: 'production',             // Optional: 'development', 'staging', 'production'
  domain: window.location.hostname,      // Optional: Auto-detected if not provided
  userIdentifier: 'user@example.com',    // Optional: User identifier for tracking
  debug: false                           // Optional: Enable debug logging
});
```

### Auto-Initialization via Data Attributes
```html
<script 
  src="https://cdn.fertilyapp.com/fertily-sdk.js"
  data-tenant-id="your-clinic-id"
  data-environment="production"
  data-debug="false">
</script>
```

## Core Methods

### init(options)
Initializes the SDK with configuration.

**Parameters:**
- `options` (Object): Configuration options
  - `tenantId` (String, required): Your clinic ID
  - `environment` (String, optional): Environment ('development', 'staging', 'production')
  - `domain` (String, optional): Your domain (auto-detected)
  - `userIdentifier` (String, optional): User identifier
  - `debug` (Boolean, optional): Enable debug mode

**Returns:** Promise<void>

**Example:**
```javascript
await FertilySDK.init({
  tenantId: 'clinic-123',
  environment: 'production',
  debug: true
});
```

---

### show(feature, options)
Displays a specific feature in a popup modal.

**Parameters:**
- `feature` (String, required): Feature to display
  - `'ai_chat'` - AI Fertility Assistant
  - `'ivf_prediction'` - IVF Success Predictor
  - `'embryo_grading'` - Embryo Grading
  - `'escrow_wallet'` - Secure Payments
  - `'appointment_booking'` - Appointment Booking
  - `'cycle_tracking'` - Cycle Tracking
  - `'expert_consultation'` - Expert Consultation
- `options` (Object, optional): Additional options

**Returns:** Promise<void>

**Example:**
```javascript
// Show AI chat
await FertilySDK.show('ai_chat');

// Show with options
await FertilySDK.show('ivf_prediction', {
  customParam: 'value'
});
```

---

### hide()
Closes the currently displayed feature popup.

**Returns:** void

**Example:**
```javascript
FertilySDK.hide();
```

---

### refreshConfig()
Refreshes the SDK configuration from the server.

**Returns:** Promise<boolean>

**Example:**
```javascript
const success = await FertilySDK.refreshConfig();
if (success) {
  console.log('Configuration refreshed');
}
```

---

### destroy()
Destroys the SDK instance and cleans up resources.

**Returns:** void

**Example:**
```javascript
FertilySDK.destroy();
```

---

## Feature-Specific Methods

Convenience methods for showing specific features.

### showAIChat(options)
```javascript
FertilySDK.showAIChat();
```

### showIVFPredictor(options)
```javascript
FertilySDK.showIVFPredictor();
```

### showEmbryoGrading(options)
```javascript
FertilySDK.showEmbryoGrading();
```

### showWallet(options)
```javascript
FertilySDK.showWallet();
```

### showAppointments(options)
```javascript
FertilySDK.showAppointments();
```

### showCycleTracking(options)
```javascript
FertilySDK.showCycleTracking();
```

### showConsultation(options)
```javascript
FertilySDK.showConsultation();
```

---

## Query Methods

### isFeatureAvailable(feature)
Checks if a feature is available for the clinic.

**Parameters:**
- `feature` (String): Feature name

**Returns:** Boolean

**Example:**
```javascript
if (FertilySDK.isFeatureAvailable('ai_chat')) {
  // Show AI chat button
}
```

---

### getAvailableFeatures()
Gets list of all available features.

**Returns:** Array<String>

**Example:**
```javascript
const features = FertilySDK.getAvailableFeatures();
// ['ai_chat', 'ivf_prediction', 'embryo_grading']
```

---

### isPublic()
Checks if SDK is publicly accessible (no login required).

**Returns:** Boolean

**Example:**
```javascript
if (!FertilySDK.isPublic()) {
  // Show login prompt
}
```

---

### getFeatureConfig(feature)
Gets configuration for a specific feature.

**Parameters:**
- `feature` (String): Feature name

**Returns:** Object | null

**Example:**
```javascript
const config = FertilySDK.getFeatureConfig('ai_chat');
console.log(config.custom_title); // "AI Fertility Assistant"
console.log(config.daily_limit);  // 100
```

---

### isUserAuthenticated()
Checks if user is authenticated (for private SDKs).

**Returns:** Boolean

**Example:**
```javascript
if (FertilySDK.isUserAuthenticated()) {
  console.log('User is logged in');
}
```

---

## Authentication Methods

### logout()
Logs out the current user and clears authentication.

**Returns:** void

**Example:**
```javascript
FertilySDK.logout();
```

---

## Event System

### on(event, handler)
Adds an event listener.

**Parameters:**
- `event` (String): Event name
- `handler` (Function): Event handler function

**Returns:** void

**Example:**
```javascript
FertilySDK.on('ready', (data) => {
  console.log('SDK ready', data.config);
});
```

---

### off(event, handler)
Removes an event listener.

**Parameters:**
- `event` (String): Event name
- `handler` (Function): Event handler to remove

**Returns:** void

**Example:**
```javascript
const handler = (data) => console.log(data);
FertilySDK.on('ready', handler);
FertilySDK.off('ready', handler);
```

---

### trigger(event, data)
Triggers an event (internal use).

**Parameters:**
- `event` (String): Event name
- `data` (Any): Event data

**Returns:** void

---

## Events

### ready
Fired when SDK is initialized and ready.

**Data:**
```javascript
{
  config: {
    clinic_id: 'uuid',
    features: ['ai_chat', 'ivf_prediction'],
    // ... full configuration
  }
}
```

**Example:**
```javascript
FertilySDK.on('ready', (data) => {
  console.log('SDK initialized with', data.config.features.length, 'features');
});
```

---

### feature:show
Fired when a feature is displayed.

**Data:**
```javascript
{
  feature: 'ai_chat',
  options: {}
}
```

**Example:**
```javascript
FertilySDK.on('feature:show', (data) => {
  console.log('Showing feature:', data.feature);
  // Track in analytics
  gtag('event', 'feature_view', { feature: data.feature });
});
```

---

### feature:hide
Fired when a feature popup is closed.

**Example:**
```javascript
FertilySDK.on('feature:hide', () => {
  console.log('Feature closed');
});
```

---

### config:refreshed
Fired when configuration is refreshed.

**Data:**
```javascript
{
  config: { /* updated configuration */ }
}
```

**Example:**
```javascript
FertilySDK.on('config:refreshed', (data) => {
  console.log('Configuration updated');
});
```

---

### token:refreshed
Fired when JWT token is refreshed.

**Data:**
```javascript
{
  expiresAt: 1640000000
}
```

**Example:**
```javascript
FertilySDK.on('token:refreshed', (data) => {
  console.log('Token refreshed, expires at:', new Date(data.expiresAt));
});
```

---

### token:refresh_failed
Fired when token refresh fails.

**Data:**
```javascript
{
  error: 'Error message'
}
```

**Example:**
```javascript
FertilySDK.on('token:refresh_failed', (data) => {
  console.error('Token refresh failed:', data.error);
  // Optionally re-initialize SDK
});
```

---

### user:authenticated
Fired when user successfully authenticates.

**Data:**
```javascript
{
  email: 'user@example.com'
}
```

**Example:**
```javascript
FertilySDK.on('user:authenticated', (data) => {
  console.log('User logged in:', data.email);
});
```

---

### user:logout
Fired when user logs out.

**Example:**
```javascript
FertilySDK.on('user:logout', () => {
  console.log('User logged out');
});
```

---

### destroyed
Fired when SDK is destroyed.

**Example:**
```javascript
FertilySDK.on('destroyed', () => {
  console.log('SDK destroyed');
});
```

---

## Configuration Object

The configuration object returned after initialization:

```javascript
{
  clinic_id: 'uuid',
  business_name: 'Clinic Name',
  features: ['ai_chat', 'ivf_prediction', 'embryo_grading'],
  custom_branding: {
    logo: 'https://example.com/logo.png'
  },
  feature_configs: {
    ai_chat: {
      custom_title: 'AI Fertility Assistant',
      custom_description: 'Chat with our AI expert',
      daily_limit: 100,
      monthly_limit: 3000,
      current_day_usage: 45,
      current_month_usage: 1200
    }
  },
  is_public: true,
  primary_color: '#007bff',
  secondary_color: '#6c757d',
  accent_color: '#28a745',
  background_color: '#ffffff',
  text_color: '#212529',
  button_style: 'rounded',
  font_family: 'Inter, sans-serif',
  logo_url: 'https://example.com/logo.png'
}
```

---

## Error Handling

### Try-Catch Pattern
```javascript
try {
  await FertilySDK.init({
    tenantId: 'clinic-123'
  });
} catch (error) {
  console.error('Failed to initialize SDK:', error);
  // Show fallback UI
}
```

### Error Events
```javascript
FertilySDK.on('token:refresh_failed', (data) => {
  // Handle token refresh failure
  console.error('Token refresh failed:', data.error);
});
```

---

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fertility Clinic</title>
</head>
<body>
  <h1>Welcome to Our Clinic</h1>
  
  <!-- Feature Buttons -->
  <button id="ai-chat-btn">Chat with AI Assistant</button>
  <button id="ivf-predictor-btn">IVF Success Predictor</button>
  <button id="appointments-btn">Book Appointment</button>

  <!-- Load SDK -->
  <script src="https://cdn.fertilyapp.com/fertily-sdk.js"></script>
  
  <script>
    // Initialize SDK
    (async function() {
      try {
        await FertilySDK.init({
          tenantId: 'clinic-123',
          environment: 'production',
          debug: false
        });

        // Listen for ready event
        FertilySDK.on('ready', (data) => {
          console.log('SDK ready with features:', data.config.features);
          
          // Show/hide buttons based on available features
          if (!FertilySDK.isFeatureAvailable('ai_chat')) {
            document.getElementById('ai-chat-btn').style.display = 'none';
          }
        });

        // Track feature usage
        FertilySDK.on('feature:show', (data) => {
          // Send to analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'feature_view', {
              feature_name: data.feature
            });
          }
        });

        // Setup button click handlers
        document.getElementById('ai-chat-btn').addEventListener('click', () => {
          FertilySDK.showAIChat();
        });

        document.getElementById('ivf-predictor-btn').addEventListener('click', () => {
          FertilySDK.showIVFPredictor();
        });

        document.getElementById('appointments-btn').addEventListener('click', () => {
          FertilySDK.showAppointments();
        });

      } catch (error) {
        console.error('Failed to initialize Fertily SDK:', error);
        // Show error message to user
        alert('Failed to load fertility features. Please refresh the page.');
      }
    })();
  </script>
</body>
</html>
```

---

## TypeScript Definitions (Coming Soon)

```typescript
interface FertilySDKConfig {
  tenantId: string;
  environment?: 'development' | 'staging' | 'production';
  domain?: string;
  userIdentifier?: string;
  debug?: boolean;
}

interface FertilySDK {
  init(options: FertilySDKConfig): Promise<void>;
  show(feature: string, options?: any): Promise<void>;
  hide(): void;
  refreshConfig(): Promise<boolean>;
  destroy(): void;
  isFeatureAvailable(feature: string): boolean;
  getAvailableFeatures(): string[];
  isPublic(): boolean;
  getFeatureConfig(feature: string): any | null;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  // ... other methods
}
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## Performance Tips

1. **Lazy Load**: Only initialize SDK when needed
2. **Cache Configuration**: SDK caches config automatically
3. **Async Loading**: Load SDK script asynchronously
4. **Event Delegation**: Use event delegation for multiple buttons

```html
<!-- Async loading -->
<script src="https://cdn.fertilyapp.com/fertily-sdk.js" async></script>

<!-- Event delegation -->
<script>
document.body.addEventListener('click', (e) => {
  if (e.target.matches('[data-fertily-feature]')) {
    const feature = e.target.dataset.fertilyFeature;
    FertilySDK.show(feature);
  }
});
</script>
```
