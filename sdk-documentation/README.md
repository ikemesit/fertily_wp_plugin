# Fertily SDK Documentation

Complete technical documentation for the Fertily SDK - an embeddable JavaScript library for integrating AI-powered fertility features into clinic websites.

## Documentation Structure

### 1. [SDK Overview](./01-sdk-overview.md)
**Purpose:** High-level understanding of the SDK architecture and concepts

**Contents:**
- What is the Fertily SDK?
- Architecture overview with diagrams
- Key concepts (multi-tenancy, sessions, features)
- Data flow diagrams
- Environment configuration
- Security model
- Performance considerations
- Error handling
- Monitoring & analytics

**Best for:** Developers new to the SDK, architects planning integration

---

### 2. [API Reference](./02-api-reference.md)
**Purpose:** Complete REST API documentation for backend integration

**Contents:**
- Base URLs for all environments
- Authentication methods (API key, JWT)
- Public endpoints (config, sessions, features)
- Admin endpoints (clinic management, features, tokens)
- Clinic self-service endpoints
- Error responses and status codes
- Rate limiting
- Webhooks

**Best for:** Backend developers, API integration, admin panel development

---

### 3. [JavaScript SDK Reference](./03-javascript-sdk-reference.md)
**Purpose:** Complete JavaScript API documentation for frontend integration

**Contents:**
- Installation methods (CDN, NPM)
- Initialization options
- Core methods (init, show, hide, destroy)
- Feature-specific methods
- Query methods (isFeatureAvailable, getAvailableFeatures)
- Authentication methods
- Event system (on, off, trigger)
- All available events
- Configuration object structure
- Error handling patterns
- Complete usage examples

**Best for:** Frontend developers, JavaScript integration

---

### 4. [Database Schema](./04-database-schema.md)
**Purpose:** Database structure and relationships

**Contents:**
- Complete table schemas with SQL
- Relationships diagram
- Common queries
- Data retention policies
- Index strategy
- Migration information
- Backup strategy

**Best for:** Database administrators, backend developers, DevOps

---

### 5. [Integration Examples](./05-integration-examples.md)
**Purpose:** Real-world integration code examples

**Contents:**
- Basic HTML integration
- React integration (hooks, components)
- Vue.js integration (Composition API, plugins)
- WordPress integration (themes, Gutenberg blocks)
- Next.js integration (App Router)
- Custom button styling
- Advanced use cases (analytics, error handling)

**Best for:** Developers implementing the SDK, quick start guides

---

## Quick Start Guide

### For Clinic Administrators
1. Get your Clinic ID from the admin panel
2. Choose your integration method (WordPress plugin, custom code, etc.)
3. Follow the integration guide for your platform
4. Configure enabled features in admin panel
5. Test on your website

### For Developers
1. Read [SDK Overview](./01-sdk-overview.md) for architecture understanding
2. Review [JavaScript SDK Reference](./03-javascript-sdk-reference.md) for API details
3. Check [Integration Examples](./05-integration-examples.md) for your framework
4. Implement using the code examples
5. Test in development environment
6. Deploy to production

### For Backend Developers
1. Review [API Reference](./02-api-reference.md) for endpoint details
2. Check [Database Schema](./04-database-schema.md) for data structure
3. Implement admin features using API endpoints
4. Set up webhooks if needed
5. Monitor usage via analytics endpoints

---

## Common Use Cases

### Use Case 1: Basic Website Integration
**Goal:** Add AI chat button to clinic website

**Steps:**
1. Add SDK script tag to website
2. Initialize with clinic ID
3. Add button with onclick handler
4. Test feature access

**Documentation:**
- [Integration Examples - Basic HTML](./05-integration-examples.md#basic-html-integration)
- [JavaScript SDK Reference - init()](./03-javascript-sdk-reference.md#initoptions)

---

### Use Case 2: React Application
**Goal:** Integrate SDK into React app with proper lifecycle management

**Steps:**
1. Create custom hook for SDK
2. Load SDK in useEffect
3. Handle cleanup on unmount
4. Create feature buttons

**Documentation:**
- [Integration Examples - React](./05-integration-examples.md#react-integration)
- [JavaScript SDK Reference - Events](./03-javascript-sdk-reference.md#events)

---

### Use Case 3: WordPress Plugin
**Goal:** Create WordPress plugin for easy SDK integration

**Steps:**
1. Create plugin structure
2. Add admin settings page
3. Enqueue SDK script
4. Create shortcodes and blocks
5. Add widget support

**Documentation:**
- [Integration Examples - WordPress](./05-integration-examples.md#wordpress-integration)
- [WordPress Plugin Prompt](../wordpress-plugin-generation-prompt.md)

---

### Use Case 4: Admin Panel Development
**Goal:** Build admin interface for managing SDK configuration

**Steps:**
1. Authenticate with admin credentials
2. Use admin API endpoints
3. Display clinic configuration
4. Enable/disable features
5. View usage statistics

**Documentation:**
- [API Reference - Admin Endpoints](./02-api-reference.md#admin-endpoints)
- [Database Schema](./04-database-schema.md)

---

## Key Concepts Explained

### Multi-Tenancy
Each clinic is a separate tenant with isolated:
- Configuration
- Feature settings
- Usage tracking
- User sessions

**Learn more:** [SDK Overview - Multi-Tenancy](./01-sdk-overview.md#1-multi-tenancy)

---

### Session Management
Sessions track user interactions:
- Created on SDK initialization
- Include JWT token for authentication
- Expire after 24 hours
- Auto-refresh before expiry

**Learn more:** [SDK Overview - Session-Based Architecture](./01-sdk-overview.md#2-session-based-architecture)

---

### Feature Access Control
Features are controlled by:
- Enable/disable flags
- Daily/monthly usage limits
- Token quotas
- Domain restrictions

**Learn more:** [SDK Overview - Feature-Based Access Control](./01-sdk-overview.md#3-feature-based-access-control)

---

### Token System
Two types of tokens:
1. **JWT Session Token**: Authenticates SDK sessions
2. **Usage Tokens**: Quota for AI features (like API credits)

**Learn more:** [API Reference - Authentication](./02-api-reference.md#authentication)

---

## Troubleshooting

### SDK Not Initializing
**Symptoms:** SDK.init() fails or times out

**Solutions:**
1. Check clinic ID is correct
2. Verify SDK is enabled in admin panel
3. Check browser console for errors
4. Verify domain is whitelisted

**Documentation:** [JavaScript SDK Reference - Error Handling](./03-javascript-sdk-reference.md#error-handling)

---

### Feature Access Denied
**Symptoms:** Feature shows "Access Denied" error

**Solutions:**
1. Check feature is enabled for clinic
2. Verify usage limits not exceeded
3. Check token quota remaining
4. Verify session is valid

**Documentation:** [API Reference - Request Feature Access](./02-api-reference.md#request-feature-access)

---

### Token Refresh Failures
**Symptoms:** "Token refresh failed" errors

**Solutions:**
1. Check session hasn't expired
2. Verify network connectivity
3. Check API endpoint is accessible
4. Re-initialize SDK if needed

**Documentation:** [JavaScript SDK Reference - token:refresh_failed](./03-javascript-sdk-reference.md#tokenrefresh_failed)

---

## API Endpoints Quick Reference

### Public Endpoints
- `GET /config` - Get SDK configuration
- `POST /sessions` - Initialize session
- `POST /sessions/{id}/refresh` - Refresh token
- `POST /features/access` - Request feature access

### Admin Endpoints
- `GET /admin/clinics` - List SDK clinics
- `POST /admin/clinics/{id}/enable` - Enable SDK
- `GET /admin/clinics/{id}/config` - Get config
- `PUT /admin/clinics/{id}/config` - Update config
- `POST /admin/clinics/{id}/features` - Create feature
- `GET /admin/clinics/{id}/stats` - Get statistics

**Full Reference:** [API Reference](./02-api-reference.md)

---

## JavaScript Methods Quick Reference

### Initialization
- `FertilySDK.init(options)` - Initialize SDK
- `FertilySDK.destroy()` - Cleanup SDK

### Feature Display
- `FertilySDK.show(feature, options)` - Show feature
- `FertilySDK.hide()` - Hide feature
- `FertilySDK.showAIChat()` - Show AI chat
- `FertilySDK.showIVFPredictor()` - Show IVF predictor

### Query Methods
- `FertilySDK.isFeatureAvailable(feature)` - Check availability
- `FertilySDK.getAvailableFeatures()` - List features
- `FertilySDK.isPublic()` - Check if public
- `FertilySDK.getFeatureConfig(feature)` - Get config

### Events
- `FertilySDK.on(event, handler)` - Add listener
- `FertilySDK.off(event, handler)` - Remove listener

**Full Reference:** [JavaScript SDK Reference](./03-javascript-sdk-reference.md)

---

## Support & Resources

### Documentation
- [SDK Overview](./01-sdk-overview.md)
- [API Reference](./02-api-reference.md)
- [JavaScript SDK Reference](./03-javascript-sdk-reference.md)
- [Database Schema](./04-database-schema.md)
- [Integration Examples](./05-integration-examples.md)

### Code Examples
- [WordPress Plugin Prompt](../wordpress-plugin-generation-prompt.md)
- [React Integration](./05-integration-examples.md#react-integration)
- [Vue.js Integration](./05-integration-examples.md#vuejs-integration)

### Getting Help
- Email: support@fertilyapp.com
- Developer Portal: https://developers.fertilyapp.com
- Status Page: https://status.fertilyapp.com

---

## Version Information

- **SDK Version:** 1.0.0
- **API Version:** v1
- **Last Updated:** 2024-01-01
- **Compatibility:** All modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

---

## Contributing

This documentation is maintained alongside the SDK codebase. For corrections or improvements:

1. Review the relevant documentation file
2. Submit changes with clear descriptions
3. Include code examples where applicable
4. Update version information if needed

---

## License

Copyright © 2024 Fertily. All rights reserved.

This documentation is provided for SDK integration purposes only.
