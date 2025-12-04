/**
 * Fertily SDK - Embeddable Fertility Features
 * Version: 1.0.0
 *
 * Usage:
 * <script src="https://cdn.fertilyapp.com/fertily-sdk.js"></script>
 * <script>
 *   FertilySDK.init({
 *     tenantId: "your-tenant-id",
 *     domain: window.location.hostname
 *   });
 * </script>
 */

/**
 * @param {'production' | 'staging' | 'development'} Environment
 * @returns {string} Base URL for the environment
 */
const GetUrl = (Environment = "development") => {
  const urls = {
    production: "https://api.fertilyapp.com",
    staging: "https://staging-api.fertilyapp.com",
    development: "http://localhost:9000",
  };
  return urls[Environment] || urls.development;
};

(function (window, document) {
  "use strict";

  // SDK Configuration
  let SDK_CONFIG = {
    API_BASE_URL: "",
    EMBED_BASE_URL: "",
    VERSION: "1.0.0",
    DEBUG: false,
  };

  // Available features
  const FEATURES = {
    AI_CHAT: "ai_chat",
    IVF_PREDICTION: "ivf_prediction",
    EMBRYO_GRADING: "embryo_grading",
    ESCROW_WALLET: "escrow_wallet",
    APPOINTMENT_BOOKING: "appointment_booking",
    CYCLE_TRACKING: "cycle_tracking",
    EXPERT_CONSULTATION: "expert_consultation",
  };

  // Feature display names and descriptions
  const FEATURE_INFO = {
    [FEATURES.AI_CHAT]: {
      name: "AI Fertility Assistant",
      description: "Chat with our AI-powered fertility expert",
      icon: "🤖",
    },
    [FEATURES.IVF_PREDICTION]: {
      name: "IVF Success Predictor",
      description: "Get personalized IVF success predictions",
      icon: "🔮",
    },
    [FEATURES.EMBRYO_GRADING]: {
      name: "Embryo Grading",
      description: "AI-powered embryo quality assessment",
      icon: "🔬",
    },
    [FEATURES.ESCROW_WALLET]: {
      name: "Secure Payments",
      description: "Manage fertility treatment payments",
      icon: "💳",
    },
    [FEATURES.APPOINTMENT_BOOKING]: {
      name: "Book Appointments",
      description: "Schedule fertility consultations",
      icon: "📅",
    },
    [FEATURES.CYCLE_TRACKING]: {
      name: "Cycle Tracking",
      description: "Track your fertility cycle",
      icon: "📊",
    },
    [FEATURES.EXPERT_CONSULTATION]: {
      name: "Expert Consultation",
      description: "Connect with fertility specialists",
      icon: "👨‍⚕️",
    },
  };

  // Main SDK object
  const FertilySDK = {
    // Configuration
    config: null,
    sessionId: null,
    jwtToken: null,
    tokenExpiry: null,
    refreshTimer: null,
    isInitialized: false,
    isRefreshing: false,
    refreshPromise: null,
    userToken: null, // User authentication token (for private SDKs)
    isAuthenticated: false,

    // UI Elements
    popupOverlay: null,
    currentIframe: null,

    // Event handlers
    eventHandlers: {},

    /**
     * Initialize the SDK
     * @param {Object} options - Configuration options
     * @param {string} options.tenantId - Your clinic ID (tenant ID)
     * @param {'production'|'staging'|'development'} [options.environment='development'] - Environment to use
     * @param {string} [options.domain] - Your domain (auto-detected if not provided)
     * @param {string} [options.userIdentifier] - Optional user identifier
     * @param {boolean} [options.debug] - Enable debug mode
     */
    init: async function (options) {
      try {
        if (this.isInitialized) {
          this.log("SDK already initialized");
          return;
        }

        if (!options || !options.tenantId) {
          throw new Error("tenantId is required");
        }

        // Set debug mode
        if (options.debug) {
          SDK_CONFIG.DEBUG = true;
        }

        // Set base URLs based on environment
        const baseUrl = GetUrl(options.environment || "development");
        SDK_CONFIG.API_BASE_URL = `${baseUrl}/api/sdk`;
        SDK_CONFIG.EMBED_BASE_URL = `${baseUrl}/api/embed`;

        this.log("Initializing Fertily SDK...", options);

        // Initialize session
        const initResponse = await this.initializeSession({
          clinic_id: options.tenantId,
          domain: options.domain || window.location.hostname,
          user_identifier: options.userIdentifier,
        });

        if (!initResponse.success) {
          throw new Error(initResponse.error || "Failed to initialize session");
        }

        this.sessionId = initResponse.session_id;
        this.jwtToken = initResponse.jwt_token;
        this.config = initResponse.config;
        this.isInitialized = true;

        // Check for stored user authentication token (after config is set)
        this.restoreUserAuthentication();

        // Set token expiry (JWT tokens typically expire in 24 hours, we'll refresh at 23 hours)
        this.setTokenExpiry(initResponse.expires_in || 86400); // Default 24 hours

        this.log("SDK initialized successfully", this.config);

        // Set up global styles
        this.injectStyles();

        // Schedule token refresh
        this.scheduleTokenRefresh();

        // Trigger ready event
        this.trigger("ready", { config: this.config });
      } catch (error) {
        this.error("Failed to initialize SDK:", error);
        throw error;
      }
    },

    /**
     * Show a specific feature
     * @param {string} feature - Feature to show
     * @param {Object} [options] - Additional options
     */
    show: async function (feature, options = {}) {
      try {
        if (!this.isInitialized) {
          throw new Error("SDK not initialized. Call FertilySDK.init() first.");
        }

        // Check if SDK requires authentication (private SDK)
        if (!this.config.is_public && !this.isAuthenticated) {
          this.log("SDK is private, authentication required");
          // Show login dialog
          const loginSuccess = await this.showLoginDialog();
          if (!loginSuccess) {
            throw new Error("Authentication required to access this feature");
          }
        }

        // Ensure token is valid before showing feature
        await this.ensureValidToken();

        if (!this.config.features.includes(feature)) {
          throw new Error(
            `Feature '${feature}' is not enabled for this tenant`,
          );
        }

        this.log(`Showing feature: ${feature}`, options);

        // Generate iframe URL for the feature
        const iframeUrl = this.generateFeatureUrl(feature, options);

        // Show the feature in popup
        this.showPopup(feature, iframeUrl, {});

        // Trigger event
        this.trigger("feature:show", { feature, options });
      } catch (error) {
        this.error(`Failed to show feature ${feature}:`, error);

        // Show user-friendly error
        this.showError(error.message);
      }
    },

    /**
     * Hide the current popup
     */
    hide: function () {
      if (this.popupOverlay) {
        document.body.removeChild(this.popupOverlay);
        this.popupOverlay = null;
        this.currentIframe = null;
        this.trigger("feature:hide");
      }
    },

    /**
     * Refresh SDK configuration and update branding
     */
    refreshConfig: async function () {
      try {
        if (!this.isInitialized) {
          throw new Error("SDK not initialized");
        }

        this.log("Refreshing SDK configuration...");

        // Re-fetch configuration
        const initResponse = await this.initializeSession({
          clinic_id: this.config.clinic_id,
          domain: window.location.hostname,
        });

        if (!initResponse.success) {
          throw new Error(
            initResponse.error || "Failed to refresh configuration",
          );
        }

        // Update config
        this.config = initResponse.config;

        // Re-inject styles with new branding
        this.injectStyles(true);

        this.log("SDK configuration refreshed successfully", this.config);
        this.trigger("config:refreshed", { config: this.config });

        return true;
      } catch (error) {
        this.error("Failed to refresh SDK configuration:", error);
        throw error;
      }
    },

    /**
     * Destroy SDK instance and clean up
     */
    destroy: function () {
      this.log("Destroying SDK instance...");
      this.hide();
      this.clearRefreshTimer();
      this.isInitialized = false;
      this.sessionId = null;
      this.jwtToken = null;
      this.tokenExpiry = null;
      this.config = null;
      this.eventHandlers = {};
      this.trigger("destroyed");
    },

    /**
     * Check if a feature is available
     * @param {string} feature - Feature to check
     * @returns {boolean}
     */
    isFeatureAvailable: function (feature) {
      return (
        this.isInitialized &&
        this.config &&
        this.config.features.includes(feature)
      );
    },

    /**
     * Get available features
     * @returns {Array} List of available features
     */
    getAvailableFeatures: function () {
      return this.isInitialized && this.config ? this.config.features : [];
    },

    /**
     * Check if SDK is publicly accessible
     * @returns {boolean} True if SDK is public
     */
    isPublic: function () {
      return this.isInitialized && this.config ? this.config.is_public : false;
    },

    /**
     * Get feature configuration
     * @param {string} feature - Feature name
     * @returns {Object|null} Feature configuration
     */
    getFeatureConfig: function (feature) {
      if (!this.isInitialized || !this.config) {
        return null;
      }
      return this.config.feature_configs[feature] || null;
    },

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on: function (event, handler) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }
      this.eventHandlers[event].push(handler);
    },

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler to remove
     */
    off: function (event, handler) {
      if (this.eventHandlers[event]) {
        const index = this.eventHandlers[event].indexOf(handler);
        if (index > -1) {
          this.eventHandlers[event].splice(index, 1);
        }
      }
    },

    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    trigger: function (event, data) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            this.error("Error in event handler:", error);
          }
        });
      }
    },

    // Internal methods

    /**
     * Initialize session with backend
     */
    initializeSession: async function (data) {
      const response = await fetch(`${SDK_CONFIG.API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },

    /**
     * Refresh the JWT token
     */
    refreshToken: async function () {
      // Prevent multiple simultaneous refresh attempts
      if (this.isRefreshing && this.refreshPromise) {
        return this.refreshPromise;
      }

      this.isRefreshing = true;
      this.refreshPromise = (async () => {
        try {
          this.log("Refreshing token...");

          const response = await fetch(
            `${SDK_CONFIG.API_BASE_URL}/sessions/${this.sessionId}/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.jwtToken}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          // Update token and expiry
          this.jwtToken = data.jwt_token;
          this.setTokenExpiry(data.expires_in || 86400);

          this.log("Token refreshed successfully");

          // Schedule next refresh
          this.scheduleTokenRefresh();

          // Trigger token refresh event
          this.trigger("token:refreshed", {
            expiresAt: this.tokenExpiry,
          });

          return data;
        } catch (error) {
          this.error("Failed to refresh token:", error);

          // Trigger token refresh error event
          this.trigger("token:refresh_failed", { error: error.message });

          // If refresh fails, we might need to re-initialize
          throw error;
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      })();

      return this.refreshPromise;
    },

    /**
     * Set token expiry time
     */
    setTokenExpiry: function (expiresIn) {
      // expiresIn is in seconds, convert to milliseconds
      this.tokenExpiry = Date.now() + expiresIn * 1000;
      this.log(
        `Token will expire at: ${new Date(this.tokenExpiry).toISOString()}`,
      );
    },

    /**
     * Check if token is expired or about to expire
     */
    isTokenExpired: function () {
      if (!this.tokenExpiry) {
        return false;
      }
      // Consider token expired if it expires in less than 5 minutes
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return Date.now() >= this.tokenExpiry - bufferTime;
    },

    /**
     * Ensure token is valid, refresh if needed
     */
    ensureValidToken: async function () {
      if (this.isTokenExpired()) {
        this.log("Token expired or about to expire, refreshing...");
        await this.refreshToken();
      }
    },

    /**
     * Schedule automatic token refresh
     */
    scheduleTokenRefresh: function () {
      // Clear existing timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      if (!this.tokenExpiry) {
        return;
      }

      // Schedule refresh 10 minutes before expiry
      const refreshTime = this.tokenExpiry - Date.now() - 10 * 60 * 1000;

      if (refreshTime > 0) {
        this.log(
          `Scheduling token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`,
        );

        this.refreshTimer = setTimeout(async () => {
          try {
            await this.refreshToken();
          } catch (error) {
            this.error("Automatic token refresh failed:", error);
            // Optionally notify the user or trigger re-initialization
          }
        }, refreshTime);
      } else {
        // Token is already expired or about to expire, refresh immediately
        this.log("Token needs immediate refresh");
        this.refreshToken().catch((error) => {
          this.error("Immediate token refresh failed:", error);
        });
      }
    },

    /**
     * Clear refresh timer (useful for cleanup)
     */
    clearRefreshTimer: function () {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    /**
     * Show login dialog for private SDKs
     * @returns {Promise<boolean>} True if login successful
     */
    showLoginDialog: function () {
      return new Promise((resolve) => {
        // Create login overlay
        const loginOverlay = document.createElement("div");
        loginOverlay.className = "fertily-sdk-overlay";

        const loginDialog = document.createElement("div");
        loginDialog.className = "fertily-sdk-login-dialog";
        loginDialog.innerHTML = `
          <div class="fertily-sdk-login-header">
            <h3>Login Required</h3>
            <p>This feature requires authentication</p>
          </div>
          <form class="fertily-sdk-login-form" id="fertily-login-form">
            <div class="fertily-sdk-form-group">
              <label for="fertily-email">Email</label>
              <input type="email" id="fertily-email" name="email" required 
                     placeholder="Enter your email" class="fertily-sdk-input" />
            </div>
            <div class="fertily-sdk-form-group">
              <label for="fertily-password">Password</label>
              <input type="password" id="fertily-password" name="password" required 
                     placeholder="Enter your password" class="fertily-sdk-input" />
            </div>
            <div class="fertily-sdk-login-error" id="fertily-login-error" style="display: none;"></div>
            <div class="fertily-sdk-login-actions">
              <button type="button" class="fertily-sdk-btn fertily-sdk-btn-secondary" id="fertily-login-cancel">
                Cancel
              </button>
              <button type="submit" class="fertily-sdk-btn fertily-sdk-btn-primary" id="fertily-login-submit">
                Login
              </button>
            </div>
          </form>
        `;

        loginOverlay.appendChild(loginDialog);
        document.body.appendChild(loginOverlay);

        const form = document.getElementById("fertily-login-form");
        const errorDiv = document.getElementById("fertily-login-error");
        const submitBtn = document.getElementById("fertily-login-submit");
        const cancelBtn = document.getElementById("fertily-login-cancel");

        // Handle cancel
        cancelBtn.addEventListener("click", () => {
          document.body.removeChild(loginOverlay);
          resolve(false);
        });

        // Handle form submission
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          errorDiv.style.display = "none";
          submitBtn.disabled = true;
          submitBtn.textContent = "Logging in...";

          const email = document.getElementById("fertily-email").value;
          const password = document.getElementById("fertily-password").value;

          try {
            // Call login API
            const response = await fetch(
              `${SDK_CONFIG.API_BASE_URL.replace("/sdk", "")}/auth/login/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              },
            );

            if (!response.ok) {
              throw new Error("Invalid email or password");
            }

            const data = await response.json();

            // Store user token
            this.userToken = data.access_token;
            this.isAuthenticated = true;

            // Persist authentication to localStorage
            this.saveUserAuthentication(data.access_token, email);

            // Update session with user authentication
            await this.updateSessionWithUser(data.access_token);

            this.log("User authenticated successfully");
            this.trigger("user:authenticated", { email });

            document.body.removeChild(loginOverlay);
            resolve(true);
          } catch (error) {
            this.error("Login failed:", error);
            errorDiv.textContent =
              error.message || "Login failed. Please try again.";
            errorDiv.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
          }
        });
      });
    },

    /**
     * Update session with user authentication
     */
    updateSessionWithUser: async function (userToken) {
      try {
        // This would update the session on the backend to associate it with the authenticated user
        // For now, we just store the token locally
        this.log("Session updated with user authentication");
      } catch (error) {
        this.error("Failed to update session:", error);
      }
    },

    /**
     * Save user authentication to localStorage
     */
    saveUserAuthentication: function (token, email) {
      try {
        const authData = {
          token,
          email,
          timestamp: Date.now(),
          tenantId: this.config?.clinic_id || this.sessionId,
        };
        localStorage.setItem(
          `fertily_sdk_auth_${this.config?.clinic_id}`,
          JSON.stringify(authData),
        );
        this.log("User authentication saved to localStorage");
      } catch (error) {
        this.error("Failed to save authentication:", error);
      }
    },

    /**
     * Restore user authentication from localStorage
     */
    restoreUserAuthentication: function () {
      try {
        const authKey = `fertily_sdk_auth_${this.config?.clinic_id}`;
        const storedAuth = localStorage.getItem(authKey);

        if (storedAuth) {
          const authData = JSON.parse(storedAuth);

          // Check if token is not too old (e.g., 7 days)
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          const age = Date.now() - authData.timestamp;

          if (age < maxAge) {
            this.userToken = authData.token;
            this.isAuthenticated = true;
            this.log(
              "User authentication restored from localStorage:",
              authData.email,
            );
            this.trigger("user:authenticated", { email: authData.email });
          } else {
            // Token too old, remove it
            this.log("Stored authentication expired, clearing...");
            localStorage.removeItem(authKey);
          }
        }
      } catch (error) {
        this.error("Failed to restore authentication:", error);
      }
    },

    /**
     * Clear user authentication
     */
    clearUserAuthentication: function () {
      try {
        const authKey = `fertily_sdk_auth_${this.config?.clinic_id}`;
        localStorage.removeItem(authKey);
        this.userToken = null;
        this.isAuthenticated = false;
        this.log("User authentication cleared");
        this.trigger("user:logout");
      } catch (error) {
        this.error("Failed to clear authentication:", error);
      }
    },

    /**
     * Generate feature URL
     */
    generateFeatureUrl: function (feature, options) {
      const featureMap = {
        [FEATURES.AI_CHAT]: "chat",
        [FEATURES.IVF_PREDICTION]: "ivf-prediction",
        [FEATURES.EMBRYO_GRADING]: "embryo-grading",
        [FEATURES.ESCROW_WALLET]: "wallet",
        [FEATURES.APPOINTMENT_BOOKING]: "appointments",
      };

      const endpoint = featureMap[feature] || feature;
      // Pass JWT token as a query param so server can authenticate the HTML request
      const url = new URL(`${SDK_CONFIG.EMBED_BASE_URL}/${endpoint}`);
      url.searchParams.set("token", this.jwtToken);

      // If user is authenticated, pass user token as well
      if (this.userToken) {
        url.searchParams.set("user_token", this.userToken);
      }

      return url.toString();
    },

    /**
     * Show popup with iframe
     */
    showPopup: function (feature, iframeUrl, config) {
      // Remove existing popup
      this.hide();

      // Create overlay
      this.popupOverlay = document.createElement("div");
      this.popupOverlay.className = "fertily-sdk-overlay";

      // Add loading state
      this.popupOverlay.innerHTML = `
        <div class="fertily-sdk-loading">
          <div class="fertily-sdk-spinner"></div>
          <div>Loading ${FEATURE_INFO[feature]?.name || feature}...</div>
        </div>
      `;

      document.body.appendChild(this.popupOverlay);

      // Create popup container
      const popup = document.createElement("div");
      popup.className = "fertily-sdk-popup";

      // Create header
      const header = document.createElement("div");
      header.className = "fertily-sdk-header";

      const featureInfo = FEATURE_INFO[feature] || {
        name: feature,
        icon: "🔧",
      };
      const title = config?.custom_title || featureInfo.name;

      header.innerHTML = `
        <div class="fertily-sdk-title">
          <span class="fertily-sdk-icon">${featureInfo.icon}</span>
          <span class="fertily-sdk-text">${title}</span>
        </div>
        <button class="fertily-sdk-close" type="button">&times;</button>
      `;

      // Create iframe
      this.currentIframe = document.createElement("iframe");
      this.currentIframe.src = iframeUrl;
      this.currentIframe.className = "fertily-sdk-iframe";
      this.currentIframe.setAttribute("frameborder", "0");
      this.currentIframe.setAttribute("allowfullscreen", "true");
      this.currentIframe.setAttribute(
        "allow",
        "camera; microphone; clipboard-write",
      );

      // Add loading indicator
      this.currentIframe.addEventListener("load", () => {
        this.log("Feature iframe loaded successfully");
      });

      this.currentIframe.addEventListener("error", () => {
        this.error("Failed to load feature iframe");
        this.showError("Failed to load feature. Please try again.");
      });

      // Assemble popup
      popup.appendChild(header);
      popup.appendChild(this.currentIframe);
      this.popupOverlay.appendChild(popup);

      // Add event listeners
      const closeBtn = header.querySelector(".fertily-sdk-close");
      closeBtn.addEventListener("click", () => this.hide());

      this.popupOverlay.addEventListener("click", (e) => {
        if (e.target === this.popupOverlay) {
          this.hide();
        }
      });

      // Handle escape key
      const escapeHandler = (e) => {
        if (e.key === "Escape") {
          this.hide();
          document.removeEventListener("keydown", escapeHandler);
        }
      };
      document.addEventListener("keydown", escapeHandler);

      // Replace loading with popup
      this.popupOverlay.innerHTML = "";
      this.popupOverlay.appendChild(popup);

      // Focus management
      setTimeout(() => {
        const firstFocusable = popup.querySelector("button, iframe");
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 100);
    },

    /**
     * Show error message
     */
    showError: function (message) {
      // Create simple error notification
      const errorDiv = document.createElement("div");
      errorDiv.className = "fertily-sdk-error";
      errorDiv.innerHTML = `
        <div class="fertily-sdk-error-content">
          <span class="fertily-sdk-error-icon">⚠️</span>
          <span class="fertily-sdk-error-message">${message}</span>
          <button class="fertily-sdk-error-close" type="button">&times;</button>
        </div>
      `;

      errorDiv
        .querySelector(".fertily-sdk-error-close")
        .addEventListener("click", () => {
          document.body.removeChild(errorDiv);
        });

      document.body.appendChild(errorDiv);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
    },

    /**
     * Inject CSS styles with clinic branding
     * @param {boolean} force - Force re-injection of styles
     */
    injectStyles: function (force = false) {
      const existingStyles = document.getElementById("fertily-sdk-styles");
      if (existingStyles && !force) {
        return; // Already injected
      }

      // Remove existing styles if forcing re-injection
      if (existingStyles && force) {
        existingStyles.remove();
      }

      // Get colors from config or use defaults
      const primaryColor = this.config?.primary_color || "#007bff";
      const secondaryColor = this.config?.secondary_color || "#6c757d";
      const accentColor = this.config?.accent_color || "#28a745";
      const backgroundColor = this.config?.background_color || "#ffffff";
      const textColor = this.config?.text_color || "#212529";
      const buttonStyle = this.config?.button_style || "rounded";
      const fontFamily = this.config?.font_family || "Inter, sans-serif";

      // Calculate border radius for buttons based on button style
      let btnBorderRadius = "10px";
      if (buttonStyle === "pill") {
        btnBorderRadius = "9999px";
      } else if (buttonStyle === "square") {
        btnBorderRadius = "0px";
      }

      const style = document.createElement("style");
      style.id = "fertily-sdk-styles";
      style.textContent = `
        :root {
          --fertily-primary: ${primaryColor};
          --fertily-secondary: ${secondaryColor};
          --fertily-accent: ${accentColor};
          --fertily-bg: ${backgroundColor};
          --fertily-text: ${textColor};
          --fertily-btn-radius: ${btnBorderRadius};
          --fertily-radius: 16px;
          --fertily-font: ${fontFamily};
        }
        .fertily-sdk-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          backdrop-filter: blur(2px);
        }
        
        .fertily-sdk-popup {
          background: var(--fertily-bg);
          border-radius: var(--fertily-radius);
          font-family: var(--fertily-font);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          width: 95%;
          max-width: 1000px;
          height: 95%;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .fertily-sdk-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: linear-gradient(135deg, var(--fertily-primary) 0%, var(--fertily-accent) 100%);
          color: white;
          border-bottom: none;
        }
        
        .fertily-sdk-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--fertily-font);
          font-size: 16px;
          font-weight: 600;
          color: white;
        }
        
        .fertily-sdk-icon {
          font-size: 20px;
        }
        
        .fertily-sdk-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          font-size: 24px;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: var(--fertily-btn-radius);
          transition: all 0.2s;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fertily-sdk-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .fertily-sdk-iframe {
          flex: 1;
          width: 100%;
          border: none;
        }
        
        .fertily-sdk-error {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000000;
          background: #dc3545;
          color: white;
          border-radius: var(--fertily-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: fertily-sdk-slide-in 0.3s ease-out;
        }
        
        .fertily-sdk-error-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-family: var(--fertily-font);
          font-size: 14px;
        }
        
        .fertily-sdk-error-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0 4px;
          margin-left: 8px;
        }
        
        @keyframes fertily-sdk-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Login Dialog Styles */
        .fertily-sdk-login-dialog {
          background: var(--fertily-bg);
          border-radius: var(--fertily-radius);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 400px;
          padding: 24px;
        }
        
        .fertily-sdk-login-header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .fertily-sdk-login-header h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-family: var(--fertily-font);
          color: var(--fertily-text);
        }
        
        .fertily-sdk-login-header p {
          margin: 0;
          color: var(--fertily-secondary);
          font-size: 14px;
        }
        
        .fertily-sdk-form-group {
          margin-bottom: 16px;
        }
        
        .fertily-sdk-form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--fertily-text);
          font-family: var(--fertily-font);
        }
        
        .fertily-sdk-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: var(--fertily-radius);
          font-size: 14px;
          font-family: var(--fertily-font);
          transition: border-color 0.2s;
          background: var(--fertily-bg);
          color: var(--fertily-text);
        }
        
        .fertily-sdk-input:focus {
          outline: none;
          border-color: var(--fertily-primary);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .fertily-sdk-login-error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px 12px;
          border-radius: var(--fertily-radius);
          font-size: 13px;
          margin-bottom: 16px;
        }
        
        .fertily-sdk-login-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .fertily-sdk-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: var(--fertily-btn-radius);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--fertily-font);
        }
        
        .fertily-sdk-btn-primary {
          background: linear-gradient(135deg, var(--fertily-primary) 0%, var(--fertily-accent) 100%);
          color: white;
        }
        
        .fertily-sdk-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .fertily-sdk-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .fertily-sdk-btn-secondary {
          background: var(--fertily-secondary);
          color: white;
          border: 1px solid var(--fertily-secondary);
        }
        
        .fertily-sdk-btn-secondary:hover {
          background: #e9ecef;
        }
        
        @media (max-width: 768px) {
          .fertily-sdk-popup {
            width: 100%;
            height: 100%;
            max-height: none;
            border-radius: 0;
          }
          
          .fertily-sdk-header {
            padding: 12px 16px;
          }
          
          .fertily-sdk-title {
            font-size: 14px;
          }
          
          .fertily-sdk-error {
            top: 10px;
            right: 10px;
            left: 10px;
          }
        }
        
        /* Loading animation */
        .fertily-sdk-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--fertily-text);
          font-family: var(--fertily-font);
        }
        
        .fertily-sdk-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e9ecef;
          border-top: 3px solid var(--fertily-primary);
          border-radius: 50%;
          animation: fertily-spin 1s linear infinite;
        }
        
        @keyframes fertily-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;

      document.head.appendChild(style);
    },

    /**
     * Logout user and clear authentication
     */
    logout: function () {
      this.clearUserAuthentication();
      this.log("User logged out successfully");
    },

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated: function () {
      return this.isAuthenticated;
    },

    /**
     * Logging utility
     */
    log: function (...args) {
      if (SDK_CONFIG.DEBUG) {
        console.log("[Fertily SDK]", ...args);
      }
    },

    /**
     * Error logging utility
     */
    error: function (...args) {
      console.error("[Fertily SDK]", ...args);
    },
  };

  // Expose SDK globally
  window.FertilySDK = FertilySDK;

  // Auto-initialize if config is provided via data attributes
  document.addEventListener("DOMContentLoaded", function () {
    const scripts = document.querySelectorAll('script[src*="fertily-sdk"]');
    const script = scripts[scripts.length - 1]; // Get the last (current) script

    if (script) {
      const tenantId =
        script.getAttribute("data-tenant-id") ||
        script.getAttribute("data-clinic-id");
      const debug = script.getAttribute("data-debug") === "true";
      const environment =
        script.getAttribute("data-environment") || "development";

      if (tenantId) {
        FertilySDK.init({
          tenantId,
          debug,
          environment,
          domain: window.location.hostname,
        });
      }
    }
  });

  // Add helper methods for easy feature access
  FertilySDK.showAIChat = function (options) {
    return this.show(FEATURES.AI_CHAT, options);
  };

  FertilySDK.showIVFPredictor = function (options) {
    return this.show(FEATURES.IVF_PREDICTION, options);
  };

  FertilySDK.showEmbryoGrading = function (options) {
    return this.show(FEATURES.EMBRYO_GRADING, options);
  };

  FertilySDK.showWallet = function (options) {
    return this.show(FEATURES.ESCROW_WALLET, options);
  };

  FertilySDK.showAppointments = function (options) {
    return this.show(FEATURES.APPOINTMENT_BOOKING, options);
  };

  FertilySDK.showCycleTracking = function (options) {
    return this.show(FEATURES.CYCLE_TRACKING, options);
  };

  FertilySDK.showConsultation = function (options) {
    return this.show(FEATURES.EXPERT_CONSULTATION, options);
  };
})(window, document);
