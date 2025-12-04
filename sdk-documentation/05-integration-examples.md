# Fertily SDK - Integration Examples

## Table of Contents
1. [Basic HTML Integration](#basic-html-integration)
2. [React Integration](#react-integration)
3. [Vue.js Integration](#vuejs-integration)
4. [WordPress Integration](#wordpress-integration)
5. [Next.js Integration](#nextjs-integration)
6. [Custom Button Styling](#custom-button-styling)
7. [Advanced Use Cases](#advanced-use-cases)

---

## Basic HTML Integration

### Simple Button Integration
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fertility Clinic</title>
    <style>
        .fertility-btn {
            background: linear-gradient(135deg, #007bff 0%, #28a745 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .fertility-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <h1>Welcome to Our Fertility Clinic</h1>
    
    <button class="fertility-btn" onclick="showAIChat()">
        🤖 Chat with AI Assistant
    </button>
    
    <button class="fertility-btn" onclick="showIVFPredictor()">
        🔮 IVF Success Predictor
    </button>

    <!-- Load SDK -->
    <script src="https://cdn.fertilyapp.com/fertily-sdk.js"></script>
    <script>
        // Initialize SDK
        FertilySDK.init({
            tenantId: 'your-clinic-id',
            environment: 'production'
        }).then(() => {
            console.log('SDK ready!');
        }).catch(error => {
            console.error('SDK initialization failed:', error);
        });

        // Button handlers
        function showAIChat() {
            FertilySDK.showAIChat();
        }

        function showIVFPredictor() {
            FertilySDK.showIVFPredictor();
        }
    </script>
</body>
</html>
```

### Auto-Initialize with Data Attributes
```html
<!DOCTYPE html>
<html>
<head>
    <title>Fertility Clinic</title>
</head>
<body>
    <h1>Fertility Services</h1>
    
    <!-- Buttons with data attributes -->
    <button data-fertily-feature="ai_chat">AI Chat</button>
    <button data-fertily-feature="ivf_prediction">IVF Predictor</button>
    <button data-fertily-feature="embryo_grading">Embryo Grading</button>

    <!-- SDK with auto-init -->
    <script 
        src="https://cdn.fertilyapp.com/fertily-sdk.js"
        data-tenant-id="your-clinic-id"
        data-environment="production">
    </script>
    
    <script>
        // Event delegation for all feature buttons
        document.addEventListener('DOMContentLoaded', () => {
            document.body.addEventListener('click', (e) => {
                const feature = e.target.dataset.fertilyFeature;
                if (feature) {
                    FertilySDK.show(feature);
                }
            });
        });
    </script>
</body>
</html>
```

---

## React Integration

### Functional Component with Hooks
```jsx
import React, { useEffect, useState } from 'react';

const FertilityFeatures = () => {
  const [sdkReady, setSdkReady] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState([]);

  useEffect(() => {
    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://cdn.fertilyapp.com/fertily-sdk.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        await window.FertilySDK.init({
          tenantId: process.env.REACT_APP_FERTILY_CLINIC_ID,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
          debug: process.env.NODE_ENV === 'development'
        });

        // Listen for ready event
        window.FertilySDK.on('ready', (data) => {
          setSdkReady(true);
          setAvailableFeatures(data.config.features);
        });

        // Track feature usage
        window.FertilySDK.on('feature:show', (data) => {
          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'feature_view', {
              feature_name: data.feature
            });
          }
        });
      } catch (error) {
        console.error('Failed to initialize Fertily SDK:', error);
      }
    };

    return () => {
      // Cleanup
      if (window.FertilySDK) {
        window.FertilySDK.destroy();
      }
      document.body.removeChild(script);
    };
  }, []);

  const handleFeatureClick = (feature) => {
    if (window.FertilySDK && sdkReady) {
      window.FertilySDK.show(feature);
    }
  };

  const featureInfo = {
    ai_chat: { name: 'AI Assistant', icon: '🤖' },
    ivf_prediction: { name: 'IVF Predictor', icon: '🔮' },
    embryo_grading: { name: 'Embryo Grading', icon: '🔬' },
    appointment_booking: { name: 'Book Appointment', icon: '📅' }
  };

  if (!sdkReady) {
    return <div>Loading fertility features...</div>;
  }

  return (
    <div className="fertility-features">
      <h2>Our Services</h2>
      <div className="feature-grid">
        {availableFeatures.map(feature => (
          <button
            key={feature}
            className="feature-button"
            onClick={() => handleFeatureClick(feature)}
          >
            <span className="icon">{featureInfo[feature]?.icon}</span>
            <span className="name">{featureInfo[feature]?.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FertilityFeatures;
```

### Custom Hook
```jsx
// useFertilySDK.js
import { useEffect, useState } from 'react';

export const useFertilySDK = (config) => {
  const [isReady, setIsReady] = useState(false);
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initSDK = async () => {
      try {
        // Load script if not already loaded
        if (!window.FertilySDK) {
          await loadScript('https://cdn.fertilyapp.com/fertily-sdk.js');
        }

        // Initialize
        await window.FertilySDK.init(config);

        if (mounted) {
          setIsReady(true);
          setFeatures(window.FertilySDK.getAvailableFeatures());
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      }
    };

    initSDK();

    return () => {
      mounted = false;
      if (window.FertilySDK) {
        window.FertilySDK.destroy();
      }
    };
  }, [config]);

  const showFeature = (feature) => {
    if (isReady && window.FertilySDK) {
      return window.FertilySDK.show(feature);
    }
  };

  return { isReady, features, error, showFeature };
};

// Helper function
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Usage
import { useFertilySDK } from './useFertilySDK';

function App() {
  const { isReady, features, showFeature } = useFertilySDK({
    tenantId: 'your-clinic-id',
    environment: 'production'
  });

  return (
    <div>
      {isReady && features.map(feature => (
        <button key={feature} onClick={() => showFeature(feature)}>
          {feature}
        </button>
      ))}
    </div>
  );
}
```

---

## Vue.js Integration

### Vue 3 Composition API
```vue
<template>
  <div class="fertility-features">
    <h2>Fertility Services</h2>
    
    <div v-if="loading">Loading...</div>
    
    <div v-else class="feature-grid">
      <button
        v-for="feature in availableFeatures"
        :key="feature"
        @click="showFeature(feature)"
        class="feature-btn"
      >
        {{ getFeatureName(feature) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const loading = ref(true);
const availableFeatures = ref([]);

const featureNames = {
  ai_chat: 'AI Fertility Assistant',
  ivf_prediction: 'IVF Success Predictor',
  embryo_grading: 'Embryo Grading',
  appointment_booking: 'Book Appointment'
};

const getFeatureName = (feature) => {
  return featureNames[feature] || feature;
};

const showFeature = (feature) => {
  if (window.FertilySDK) {
    window.FertilySDK.show(feature);
  }
};

onMounted(async () => {
  // Load SDK
  const script = document.createElement('script');
  script.src = 'https://cdn.fertilyapp.com/fertily-sdk.js';
  script.async = true;
  document.body.appendChild(script);

  script.onload = async () => {
    try {
      await window.FertilySDK.init({
        tenantId: import.meta.env.VITE_FERTILY_CLINIC_ID,
        environment: import.meta.env.MODE === 'production' ? 'production' : 'development'
      });

      window.FertilySDK.on('ready', (data) => {
        availableFeatures.value = data.config.features;
        loading.value = false;
      });
    } catch (error) {
      console.error('SDK initialization failed:', error);
      loading.value = false;
    }
  };
});

onUnmounted(() => {
  if (window.FertilySDK) {
    window.FertilySDK.destroy();
  }
});
</script>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.feature-btn {
  padding: 16px;
  background: linear-gradient(135deg, #007bff 0%, #28a745 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
}

.feature-btn:hover {
  transform: translateY(-2px);
}
</style>
```

### Vue Plugin
```javascript
// plugins/fertily-sdk.js
export default {
  install: (app, options) => {
    const { tenantId, environment = 'production' } = options;

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://cdn.fertilyapp.com/fertily-sdk.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        await window.FertilySDK.init({
          tenantId,
          environment
        });

        // Make SDK available globally
        app.config.globalProperties.$fertility = window.FertilySDK;
      } catch (error) {
        console.error('Fertily SDK initialization failed:', error);
      }
    };
  }
};

// main.js
import { createApp } from 'vue';
import App from './App.vue';
import FertilySDK from './plugins/fertily-sdk';

const app = createApp(App);

app.use(FertilySDK, {
  tenantId: 'your-clinic-id',
  environment: 'production'
});

app.mount('#app');

// Usage in components
export default {
  methods: {
    showAIChat() {
      this.$fertility.showAIChat();
    }
  }
};
```

---

## WordPress Integration

### Theme Functions
```php
<?php
// functions.php

// Enqueue Fertily SDK
function enqueue_fertily_sdk() {
    // Get clinic ID from theme options
    $clinic_id = get_option('fertily_clinic_id');
    
    if (empty($clinic_id)) {
        return;
    }
    
    // Enqueue SDK script
    wp_enqueue_script(
        'fertily-sdk',
        'https://cdn.fertilyapp.com/fertily-sdk.js',
        array(),
        '1.0.0',
        true
    );
    
    // Initialize SDK
    $init_script = "
        document.addEventListener('DOMContentLoaded', function() {
            FertilySDK.init({
                tenantId: '" . esc_js($clinic_id) . "',
                environment: 'production',
                userIdentifier: '" . esc_js(wp_get_current_user()->user_email) . "'
            });
        });
    ";
    
    wp_add_inline_script('fertily-sdk', $init_script);
}
add_action('wp_enqueue_scripts', 'enqueue_fertily_sdk');

// Shortcode for feature buttons
function fertily_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'feature' => 'ai_chat',
        'text' => 'Chat with AI',
        'class' => 'btn-primary'
    ), $atts);
    
    $feature = esc_attr($atts['feature']);
    $text = esc_html($atts['text']);
    $class = esc_attr($atts['class']);
    
    return sprintf(
        '<button class="fertily-btn %s" onclick="FertilySDK.show(\'%s\')">%s</button>',
        $class,
        $feature,
        $text
    );
}
add_shortcode('fertily_button', 'fertily_button_shortcode');

// Usage in posts/pages:
// [fertily_button feature="ai_chat" text="Chat with AI" class="custom-class"]
?>
```

### Gutenberg Block
```javascript
// blocks/fertily-button/index.js
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

registerBlockType('fertily/button', {
    title: 'Fertily Feature Button',
    icon: 'button',
    category: 'widgets',
    attributes: {
        feature: {
            type: 'string',
            default: 'ai_chat'
        },
        buttonText: {
            type: 'string',
            default: 'Chat with AI'
        }
    },
    
    edit: ({ attributes, setAttributes }) => {
        const { feature, buttonText } = attributes;
        
        return (
            <>
                <InspectorControls>
                    <PanelBody title="Feature Settings">
                        <SelectControl
                            label="Feature"
                            value={feature}
                            options={[
                                { label: 'AI Chat', value: 'ai_chat' },
                                { label: 'IVF Predictor', value: 'ivf_prediction' },
                                { label: 'Embryo Grading', value: 'embryo_grading' },
                                { label: 'Appointments', value: 'appointment_booking' }
                            ]}
                            onChange={(value) => setAttributes({ feature: value })}
                        />
                        <TextControl
                            label="Button Text"
                            value={buttonText}
                            onChange={(value) => setAttributes({ buttonText: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                
                <button className="fertily-btn">
                    {buttonText}
                </button>
            </>
        );
    },
    
    save: ({ attributes }) => {
        const { feature, buttonText } = attributes;
        
        return (
            <button 
                className="fertily-btn"
                onClick={`FertilySDK.show('${feature}')`}
            >
                {buttonText}
            </button>
        );
    }
});
```

---

## Next.js Integration

### App Router (Next.js 13+)
```typescript
// app/providers/FertilyProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function FertilyProvider({ children }: { children: React.ReactNode }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const handleSDKLoad = async () => {
    try {
      await (window as any).FertilySDK.init({
        tenantId: process.env.NEXT_PUBLIC_FERTILY_CLINIC_ID!,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
      });
      setSdkLoaded(true);
    } catch (error) {
      console.error('Failed to initialize Fertily SDK:', error);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.fertilyapp.com/fertily-sdk.js"
        strategy="afterInteractive"
        onLoad={handleSDKLoad}
      />
      {children}
    </>
  );
}

// app/layout.tsx
import { FertilyProvider } from './providers/FertilyProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FertilyProvider>
          {children}
        </FertilyProvider>
      </body>
    </html>
  );
}

// app/components/FertilityFeatures.tsx
'use client';

export function FertilityFeatures() {
  const showFeature = (feature: string) => {
    if (typeof window !== 'undefined' && (window as any).FertilySDK) {
      (window as any).FertilySDK.show(feature);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => showFeature('ai_chat')}>
        AI Chat
      </button>
      <button onClick={() => showFeature('ivf_prediction')}>
        IVF Predictor
      </button>
    </div>
  );
}
```

---

## Custom Button Styling

### Floating Action Button (FAB)
```html
<style>
.fertility-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #007bff 0%, #28a745 100%);
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
    z-index: 1000;
}

.fertility-fab:hover {
    transform: scale(1.1);
}

.fertility-menu {
    position: fixed;
    bottom: 90px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 8px;
    display: none;
    z-index: 1000;
}

.fertility-menu.open {
    display: block;
}

.fertility-menu-item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    transition: background 0.2s;
}

.fertility-menu-item:hover {
    background: #f0f0f0;
}
</style>

<button class="fertility-fab" onclick="toggleMenu()">
    🤰
</button>

<div class="fertility-menu" id="fertility-menu">
    <button class="fertility-menu-item" onclick="showFeature('ai_chat')">
        🤖 AI Assistant
    </button>
    <button class="fertility-menu-item" onclick="showFeature('ivf_prediction')">
        🔮 IVF Predictor
    </button>
    <button class="fertility-menu-item" onclick="showFeature('appointment_booking')">
        📅 Book Appointment
    </button>
</div>

<script>
function toggleMenu() {
    document.getElementById('fertility-menu').classList.toggle('open');
}

function showFeature(feature) {
    FertilySDK.show(feature);
    document.getElementById('fertility-menu').classList.remove('open');
}
</script>
```

---

## Advanced Use Cases

### Conditional Feature Display
```javascript
// Show features based on user authentication
FertilySDK.on('ready', (data) => {
    const isPublic = data.config.is_public;
    const isAuthenticated = checkUserAuthentication();
    
    if (!isPublic && !isAuthenticated) {
        // Hide features, show login prompt
        document.querySelectorAll('.fertility-feature').forEach(el => {
            el.style.display = 'none';
        });
        showLoginPrompt();
    } else {
        // Show available features
        data.config.features.forEach(feature => {
            const button = document.querySelector(`[data-feature="${feature}"]`);
            if (button) {
                button.style.display = 'block';
            }
        });
    }
});
```

### Analytics Integration
```javascript
// Track feature usage in Google Analytics
FertilySDK.on('feature:show', (data) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'feature_view', {
            event_category: 'Fertility Features',
            event_label: data.feature,
            value: 1
        });
    }
});

// Track session duration
let sessionStart = Date.now();
FertilySDK.on('feature:hide', () => {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'feature_engagement', {
            event_category: 'Fertility Features',
            value: duration
        });
    }
});
```

### Error Handling
```javascript
// Graceful error handling
FertilySDK.on('token:refresh_failed', (data) => {
    console.error('Token refresh failed:', data.error);
    
    // Show user-friendly message
    showNotification('Session expired. Please refresh the page.', 'warning');
    
    // Optionally re-initialize
    setTimeout(() => {
        location.reload();
    }, 5000);
});
```
