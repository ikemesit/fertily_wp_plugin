# WordPress Plugin Generation Prompt for Fertily SDK Integration

---

## 🚨 CRITICAL ARCHITECTURE REQUIREMENT 🚨

**THIS PLUGIN IS A WRAPPER ONLY - NO DIRECT API CALLS ALLOWED**

The WordPress plugin you generate must:
- ✅ **ONLY** use the Fertily JavaScript SDK (`fertily-sdk.js`)
- ✅ Act as a WordPress wrapper that provides shortcodes, blocks, and widgets
- ✅ Generate HTML/JavaScript that calls SDK methods
- ✅ Store only configuration settings (Clinic ID, environment)

The WordPress plugin must **NEVER**:
- ❌ Make direct HTTP requests to `https://api.fertilyapp.com`
- ❌ Use `wp_remote_get()`, `wp_remote_post()`, or any PHP HTTP functions to call Fertily API
- ❌ Implement custom authentication or session management
- ❌ Store or manage API keys, JWT tokens, or session data
- ❌ Query or interact with Fertily database directly

**Architecture:**
```
WordPress Plugin (PHP) → Generates HTML/JS → Fertily SDK (JS) → Fertily API
                                              ↑
                                    ALL API calls happen here
                                    Plugin never touches API
```

---

## Context & Documentation

**🚨 CRITICAL REQUIREMENT:** This WordPress plugin is a **WRAPPER ONLY** - it must use ONLY the Fertily JavaScript SDK (`fertily-sdk.js`) and NEVER make direct API calls to the backend. The plugin enables WordPress to communicate with the Fertily API exclusively through the provided SDK.

### Required Reading (In Priority Order)

1. **JavaScript SDK Reference** (`sdk-documentation/03-javascript-sdk-reference.md`) - **⭐ PRIMARY REFERENCE**
   - This is your ONLY interface to Fertily functionality
   - Use exact method signatures and parameters
   - Implement all events for proper tracking
   - Follow initialization patterns and error handling
   - **ALL plugin functionality must use these SDK methods**

2. **Integration Examples** (`sdk-documentation/05-integration-examples.md`)
   - Follow WordPress integration patterns using SDK methods ONLY
   - Use provided code examples as reference
   - Implement best practices from examples
   - Focus on the WordPress section that demonstrates SDK usage

3. **SDK Overview** (`sdk-documentation/01-sdk-overview.md`)
   - Understand multi-tenancy, session management, and feature access control
   - Review security model (handled by SDK, not plugin)
   - Study error handling patterns for client-side SDK
   - Understand feature availability concepts

### ⛔ DO NOT USE (Reference Only)
4. **API Reference** (`sdk-documentation/02-api-reference.md`)
   - **DO NOT implement these endpoints in the plugin**
   - Reference only for understanding what the SDK does internally
   - The SDK handles all API communication

5. **Database Schema** (`sdk-documentation/04-database-schema.md`)
   - **DO NOT query or interact with this schema**
   - Reference only for understanding data structures
   - The SDK handles all data access

### Key References
- **SDK Initialization:** See `03-javascript-sdk-reference.md` section "Initialization"
- **SDK Methods:** See `03-javascript-sdk-reference.md` for ALL available methods
- **WordPress Examples:** See `05-integration-examples.md` section "WordPress Integration"
- **Error Handling:** See `01-sdk-overview.md` section "Error Handling" (client-side patterns only)

---

## Objective
Create a complete WordPress plugin that enables fertility clinics to easily integrate the Fertily SDK into their WordPress websites. The plugin should provide a user-friendly admin interface for configuration and multiple ways to embed fertility features.

**CRITICAL IMPLEMENTATION REQUIREMENT:**
The WordPress plugin is a **WRAPPER ONLY** - it must NOT make direct API calls to the backend. All communication with the Fertily API must go through the Fertily SDK JavaScript library (`fertily-sdk.js`). The plugin's role is to:
1. Load and initialize the Fertily SDK JavaScript library
2. Provide WordPress-friendly interfaces (shortcodes, blocks, widgets)
3. Manage configuration settings in WordPress
4. Generate proper HTML/JavaScript to trigger SDK methods
5. Handle WordPress-specific integration concerns

**What the Plugin SHOULD Do:**
- ✅ Load `fertily-sdk.js` from CDN
- ✅ Initialize `FertilySDK.init()` with saved settings
- ✅ Call `FertilySDK.show()`, `FertilySDK.hide()`, etc.
- ✅ Listen to SDK events (`FertilySDK.on()`)
- ✅ Store configuration in WordPress options
- ✅ Generate buttons that call SDK methods

**What the Plugin MUST NOT Do:**
- ❌ Make direct HTTP requests to `https://api.fertilyapp.com`
- ❌ Call API endpoints directly (no `wp_remote_get()` to Fertily API)
- ❌ Implement custom session management
- ❌ Handle JWT tokens directly
- ❌ Bypass the SDK JavaScript library

**Implementation Requirements:**
- Follow ALL specifications from the SDK documentation
- Use ONLY JavaScript SDK methods from `03-javascript-sdk-reference.md`
- Never make direct API calls - let the SDK handle all backend communication
- Follow WordPress integration patterns from `05-integration-examples.md`
- Implement proper error handling as described in `01-sdk-overview.md`

## Plugin Requirements

### 1. Plugin Metadata
- **Plugin Name**: Fertily SDK Integration
- **Description**: Embed AI-powered fertility features (AI chat, IVF prediction, embryo grading, appointments) into your WordPress site
- **Version**: 1.0.0
- **Author**: Fertily
- **Requires at least**: WordPress 5.8
- **Tested up to**: WordPress 6.4
- **Requires PHP**: 7.4
- **License**: GPL v2 or later
- **Text Domain**: fertily-sdk

### 2. Core Functionality

**ARCHITECTURE PRINCIPLE:** The plugin is a thin WordPress wrapper around the Fertily SDK JavaScript library. All API communication happens through the SDK, not through WordPress PHP code.

```
WordPress Plugin (PHP) → Generates HTML/JS → Fertily SDK (JS) → Fertily API
                                              ↑
                                    All API calls happen here
```

#### A. Admin Settings Page
Create a settings page under WordPress Admin → Settings → Fertily SDK with the following fields:

**Connection Settings:**
- Clinic ID (Tenant ID) - Required text field
- Environment - Dropdown: Development, Staging, Production
- Enable Debug Mode - Checkbox
- SDK Status - Display connection status (connected/disconnected)

**Feature Configuration:**
- Enable/Disable individual features with checkboxes:
  - AI Fertility Assistant
  - IVF Success Predictor
  - Embryo Grading
  - Appointment Booking
  - Cycle Tracking
  - Expert Consultation
  - Secure Payments (Escrow Wallet)

**Display Options:**
- Button Style - Dropdown: Rounded, Square, Pill
- Button Position - Dropdown: Bottom Right, Bottom Left, Top Right, Top Left, Custom
- Custom CSS - Textarea for additional styling

**Advanced Settings:**
- Allowed Domains - Textarea (one domain per line)
- User Identifier Field - Dropdown to select WordPress user field (email, username, user_id)
- Auto-initialize on page load - Checkbox

#### B. SDK Integration
**Reference:** `sdk-documentation/03-javascript-sdk-reference.md` and `sdk-documentation/05-integration-examples.md`

The plugin must act as a WordPress wrapper that:
1. **Loads the SDK:** Enqueue `fertily-sdk.js` from CDN using `wp_enqueue_script()`
2. **Initializes the SDK:** Call `FertilySDK.init()` with WordPress settings
3. **Generates UI Elements:** Create buttons/blocks that call SDK methods
4. **Handles Events:** Listen to SDK events for tracking and feedback

**Implementation Pattern:**
```php
// PHP generates the initialization code
function fertily_enqueue_scripts() {
    // Load SDK from CDN
    wp_enqueue_script(
        'fertily-sdk',
        'https://cdn.fertilyapp.com/fertily-sdk.js',
        array(),
        '1.0.0',
        true
    );
    
    // Generate initialization code
    $clinic_id = get_option('fertily_clinic_id');
    $environment = get_option('fertily_environment', 'production');
    
    $init_script = "
        document.addEventListener('DOMContentLoaded', function() {
            FertilySDK.init({
                tenantId: '" . esc_js($clinic_id) . "',
                environment: '" . esc_js($environment) . "',
                domain: window.location.hostname
            });
        });
    ";
    
    wp_add_inline_script('fertily-sdk', $init_script);
}
```

**CRITICAL:** The plugin generates JavaScript that calls SDK methods. It does NOT make HTTP requests to the API.

#### C. Shortcodes
Provide the following shortcodes for embedding features:

```
[fertily_button feature="ai_chat" text="Chat with AI" class="custom-class"]
[fertily_ai_chat]
[fertily_ivf_prediction]
[fertily_embryo_grading]
[fertily_appointments]
[fertily_cycle_tracking]
[fertily_consultation]
[fertily_wallet]
```

Shortcode attributes:
- `feature` - Feature to display (required for generic button)
- `text` - Button text (optional, defaults to feature name)
- `class` - Additional CSS classes (optional)
- `style` - Inline styles (optional)

#### D. Gutenberg Blocks
Create Gutenberg blocks for each feature:
- Fertily AI Chat Block
- Fertily IVF Predictor Block
- Fertily Embryo Grading Block
- Fertily Appointments Block
- Fertily Cycle Tracking Block
- Fertily Consultation Block
- Fertily Wallet Block

Each block should have:
- Button text customization
- Button style options (primary, secondary, outline)
- Alignment options
- Custom CSS class field

#### E. Widget Support
Create a WordPress widget that can be added to sidebars:
- Widget Title (optional)
- Feature Selection (dropdown)
- Button Text (optional)
- Button Style (dropdown)

#### F. Floating Action Button (FAB)
Add option to display a floating action button that:
- Shows on all pages (with page exclusion options)
- Opens a menu with all enabled features
- Can be positioned in corners
- Customizable icon and colors
- Respects mobile responsiveness

### 3. Technical Implementation Details

**CRITICAL:** All implementation must follow the exact specifications in the SDK documentation files.

#### SDK Initialization Code
**Reference:** `sdk-documentation/03-javascript-sdk-reference.md` - Initialization section
```javascript
// The plugin should generate this initialization code
<script src="https://staging.fertilyapp.com/fertily-sdk.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    FertilySDK.init({
      tenantId: '<?php echo esc_js(get_option('fertily_clinic_id')); ?>',
      environment: '<?php echo esc_js(get_option('fertily_environment', 'production')); ?>',
      domain: window.location.hostname,
      debug: <?php echo get_option('fertily_debug_mode', false) ? 'true' : 'false'; ?>,
      userIdentifier: '<?php echo esc_js(wp_get_current_user()->user_email); ?>'
    });
  });
</script>
```

#### Feature Button Generation
**IMPORTANT:** Buttons must call SDK methods only - no direct API communication.

```php
function fertily_render_button($feature, $text = '', $class = '') {
    if (empty($text)) {
        $text = fertily_get_feature_name($feature);
    }
    
    // ✅ CORRECT: Generate button that calls SDK method
    // The onclick calls FertilySDK.show() - SDK handles everything from there
    $output = sprintf(
        '<button class="fertily-feature-btn %s" onclick="FertilySDK.show(\'%s\')">%s</button>',
        esc_attr($class),
        esc_js($feature),
        esc_html($text)
    );
    
    return $output;
}

// ✅ CORRECT: Check feature availability using SDK (client-side)
// This generates JavaScript that will check availability when page loads
function fertily_check_feature_availability_script($feature) {
    return "
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof FertilySDK !== 'undefined') {
            if (!FertilySDK.isFeatureAvailable('{$feature}')) {
                // Hide button if feature not available
                document.querySelector('[data-feature=\"{$feature}\"]').style.display = 'none';
            }
        }
    });
    </script>
    ";
}

// ❌ WRONG: Do NOT do this - no direct API calls from PHP
// function fertily_check_feature_availability($feature) {
//     $response = wp_remote_get('https://api.fertilyapp.com/api/sdk/features/' . $feature);
//     return wp_remote_retrieve_response_code($response) === 200;
// }
```

### 4. Security Requirements
- Sanitize all user inputs
- Escape all outputs
- Use WordPress nonces for form submissions
- Validate Clinic ID format
- Use wp_enqueue_script() for JavaScript loading
- Follow WordPress coding standards
- Implement capability checks (manage_options)

### 5. User Experience Features

#### Connection Test
**Reference:** `sdk-documentation/03-javascript-sdk-reference.md` - SDK initialization and events

Add a "Test Connection" button in admin that:
- ✅ Uses JavaScript to test SDK initialization
- ✅ Calls `FertilySDK.init()` to validate the Clinic ID
- ✅ Uses `FertilySDK.getAvailableFeatures()` to display features
- ✅ Listens to SDK events for success/error feedback
- ✅ Shows any configuration errors from SDK events

**Implementation:**
```javascript
// ✅ CORRECT: Test connection using SDK JavaScript methods ONLY
// ❌ WRONG: Do NOT use wp_remote_get() or any PHP HTTP functions
function testFertilyConnection() {
    const clinicId = document.getElementById('fertily_clinic_id').value;
    const environment = document.getElementById('fertily_environment').value;
    
    // Use SDK to test connection - SDK handles all API communication
    FertilySDK.init({
        tenantId: clinicId,
        environment: environment,
        debug: true
    }).then(() => {
        // Success - get available features using SDK method
        const features = FertilySDK.getAvailableFeatures();
        displayTestResults(true, features);
    }).catch((error) => {
        // Error - SDK provides user-friendly error message
        displayTestResults(false, [], error.message);
    });
}
```

**🚨 CRITICAL:** 
- ❌ Do NOT use `wp_remote_get()`, `wp_remote_post()`, or any PHP HTTP functions
- ❌ Do NOT make direct calls to `https://api.fertilyapp.com`
- ❌ Do NOT implement custom API request logic
- ✅ ONLY use the SDK JavaScript library for ALL communication

#### Visual Feedback
- Show loading states during SDK initialization
- Display error messages if SDK fails to load
- Provide success notifications when settings are saved
- Show feature availability status

#### Documentation Tab
Include a "Help" tab in admin with:
- Quick start guide
- Shortcode examples
- Troubleshooting tips
- Link to full documentation
- Support contact information

### 6. File Structure
```
fertily-sdk/
├── fertily-sdk.php (Main plugin file)
├── readme.txt (WordPress plugin readme)
├── assets/
│   ├── css/
│   │   ├── admin.css (Admin styles)
│   │   └── frontend.css (Frontend button styles)
│   ├── js/
│   │   ├── admin.js (Admin functionality)
│   │   └── frontend.js (Frontend initialization)
│   └── images/
│       └── icon.png (Plugin icon)
├── includes/
│   ├── class-fertily-sdk.php (Main class)
│   ├── class-admin.php (Admin interface)
│   ├── class-shortcodes.php (Shortcode handlers)
│   ├── class-blocks.php (Gutenberg blocks)
│   ├── class-widget.php (Widget class)
│   └── functions.php (Helper functions)
├── blocks/ (Gutenberg block definitions)
│   ├── ai-chat/
│   ├── ivf-prediction/
│   └── ... (other blocks)
└── languages/ (Translation files)
```

### 7. Additional Features

#### Analytics Dashboard (Optional)
Display basic usage statistics in WordPress admin:
- Total feature interactions
- Most used features
- Recent activity log

#### Multisite Support
Make plugin compatible with WordPress Multisite:
- Network-wide settings option
- Per-site configuration override
- Centralized license management

#### Hooks and Filters
Provide WordPress hooks for developers:
```php
// Filters
apply_filters('fertily_sdk_config', $config);
apply_filters('fertily_button_html', $html, $feature);
apply_filters('fertily_enabled_features', $features);

// Actions
do_action('fertily_sdk_initialized');
do_action('fertily_before_button_render', $feature);
do_action('fertily_after_settings_save', $settings);
```

### 8. Styling Requirements

#### Default Button Styles
Provide attractive default button styles that:
- Match common WordPress themes
- Are fully responsive
- Support hover/active states
- Include loading states
- Work with accessibility standards (WCAG 2.1)

#### Customization Options
Allow users to customize:
- Button colors (primary, secondary)
- Button sizes (small, medium, large)
- Border radius
- Font family
- Icon display (show/hide)

### 9. Compatibility
Ensure compatibility with:
- Popular WordPress themes (Astra, GeneratePress, OceanWP)
- Page builders (Elementor, Beaver Builder, Divi)
- WooCommerce (for payment features)
- WPML/Polylang (for multilingual sites)
- Common caching plugins

### 10. Error Handling
Implement robust error handling:
- Graceful degradation if SDK fails to load
- User-friendly error messages
- Admin notices for configuration issues
- Debug logging (when debug mode enabled)
- Fallback content options

### 11. Performance Optimization
- Lazy load SDK script (only when needed)
- Minify CSS/JS assets
- Cache SDK configuration
- Conditional loading (only on pages with features)
- Async script loading

### 12. Uninstall Cleanup
On plugin uninstall:
- Remove all plugin options from database
- Clean up transients
- Optionally remove usage logs
- Provide option to keep settings

## Example Usage Scenarios

### Scenario 1: Simple Button
```php
// In a WordPress page/post
[fertily_button feature="ai_chat" text="Ask Our AI Assistant" class="btn-primary"]
```

### Scenario 2: Sidebar Widget
Add "Fertily SDK" widget to sidebar, select "IVF Prediction" feature

### Scenario 3: Custom Template
```php
// In theme template file
<?php
if (function_exists('fertily_render_button')) {
    echo fertily_render_button('ai_chat', 'Get Fertility Advice');
}
?>
```

### Scenario 4: Floating Button
Enable FAB in settings, select all features, position bottom-right

## Testing Checklist
The plugin should be tested for:
- [ ] Settings save/load correctly
- [ ] SDK initializes on frontend
- [ ] All shortcodes work
- [ ] Gutenberg blocks render properly
- [ ] Widget displays correctly
- [ ] FAB appears and functions
- [ ] Mobile responsiveness
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] No JavaScript console errors
- [ ] No PHP warnings/errors
- [ ] Works with WordPress 5.8+
- [ ] Compatible with common themes
- [ ] Accessible (keyboard navigation, screen readers)

## Deliverables
Generate a complete, production-ready WordPress plugin with:
1. All PHP files with proper documentation
2. JavaScript files (admin and frontend)
3. CSS files (admin and frontend)
4. readme.txt file for WordPress.org
5. Installation instructions
6. Screenshots for WordPress.org listing
7. Changelog
8. License file

## Code Quality Standards
- Follow WordPress Coding Standards
- Use WordPress APIs (Settings API, Options API, etc.)
- Implement proper sanitization and validation
- Add inline documentation (PHPDoc)
- Use meaningful variable and function names
- Implement proper error handling
- Make code translation-ready (i18n)
- Follow security best practices

## SDK Methods Reference Summary

**🚨 CRITICAL:** The plugin must ONLY use these JavaScript SDK methods - NO direct API calls!

### ⛔ DO NOT USE - API Endpoints (Reference Only)
These endpoints are handled internally by the SDK. The plugin must NOT call them directly:
- ❌ `GET /api/sdk/config` - SDK handles this internally
- ❌ `POST /api/sdk/sessions` - SDK handles this internally
- ❌ `POST /api/sdk/features/access` - SDK handles this internally
- ❌ All other API endpoints - SDK handles all API communication

### ✅ USE THESE - JavaScript SDK Methods (from `sdk-documentation/03-javascript-sdk-reference.md`)
**These are the ONLY methods the plugin should use:**
- **Init:** `FertilySDK.init(options)` - Returns Promise
- **Show Feature:** `FertilySDK.show(feature, options)` - Returns Promise
- **Hide:** `FertilySDK.hide()` - Returns void
- **Check Availability:** `FertilySDK.isFeatureAvailable(feature)` - Returns Boolean
- **Get Features:** `FertilySDK.getAvailableFeatures()` - Returns Array
- **Get Config:** `FertilySDK.getFeatureConfig(feature)` - Returns Object
- **Events:** `FertilySDK.on(event, handler)` - See all events in documentation

### Available Features (from `sdk-documentation/01-sdk-overview.md`)
- `ai_chat` - AI Fertility Assistant
- `ivf_prediction` - IVF Success Predictor
- `embryo_grading` - Embryo Grading
- `escrow_wallet` - Secure Payments
- `appointment_booking` - Appointment Booking
- `cycle_tracking` - Cycle Tracking
- `expert_consultation` - Expert Consultation

### Environment URLs (from `sdk-documentation/01-sdk-overview.md`)
- **Development:** `http://localhost:9000`
- **Staging:** `https://staging-api.fertilyapp.com`
- **Production:** `https://api.fertilyapp.com`

### Error Handling (Handled by SDK - from `sdk-documentation/01-sdk-overview.md`)
The SDK handles all error scenarios internally. The plugin should:
- ✅ Listen to SDK events for error notifications
- ✅ Display user-friendly messages from SDK errors
- ✅ Use `FertilySDK.on('error', handler)` for error handling
- ❌ NOT implement custom retry logic (SDK handles this)
- ❌ NOT handle HTTP status codes directly (SDK handles this)
- ❌ NOT implement custom token refresh (SDK handles this)

**SDK Error Handling:**
- Network failures → SDK retries with exponential backoff
- Invalid configuration → SDK provides error message
- Token expiry → SDK auto-refreshes tokens
- Feature unavailable → Use `FertilySDK.isFeatureAvailable()` to check

### Security (Handled by SDK - from `sdk-documentation/01-sdk-overview.md`)
The SDK handles all security concerns. The plugin should:
- ✅ Pass `tenantId` (Clinic ID) to `FertilySDK.init()`
- ✅ Let SDK handle all authentication
- ❌ NOT store or manage API keys
- ❌ NOT handle JWT tokens directly
- ❌ NOT implement custom authentication logic

**SDK Security Features:**
- Clinic authentication → SDK handles with tenantId
- Session management → SDK manages JWT tokens internally
- Domain validation → SDK validates automatically
- Token quotas → SDK enforces limits
- Multi-tenant isolation → SDK ensures proper scoping

## Additional Notes

### ✅ What the Plugin SHOULD Do
- Load SDK from CDN: `https://cdn.fertilyapp.com/fertily-sdk.js`
- Initialize SDK with `FertilySDK.init({ tenantId, environment })`
- Use SDK methods to check feature availability
- Generate HTML/JavaScript that calls SDK methods
- Store only configuration settings (Clinic ID, environment) in WordPress database
- Listen to SDK events for tracking and feedback

### ❌ What the Plugin MUST NOT Do
- Make direct HTTP requests to `https://api.fertilyapp.com/api/sdk/`
- Use `wp_remote_get()`, `wp_remote_post()`, or any PHP HTTP functions to call Fertily API
- Store or manage API keys, JWT tokens, or session data
- Implement custom authentication or session management
- Query or interact with Fertily database schema
- Handle API responses directly (SDK does this)

### 🔑 Key Principles
- **SDK handles ALL API communication** - The plugin never touches the API directly
- **Plugin is a WordPress wrapper** - It provides WordPress-friendly interfaces (shortcodes, blocks, widgets) that call SDK methods
- **Configuration only** - Plugin stores Clinic ID and environment settings, nothing more
- **Client-side integration** - All Fertily functionality happens in JavaScript via the SDK
- **Security by SDK** - Authentication, sessions, and tokens are managed entirely by the SDK

---

## Generation Instructions

**STEP 1:** Read and understand the SDK-focused documentation:
- `03-javascript-sdk-reference.md` - **PRIMARY REFERENCE** - JavaScript SDK methods (ONLY interface to use)
- `05-integration-examples.md` - WordPress integration patterns using SDK methods
- `01-sdk-overview.md` - Architecture, concepts, and error handling

**STEP 2:** Reference the WordPress integration examples in `sdk-documentation/05-integration-examples.md` that demonstrate SDK-only usage

**STEP 3:** Implement ONLY JavaScript SDK methods from `sdk-documentation/03-javascript-sdk-reference.md`
- ✅ Use `FertilySDK.init()`, `FertilySDK.show()`, `FertilySDK.isFeatureAvailable()`, etc.
- ❌ Do NOT use API endpoints from `02-api-reference.md`
- ❌ Do NOT query database schema from `04-database-schema.md`

**STEP 4:** Follow SDK error handling patterns from `sdk-documentation/01-sdk-overview.md` (client-side only)

**STEP 5:** Generate the complete WordPress plugin code as a **wrapper around the JavaScript SDK**:
- Plugin loads and initializes the SDK
- Plugin provides WordPress interfaces (shortcodes, blocks, widgets)
- Plugin generates HTML/JavaScript that calls SDK methods
- Plugin stores only configuration (Clinic ID, environment)
- Plugin NEVER makes direct API calls

---

## Validation Checklist

Before finalizing the plugin, verify:

### ✅ Required (SDK-Only Implementation)
- [ ] **NO direct API calls** - Plugin uses ONLY SDK JavaScript methods
- [ ] **NO PHP HTTP requests** - No `wp_remote_get()`, `wp_remote_post()`, `curl`, etc. to Fertily API
- [ ] JavaScript initialization follows `sdk-documentation/03-javascript-sdk-reference.md`
- [ ] All features use SDK methods: `FertilySDK.show()`, `FertilySDK.isFeatureAvailable()`, etc.
- [ ] Error handling uses SDK events and error messages
- [ ] WordPress integration follows SDK-only examples in `sdk-documentation/05-integration-examples.md`
- [ ] Event tracking uses SDK events from `sdk-documentation/03-javascript-sdk-reference.md`
- [ ] Configuration object passed to `FertilySDK.init()` matches documentation
- [ ] Shortcodes and blocks generate JavaScript that calls SDK methods
- [ ] Admin interface uses SDK for connection testing (not direct API calls)

### ❌ Forbidden (Must NOT Be Present)
- [ ] No direct calls to API endpoints from `02-api-reference.md`
- [ ] No database queries to schema from `04-database-schema.md`
- [ ] No custom authentication or session management
- [ ] No storage of API keys, JWT tokens, or sensitive data
- [ ] No custom HTTP request logic to Fertily backend

### 🎯 Architecture Validation
- [ ] Plugin acts purely as WordPress wrapper around JavaScript SDK
- [ ] All Fertily functionality happens client-side via SDK
- [ ] Plugin only stores configuration (Clinic ID, environment, display settings)
- [ ] Security handled entirely by SDK (no custom security implementation)

---

## 🎯 Final Implementation Summary

### Plugin Architecture
The WordPress plugin you generate is a **thin wrapper** that:
1. **Loads** the Fertily SDK JavaScript library from CDN
2. **Initializes** the SDK with configuration from WordPress settings
3. **Provides** WordPress-friendly interfaces (shortcodes, blocks, widgets)
4. **Generates** HTML and JavaScript that calls SDK methods
5. **Stores** only configuration data (Clinic ID, environment, display preferences)

### Communication Flow
```
User clicks button → JavaScript calls FertilySDK.show() → SDK handles API call → SDK displays feature
                                                          ↑
                                                    Plugin never involved
                                                    in API communication
```

### What Gets Stored in WordPress Database
- ✅ Clinic ID (tenant ID)
- ✅ Environment selection (development/staging/production)
- ✅ Feature enable/disable toggles
- ✅ Display preferences (button styles, colors, positions)
- ✅ Debug mode setting
- ❌ NO API keys
- ❌ NO JWT tokens
- ❌ NO session data
- ❌ NO user data from Fertily

### Code Examples Summary

**✅ CORRECT - SDK Method Usage:**
```javascript
// Initialize SDK
FertilySDK.init({ tenantId: 'clinic-123', environment: 'production' });

// Show feature
FertilySDK.show('ai_chat');

// Check availability
if (FertilySDK.isFeatureAvailable('ivf_prediction')) {
    // Show button
}

// Listen to events
FertilySDK.on('feature:show', function(feature) {
    console.log('Feature opened:', feature);
});
```

**❌ WRONG - Direct API Calls (DO NOT DO THIS):**
```php
// ❌ NEVER do this
$response = wp_remote_get('https://api.fertilyapp.com/api/sdk/config?clinic_id=' . $clinic_id);
$response = wp_remote_post('https://api.fertilyapp.com/api/sdk/sessions', $data);
$curl = curl_init('https://api.fertilyapp.com/api/sdk/features');
```

---

**Generate the complete WordPress plugin code based on these specifications. The plugin must be a pure wrapper around the Fertily JavaScript SDK, with NO direct API calls. Include all necessary files with full implementation, proper error handling, security measures, and user-friendly interfaces.**
