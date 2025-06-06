// ======================================================================
// ENHANCED BOT RENDERING WORKER v6.0.0 - CLOUDFLARE WORKER
// ======================================================================

// ======================================================================
// CONFIGURATION - MATCHING FRONTEND PATTERNS
// ======================================================================

/** Primary Strapi CMS instance URL */
const PRIMARY_STRAPI = "https://backend-cms-89la.onrender.com";

/** Backup Strapi CMS instance URL */
const BACKUP_STRAPI = "https://personal-cms-backup.onrender.com";

/** Request timeout in milliseconds */
const TIMEOUT_MS = 10000;

/**
 * Cache configuration with enhanced invalidation
 */
const CACHE_CONFIG = {
  botRenderedTtl: 20 * 60, // Increased from 15 minutes
  templateTtl: 45 * 60, // Increased from 30 minutes
  apiDataTtl: 10 * 60, // New - cache API data separately
  invalidationToken: "v6.1.0", // Updated version
  staleWhileRevalidate: 2 * 60 * 60, // Increased to 2 hours
  maxCacheSize: 100 * 1024 * 1024, // Increased to 100MB
  compressionLevel: 6, // New - gzip compression level
  edgeCacheTtl: 24 * 60 * 60, // New - 24 hour edge cache
  browserCacheTtl: 60 * 60, // New - 1 hour browser cache
  cdnCacheTtl: 7 * 24 * 60 * 60, // New - 7 day CDN cache
};

/**
 * Enhanced performance budget enforcement
 */
const PERF_BUDGET = {
  maxHtmlSize: 150 * 1024, // Increased from 100KB
  maxImages: 25, // Increased from 20
  maxThirdParty: 5, // Increased from 3
  maxRenderTime: 8000, // Reduced from 10000ms
  maxMemoryUsage: 256 * 1024 * 1024, // Increased to 256MB
  maxApiCalls: 10, // New limit
  maxCacheEntries: 1000, // New limit
  compressionThreshold: 1024, // New - compress responses > 1KB
  imageOptimizationThreshold: 50 * 1024, // New - optimize images > 50KB
};

const GITHUB_API_CONFIG = {
  cacheTime: 60 * 60, // 1 hour in seconds
  timeout: 10000, // 10 seconds
  corsHeaders: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  },
};
/**
 * Bot rendering configuration with enhanced patterns
 */
const BOT_CONFIG = {
  enabled: true,
  botPatterns: [
    // Search Engine Bots
    "googlebot",
    "bingbot",
    "yandexbot",
    "duckduckbot",
    "slurp",
    "baiduspider",
    "bytespider",
    "sogou",
    "exabot",
    "facebookexternalhit",
    "twitterbot",
    "rogerbot",
    "linkedinbot",
    "embedly",
    "quora link preview",
    "showyoubot",
    "outbrain",
    "pinterest",
    "slackbot",
    "vkshare",
    "w3c_validator",
    "redditbot",
    "applebot",
    "whatsapp",
    "flipboard",
    "tumblr",
    "bitlybot",
    "skypeuripreview",
    "nuzzel",
    "discordbot",
    "telegrambot",
    "mastodon",
    "petalbot",
    "semrushbot",
    "ahrefsbot",
    "msnbot",

    // AI/ML Crawlers (New)
    "claudebot",
    "gptbot",
    "chatgpt-user",
    "ccbot",
    "anthropic-ai",
    "perplexitybot",
    "youbot",
    "cohere-ai",
    "ai2bot",
    "openai-crawler",

    // SEO Tools (New)
    "screaming frog",
    "sitebulb",
    "deepcrawl",
    "oncrawl",
    "botify",
    "searchmetrics",
    "brightedge",
    "conductor",
    "searchpilot",

    // Social Media & Messaging (Enhanced)
    "facebookcatalog",
    "facebookexternalhit",
    "instagram",
    "snapchat",
    "tiktok",
    "wechat",
    "line",
    "kakaotalk",
    "viber",

    // Monitoring & Analytics (New)
    "uptimerobot",
    "pingdom",
    "gtmetrix",
    "pagespeed",
    "lighthouse",
    "webpagetest",
    "dareboost",
    "yellowlab",

    // Security & Compliance (New)
    "securitytrails",
    "shodan",
    "censys",
    "binaryedge",
    "onyphe",

    // Specialized Crawlers (New)
    "google-structured-data-testing-tool",
    "google-adwords-instant",
    "mediapartners-google",
    "adsbot-google",
    "chrome-lighthouse",
    "google-read-aloud",
    "google-favicon",
    "google-amphtml",
  ],
  renderablePaths: [
    "/",
    "/about",
    "/portfolio",
    "/photography",
    "/certificate",
    "/coding-project",
    "/marketing-plan",
    "/business-plan",
    "/amv-editing",
    "/contact",
    "/blog",
    "/zh",
    "/zh/about",
    "/zh/portfolio",
    "/zh/photography",
    "/zh/certificate",
    "/zh/coding-project",
    "/zh/marketing-plan",
    "/zh/business-plan",
    "/zh/amv-editing",
    "/zh/contact",
    "/zh/blog",
  ],
  pathToApiMap: {
    "/photography": ["/api/photographies?populate=*&pagination[limit]=50"],
    "/certificate": ["/api/certificates?populate=*"],
    "/marketing-plan": ["/api/marketing-plans?populate=*"],
    "/business-plan": ["/api/business-plans?populate=*"],
    "/blog": ["/api/blogs?populate=*&pagination[limit]=20"],
    "/coding-project": [
      "/api/coding-projects?populate=*&pagination[limit]=20",
      "/api/github/users/Shain-Wai-Yan",
      "/api/github/users/Shain-Wai-Yan/pinned",
      "/api/github/users/Shain-Wai-Yan/top-languages",
    ],
    "/amv-editing": ["/api/amv-projects?populate=*&pagination[limit]=20"],
    "/zh/photography": [
      "/api/photographies?populate=*&locale=zh&pagination[limit]=50",
    ],
    "/zh/certificate": ["/api/certificates?populate=*&locale=zh"],
    "/zh/marketing-plan": ["/api/marketing-plans?populate=*&locale=zh"],
    "/zh/business-plan": ["/api/business-plans?populate=*&locale=zh"],
    "/zh/blog": ["/api/blogs?populate=*&locale=zh&pagination[limit]=20"],
    "/zh/coding-project": [
      "/api/coding-projects?populate=*&locale=zh&pagination[limit]=20",
      "/api/github/users/Shain-Wai-Yan",
      "/api/github/users/Shain-Wai-Yan/pinned",
      "/api/github/users/Shain-Wai-Yan/top-languages",
    ],
    "/zh/amv-editing": [
      "/api/amv-projects?populate=*&locale=zh&pagination[limit]=20",
    ],
  },
  contentSelectors: {
    "/photography": "#masonry-grid",
    "/certificate": "#certificates-container",
    "/coding-project": "#main-content",
    "/marketing-plan": ".document-list",
    "/business-plan": ".document-list",
    "/amv-editing": "#main-content",
    "/blog": "#main-content",
    "/zh/photography": "#masonry-grid",
    "/zh/certificate": "#certificates-container",
    "/zh/coding-project": "#main-content",
    "/zh/marketing-plan": ".document-list",
    "/zh/business-plan": ".document-list",
    "/zh/amv-editing": "#main-content",
    "/zh/blog": "#main-content",
  },
  defaultContentSelector: "#main-content",
};

/**
 * Enhanced security configuration with CSP nonces
 */
const SECURITY_CONFIG = {
  sanitizeHtml: true,
  allowedTags: [
    "div",
    "span",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "a",
    "ul",
    "ol",
    "li",
    "br",
    "strong",
    "em",
    "time",
    "article",
    "section",
  ],
  allowedAttributes: {
    "*": ["class", "id", "data-*", "itemscope", "itemtype", "itemprop"],
    img: ["src", "alt", "loading", "decoding", "crossorigin", "sizes"],
    a: ["href", "target", "rel"],
    time: ["datetime"],
  },
  contentSecurityPolicy: {
    "default-src": ["'self'"],
    "img-src": ["'self'", "data:", "https:", "blob:"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https:"],
    "frame-src": ["'self'", "https:"],
  },
  additionalHeaders: {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  },
};

const ENHANCED_SECURITY = {
  rateLimiting: {
    enabled: true,
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 100, // Max requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  ddosProtection: {
    enabled: true,
    threshold: 1000, // Requests per minute
    banDuration: 300000, // 5 minutes
    whitelist: ["googlebot", "bingbot"], // Never ban these
  },
  contentIntegrity: {
    enabled: true,
    hashAlgorithm: "sha256",
    validateApiResponses: true,
    sanitizeLevel: "strict",
  },
  advancedHeaders: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "on",
    "X-Permitted-Cross-Domain-Policies": "none",
  },
};
/**
 * Enhanced analytics and monitoring
 */
const ANALYTICS_CONFIG = {
  enabled: false,
  sampleRate: 0.15, // Increased from 0.1
  batchSize: 50, // New - batch analytics calls
  flushInterval: 30000, // New - flush every 30 seconds
  endpoints: {
    errors: "https://analytics.shainwaiyan.com/errors",
    performance: "https://analytics.shainwaiyan.com/performance",
    usage: "https://analytics.shainwaiyan.com/usage",
    seo: "https://analytics.shainwaiyan.com/seo", // New endpoint
    coreWebVitals: "https://analytics.shainwaiyan.com/cwv", // New endpoint
  },
  metrics: {
    trackCoreWebVitals: true, // New
    trackUserExperience: true, // New
    trackSEOSignals: true, // New
    trackCrawlBudget: true, // New
  },
};
// Add this new configuration after ANALYTICS_CONFIG
const SEO_CONFIG = {
  coreWebVitals: {
    trackLCP: true,
    trackFID: true,
    trackCLS: true,
    trackINP: true, // New metric
    thresholds: {
      lcp: 2500, // milliseconds
      fid: 100, // milliseconds
      cls: 0.1, // score
      inp: 200, // milliseconds
    },
  },
  structuredData: {
    organization: {
      "@type": "Organization",
      name: "Shain Wai Yan Portfolio",
      url: "https://shainwaiyan.com",
      logo: "https://shainwaiyan.com/logo.png",
      sameAs: [
        "https://linkedin.com/in/shainwaiyan",
        "https://github.com/shainwaiyan",
        "https://twitter.com/shainwaiyan",
      ],
    },
    person: {
      "@type": "Person",
      name: "Shain Wai Yan",
      jobTitle: "Marketing & Programming Expert",
      url: "https://shainwaiyan.com",
      image: "https://shainwaiyan.com/profile.jpg",
    },
  },
  metaOptimization: {
    titleMaxLength: 60,
    descriptionMaxLength: 160,
    keywordsMaxCount: 10,
    autoGenerateMetaDescription: true,
    includeOpenGraph: true,
    includeTwitterCards: true,
    includeLinkedInTags: true,
  },
  imageOptimization: {
    formats: ["webp", "avif", "jpg"],
    qualities: [80, 90, 95],
    sizes: [400, 800, 1200, 1600],
    lazyLoadThreshold: 3, // Load first 3 images eagerly
    compressionLevel: 85,
  },
};
// ======================================================================
// GLOBAL VARIABLES & MONITORING
// ======================================================================

const performanceMetrics = {
  botRenderingCount: 0,
  averageRenderingTime: 0,
  cacheHitRate: 0,
  errorCount: 0,
  lastReset: Date.now(),
  apiSuccessRate: 0,
  primaryServerHealth: true,
  backupServerHealth: true,
  memoryUsage: 0,
  requestsPerMinute: 0,
  errorsByType: new Map(),
  renderingTimes: [],
};
// Add this after the existing performanceMetrics object
const enhancedMetrics = {
  ...performanceMetrics,
  coreWebVitals: {
    lcp: [],
    fid: [],
    cls: [],
    inp: [],
  },
  seoMetrics: {
    crawlBudgetUsage: 0,
    indexationRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
  },
  securityMetrics: {
    blockedRequests: 0,
    suspiciousActivity: 0,
    rateLimitHits: 0,
    ddosAttempts: 0,
  },
  apiMetrics: {
    strapiPrimaryHealth: 100,
    strapiBackupHealth: 100,
    avgApiResponseTime: 0,
    apiErrorRate: 0,
    dataFreshness: Date.now(),
  },
};

/**
 * Enhanced performance tracking with Core Web Vitals
 */
async function trackEnhancedPerformance(metrics) {
  try {
    if (
      !ANALYTICS_CONFIG.enabled ||
      Math.random() > ANALYTICS_CONFIG.sampleRate
    ) {
      return;
    }

    // Update local metrics
    if (metrics.lcp) enhancedMetrics.coreWebVitals.lcp.push(metrics.lcp);
    if (metrics.fid) enhancedMetrics.coreWebVitals.fid.push(metrics.fid);
    if (metrics.cls) enhancedMetrics.coreWebVitals.cls.push(metrics.cls);
    if (metrics.inp) enhancedMetrics.coreWebVitals.inp.push(metrics.inp);

    // Keep only last 100 measurements
    Object.keys(enhancedMetrics.coreWebVitals).forEach((key) => {
      if (enhancedMetrics.coreWebVitals[key].length > 100) {
        enhancedMetrics.coreWebVitals[key] =
          enhancedMetrics.coreWebVitals[key].slice(-50);
      }
    });

    const perfData = {
      timestamp: new Date().toISOString(),
      ...metrics,
      coreWebVitals: enhancedMetrics.coreWebVitals,
      seoMetrics: enhancedMetrics.seoMetrics,
      workerVersion: "6.1.0",
    };

    // Send to analytics endpoint
    fetch(ANALYTICS_CONFIG.endpoints.performance, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfData),
    }).catch(() => {});

    // Send Core Web Vitals separately if enabled
    if (
      ANALYTICS_CONFIG.metrics.trackCoreWebVitals &&
      (metrics.lcp || metrics.fid || metrics.cls || metrics.inp)
    ) {
      fetch(ANALYTICS_CONFIG.endpoints.coreWebVitals, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          lcp: metrics.lcp,
          fid: metrics.fid,
          cls: metrics.cls,
          inp: metrics.inp,
          url: metrics.url,
          userAgent: metrics.userAgent,
        }),
      }).catch(() => {});
    }
  } catch (error) {
    console.error("Failed to track enhanced performance:", error);
  }
}
// ======================================================================
// ENHANCED UTILITY FUNCTIONS
// ======================================================================

/**
 * Enhanced HTML sanitization with better performance and security
 */
/**
 * Enhanced HTML sanitization with better metadata preservation
 */
function sanitizeHtml(html) {
  if (!SECURITY_CONFIG.sanitizeHtml) return html;

  try {
    // Performance optimization: early return for small content
    if (html.length < 1000) {
      return html; // Don't sanitize small content
    }

    // Only remove truly dangerous patterns
    const dangerousPatterns = [
      /<script\b(?!.*\btype=['"]application\/ld\+json['"])[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Keep JSON-LD
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /expression\s*\(/gi,
    ];

    // Apply sanitization patterns
    let sanitized = html;
    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "");
    });

    return sanitized;
  } catch (error) {
    logError(error, "sanitizeHtml");
    return html; // Return original on error
  }
}

/**
 * Basic sanitization for small content
 */
function basicSanitize(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "");
}

/**
 * Enhanced HTML escaping with additional characters
 */
function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return text.replace(/[&<>"'`=\/]/g, (m) => map[m]);
}

/**
 * Cryptographically secure nonce generation
 */
function generateNonce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Enhanced error logging with context
 */
async function logError(error, context, additionalData = {}) {
  try {
    performanceMetrics.errorCount++;

    const errorType = error.name || "UnknownError";
    const currentCount = performanceMetrics.errorsByType.get(errorType) || 0;
    performanceMetrics.errorsByType.set(errorType, currentCount + 1);

    if (
      !ANALYTICS_CONFIG.enabled ||
      Math.random() > ANALYTICS_CONFIG.sampleRate
    ) {
      return;
    }

    const errorData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 1000),
      },
      context,
      workerVersion: "6.0.0",
      additionalData,
      userAgent: additionalData.userAgent?.substring(0, 200),
      url: additionalData.url,
    };

    // Fire and forget error logging
    fetch(ANALYTICS_CONFIG.endpoints.errors, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    }).catch(() => {}); // Ignore logging failures
  } catch (loggingError) {
    console.error("Failed to log error:", loggingError);
  }
}

/**
 * Enhanced performance tracking
 */
async function trackPerformance(metrics) {
  try {
    if (
      !ANALYTICS_CONFIG.enabled ||
      Math.random() > ANALYTICS_CONFIG.sampleRate
    ) {
      return;
    }

    performanceMetrics.renderingTimes.push(metrics.renderTime);
    if (performanceMetrics.renderingTimes.length > 100) {
      performanceMetrics.renderingTimes =
        performanceMetrics.renderingTimes.slice(-50);
    }

    performanceMetrics.averageRenderingTime =
      performanceMetrics.renderingTimes.reduce((a, b) => a + b, 0) /
      performanceMetrics.renderingTimes.length;

    const perfData = {
      timestamp: new Date().toISOString(),
      ...metrics,
      workerVersion: "6.0.0",
    };

    fetch(ANALYTICS_CONFIG.endpoints.performance, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfData),
    }).catch(() => {});
  } catch (error) {
    console.error("Failed to track performance:", error);
  }
}

/**
 * Memory usage estimation
 */
function estimateMemoryUsage(data) {
  try {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString).length;
  } catch {
    return 0;
  }
}

/**
 * Enhanced array shuffling with seed support
 */
function shuffleArray(array, seed = null) {
  const shuffled = [...array];

  // Simple seeded random if seed provided
  let random = seed
    ? () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }
    : Math.random;

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ======================================================================
// ENHANCED DATA EXTRACTION FUNCTIONS
// ======================================================================

/**
 * Universal data accessor with enhanced fallback logic
 */
function getDataFromItem(item, field) {
  if (!item) return null;

  try {
    // Direct field access (Strapi v5)
    if (item[field] !== undefined) {
      return item[field];
    }

    // Nested attributes (Strapi v4)
    if (item.attributes && item.attributes[field] !== undefined) {
      return item.attributes[field];
    }

    // Case variations
    const variations = [
      field.toLowerCase(),
      field.charAt(0).toUpperCase() + field.slice(1),
      field.charAt(0).toLowerCase() + field.slice(1),
      field.replace(/([A-Z])/g, "_$1").toLowerCase(),
      field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
    ];

    for (const variation of variations) {
      if (item[variation] !== undefined) {
        return item[variation];
      }
      if (item.attributes && item.attributes[variation] !== undefined) {
        return item.attributes[variation];
      }
    }

    return null;
  } catch (error) {
    logError(error, "getDataFromItem", { field, itemId: item.id });
    return null;
  }
}

/**
 * Enhanced image URL extraction with format preferences
 */
function getImageUrl(item, field = "image", preferredFormat = "medium") {
  try {
    if (!item || typeof item !== "object") {
      return null;
    }

    const imageField = getDataFromItem(item, field);
    if (!imageField) return null;

    // Direct URL string
    if (typeof imageField === "string" && imageField.startsWith("http")) {
      return imageField;
    }

    // Direct URL in object
    if (imageField.url) {
      return imageField.url.startsWith("http")
        ? imageField.url
        : `${PRIMARY_STRAPI}${imageField.url}`;
    }

    // Cloudinary formats with preference order
    if (imageField.formats) {
      const formatPriority = [
        preferredFormat,
        "large",
        "medium",
        "small",
        "thumbnail",
      ];

      for (const format of formatPriority) {
        if (imageField.formats[format]?.url) {
          return imageField.formats[format].url;
        }
      }
    }

    // Nested data structure (Strapi v4)
    if (imageField.data) {
      if (Array.isArray(imageField.data) && imageField.data.length > 0) {
        const firstImage = imageField.data[0];
        if (firstImage.attributes?.url) {
          return firstImage.attributes.url.startsWith("http")
            ? firstImage.attributes.url
            : `${PRIMARY_STRAPI}${firstImage.attributes.url}`;
        }
        if (firstImage.url) {
          return firstImage.url.startsWith("http")
            ? firstImage.url
            : `${PRIMARY_STRAPI}${firstImage.url}`;
        }
      } else if (imageField.data.attributes?.url) {
        return imageField.data.attributes.url.startsWith("http")
          ? imageField.data.attributes.url
          : `${PRIMARY_STRAPI}${imageField.data.attributes.url}`;
      } else if (imageField.data.url) {
        return imageField.data.url.startsWith("http")
          ? imageField.data.url
          : `${PRIMARY_STRAPI}${imageField.data.url}`;
      }
    }

    return null;
  } catch (error) {
    logError(error, "getImageUrl", { field, itemId: item?.id });
    return null;
  }
}

/**
 * Enhanced document file URL extraction with validation
 */
function getDocumentFileUrl(item, field = "DocumentFile") {
  try {
    if (!item || typeof item !== "object") {
      return null;
    }

    const documentField = getDataFromItem(item, field);
    if (!documentField) return null;

    // Direct URL string
    if (typeof documentField === "string") {
      const url = documentField.startsWith("http")
        ? documentField
        : `${PRIMARY_STRAPI}${documentField}`;

      // Validate URL format
      try {
        new URL(url);
        return url;
      } catch {
        return null;
      }
    }

    // Direct URL in object (Strapi v5)
    if (documentField.url) {
      const url = documentField.url.startsWith("http")
        ? documentField.url
        : `${PRIMARY_STRAPI}${documentField.url}`;

      try {
        new URL(url);
        return url;
      } catch {
        return null;
      }
    }

    // Nested structure (Strapi v4)
    if (documentField.data?.attributes?.url) {
      const url = documentField.data.attributes.url.startsWith("http")
        ? documentField.data.attributes.url
        : `${PRIMARY_STRAPI}${documentField.data.attributes.url}`;

      try {
        new URL(url);
        return url;
      } catch {
        return null;
      }
    }

    // Array format
    if (Array.isArray(documentField) && documentField.length > 0) {
      const firstDoc = documentField[0];
      if (firstDoc?.url) {
        const url = firstDoc.url.startsWith("http")
          ? firstDoc.url
          : `${PRIMARY_STRAPI}${firstDoc.url}`;

        try {
          new URL(url);
          return url;
        } catch {
          return null;
        }
      }
    }

    return null;
  } catch (error) {
    logError(error, "getDocumentFileUrl", { field, itemId: item?.id });
    return null;
  }
}

/**
 * Enhanced Cloudinary PDF transformation with multiple strategies
 */
function transformCloudinaryPdfUrl(url) {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  try {
    const urlParts = url.split("/upload/");
    if (urlParts.length === 2) {
      // Multiple transformation strategies
      const transformations = [
        "fl_attachment,f_auto,q_auto",
        "fl_attachment",
        "f_auto,q_auto",
      ];

      // Try the most comprehensive transformation first
      return `${urlParts[0]}/upload/${transformations[0]}/${urlParts[1]}`;
    }

    return url;
  } catch (error) {
    logError(error, "transformCloudinaryPdfUrl", { url });
    return url;
  }
}

/**
 * Enhanced adaptive placeholder with better styling
 */
function createAdaptivePlaceholder(
  width,
  height,
  text = "Loading",
  theme = "light"
) {
  const colors =
    theme === "dark"
      ? { bg: "#1a1a1a", text: "#666" }
      : { bg: "#f0f0f0", text: "#999" };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${colors.bg}"/>
    <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="${
      colors.text
    }">${escapeHtml(text)}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
/**
 * Enhanced image URL optimization with multiple formats and sizes
 */
function optimizeImageUrl(url, options = {}) {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  try {
    const {
      width = 800,
      height = null,
      quality = "auto",
      format = "auto",
      crop = "fill",
      gravity = "auto",
      fetchFormat = "auto",
    } = options;

    const urlParts = url.split("/upload/");
    if (urlParts.length !== 2) return url;

    // Build transformation string
    const transformations = [
      `w_${width}`,
      height ? `h_${height}` : null,
      `c_${crop}`,
      `g_${gravity}`,
      `q_${quality}`,
      `f_${format}`,
      `fetch_format_${fetchFormat}`,
      "dpr_auto", // Automatic DPR
      "fl_progressive", // Progressive JPEG
      "fl_immutable_cache", // Immutable cache
    ]
      .filter(Boolean)
      .join(",");

    return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
  } catch (error) {
    logError(error, "optimizeImageUrl", { url, options });
    return url;
  }
}

/**
 * Generate responsive image srcset
 */
function generateResponsiveImageSrcset(url, sizes = [400, 800, 1200, 1600]) {
  if (!url) return "";

  return sizes
    .map((size) => {
      const optimizedUrl = optimizeImageUrl(url, { width: size });
      return `${optimizedUrl} ${size}w`;
    })
    .join(", ");
}

/**
 * Enhanced image URL extraction with optimization
 */
function getOptimizedImageUrl(item, field = "image", options = {}) {
  const baseUrl = getImageUrl(item, field);
  if (!baseUrl) return null;

  return optimizeImageUrl(baseUrl, options);
}
/**
 * Mobile-specific optimizations
 */
function optimizeForMobile(html, userAgent) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

  if (!isMobile) return html;

  try {
    // Add mobile-specific meta tags
    const mobileMetaTags = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="default">
      <meta name="theme-color" content="#000000">
    `;

    if (!html.includes('name="viewport"')) {
      html = html.replace("<head>", `<head>${mobileMetaTags}`);
    }

    // Optimize images for mobile
    html = html.replace(/<img([^>]+)>/g, (match, attrs) => {
      if (!attrs.includes("sizes=")) {
        attrs += ' sizes="(max-width: 768px) 100vw, 50vw"';
      }
      if (!attrs.includes("loading=")) {
        attrs += ' loading="lazy"';
      }
      if (!attrs.includes("decoding=")) {
        attrs += ' decoding="async"';
      }
      return `<img${attrs}>`;
    });

    // Add mobile-specific CSS
    const mobileCss = `
      <style>
        @media (max-width: 768px) {
          .masonry-grid { grid-template-columns: 1fr !important; }
          .photography-item { margin-bottom: 1rem !important; }
          .certificate-carousel { overflow-x: auto !important; }
        }
      </style>
    `;

    html = html.replace("</head>", `${mobileCss}</head>`);

    return html;
  } catch (error) {
    logError(error, "optimizeForMobile");
    return html;
  }
}

// ======================================================================
// GITHUB API HANDLER FUNCTIONS
// ======================================================================

/**
 * Handle GitHub API requests
 */
async function handleGitHubAPI(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only handle GitHub API routes
  if (!path.startsWith("/api/github/")) {
    return null;
  }

  console.log(`🔍 GitHub API request: ${path}`);

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: GITHUB_API_CONFIG.corsHeaders,
    });
  }

  try {
    // Get GitHub token from environment variable
    const token = env.GITHUB_TOKEN || "";

    if (!token) {
      console.error("GitHub token not configured");
      return new Response(
        JSON.stringify({ error: "GitHub token not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...GITHUB_API_CONFIG.corsHeaders,
          },
        }
      );
    }

    // Check cache first for GET requests
    if (request.method === "GET") {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        console.log(`📦 Cache hit for GitHub API: ${path}`);
        const corsResponse = new Response(cachedResponse.body, cachedResponse);
        Object.entries(GITHUB_API_CONFIG.corsHeaders).forEach(
          ([key, value]) => {
            corsResponse.headers.set(key, value);
          }
        );
        return corsResponse;
      }
    }

    // Route to appropriate handler
    let response;
    if (path.includes("/contributions")) {
      response = await handleGitHubContributions(path, token);
    } else if (path.includes("/pinned")) {
      response = await handleGitHubPinnedRepos(path, token);
    } else if (path.includes("/top-languages")) {
      response = await handleGitHubTopLanguages(path, token);
    } else if (path.includes("/detailed-activity")) {
      response = await handleGitHubDetailedActivity(path, token);
    } else {
      // General GitHub API proxy
      response = await handleGitHubProxy(path, token);
    }

    // Add CORS headers
    Object.entries(GITHUB_API_CONFIG.corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Cache successful GET responses
    if (request.method === "GET" && response.status === 200) {
      const cache = caches.default;
      ctx.waitUntil(cache.put(request, response.clone()));
    }

    return response;
  } catch (error) {
    console.error(`GitHub API Error: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "GitHub API request failed",
        message: error.message,
        path: path,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...GITHUB_API_CONFIG.corsHeaders,
        },
      }
    );
  }
}

/**
 * Handle GitHub API proxy requests
 */
async function handleGitHubProxy(path, token) {
  const githubPath = path.replace("/api/github/", "");

  console.log(`🔄 Proxying to GitHub API: ${githubPath}`);

  const response = await fetch(`https://api.github.com/${githubPath}`, {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "GitHub-Profile-Viewer",
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`GitHub API error: ${response.status}`, errorData);
    return new Response(
      JSON.stringify({
        error: `GitHub API error: ${response.status}`,
        details: errorData,
      }),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${GITHUB_API_CONFIG.cacheTime}`,
    },
  });
}

/**
 * Handle GitHub contributions
 */
async function handleGitHubContributions(path, token) {
  const usernameMatch = path.match(/\/users\/([^/]+)\/contributions/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const username = usernameMatch[1];
  console.log(`📊 Fetching contributions for: ${username}`);

  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "GitHub-Profile-Viewer",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch contribution data",
        message: data.errors[0].message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const calendar =
    data.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    return new Response(
      JSON.stringify({ error: "Contribution data not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const totalContributions = calendar.totalContributions;
  const contributions = [];

  calendar.weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      contributions.push({
        date: day.date,
        count: day.contributionCount,
        color: day.color,
      });
    });
  });

  return new Response(JSON.stringify({ totalContributions, contributions }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${GITHUB_API_CONFIG.cacheTime}`,
    },
  });
}

/**
 * Handle GitHub pinned repositories
 */
async function handleGitHubPinnedRepos(path, token) {
  const usernameMatch = path.match(/\/users\/([^/]+)\/pinned/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const username = usernameMatch[1];
  console.log(`📌 Fetching pinned repos for: ${username}`);

  const query = `
    query {
      user(login: "${username}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
              updatedAt
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "GitHub-Profile-Viewer",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch pinned repositories",
        message: data.errors[0].message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!data.data?.user?.pinnedItems?.nodes) {
    return new Response(
      JSON.stringify({ error: "Pinned repositories not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(data.data.user.pinnedItems.nodes), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${GITHUB_API_CONFIG.cacheTime}`,
    },
  });
}

/**
 * Handle GitHub top languages
 */
async function handleGitHubTopLanguages(path, token) {
  const usernameMatch = path.match(/\/users\/([^/]+)\/top-languages/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const username = usernameMatch[1];
  console.log(`🔤 Fetching top languages for: ${username}`);

  const query = `
    query {
      user(login: "${username}") {
        repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, isFork: false) {
          nodes {
            name
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "GitHub-Profile-Viewer",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch top languages",
        message: data.errors[0].message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!data.data?.user?.repositories?.nodes) {
    return new Response(
      JSON.stringify({ error: "Repository language data not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Process language data
  const languages = {};
  let totalSize = 0;

  data.data.user.repositories.nodes.forEach((repo) => {
    if (repo.languages?.edges) {
      repo.languages.edges.forEach((edge) => {
        const { name, color } = edge.node;
        const size = edge.size;

        if (!languages[name]) {
          languages[name] = { size: 0, color };
        }

        languages[name].size += size;
        totalSize += size;
      });
    }
  });

  if (totalSize === 0) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Convert to array and calculate percentages
  const languageArray = Object.keys(languages).map((name) => ({
    name,
    color: languages[name].color,
    size: languages[name].size,
    percentage: ((languages[name].size / totalSize) * 100).toFixed(1),
  }));

  // Sort by size (descending)
  languageArray.sort((a, b) => b.size - a.size);

  return new Response(JSON.stringify(languageArray), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${GITHUB_API_CONFIG.cacheTime}`,
    },
  });
}

/**
 * Handle GitHub detailed activity
 */
async function handleGitHubDetailedActivity(path, token) {
  const usernameMatch = path.match(/\/users\/([^/]+)\/detailed-activity/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const username = usernameMatch[1];
  console.log(`📈 Fetching detailed activity for: ${username}`);

  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 10) {
            repository {
              name
              url
            }
            contributions {
              totalCount
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 10) {
            repository {
              name
              url
            }
            contributions {
              totalCount
            }
          }
          issueContributionsByRepository(maxRepositories: 10) {
            repository {
              name
              url
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "GitHub-Profile-Viewer",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch detailed activity",
        message: data.errors[0].message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!data.data?.user?.contributionsCollection) {
    return new Response(
      JSON.stringify({ error: "Detailed activity data not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(data.data.user.contributionsCollection), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${GITHUB_API_CONFIG.cacheTime}`,
    },
  });
}
// ======================================================================
// ENHANCED API FUNCTIONS
// ======================================================================

/**
 * Enhanced fetch with exponential backoff and circuit breaker
 */
async function fetchWithRetry(url, options, timeout, retries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);

      if (response.ok) {
        return response;
      } else if (response.status >= 500 && attempt < retries) {
        // Exponential backoff for server errors
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      } else {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
}

/**
 * Enhanced timeout handling with AbortController
 */
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Enhanced API data fetching with better error handling
 */
async function fetchAndValidateApiData(apiEndpoints, env, ctx) {
  const startTime = Date.now();

  const apiDataPromises = apiEndpoints.map(async (endpoint) => {
    try {
      // Check if this is a GitHub API endpoint
      if (endpoint.startsWith("/api/github/")) {
        console.log(`🔍 Processing GitHub API endpoint: ${endpoint}`);

        // Create a mock request for GitHub API handling
        const mockRequest = new Request(`https://example.com${endpoint}`, {
          method: "GET",
          headers: {
            "User-Agent": "SEO-Bot-Worker/6.0.0",
          },
        });

        const githubResponse = await handleGitHubAPI(mockRequest, env, ctx);
        if (githubResponse && githubResponse.ok) {
          const data = await githubResponse.json();
          console.log(`✅ GitHub API data received for ${endpoint}`);
          return data;
        } else {
          console.error(`❌ GitHub API failed for ${endpoint}`);
          return null;
        }
      }

      // Handle regular Strapi API endpoints (your existing code)
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "SEO-Bot-Worker/6.0.0",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      // Try primary server first
      try {
        const apiResponse = await fetchWithRetry(
          `${PRIMARY_STRAPI}${endpoint}`,
          { method: "GET", headers, mode: "cors", credentials: "omit" },
          TIMEOUT_MS,
          2
        );

        if (apiResponse?.ok) {
          const data = await apiResponse.json();
          if (validateApiResponse(data)) {
            performanceMetrics.primaryServerHealth = true;
            return data;
          }
        }
      } catch (error) {
        logError(error, "fetchApiData_primary", { endpoint });
        performanceMetrics.primaryServerHealth = false;
      }

      // Fallback to backup server
      try {
        const backupResponse = await fetchWithRetry(
          `${BACKUP_STRAPI}${endpoint}`,
          { method: "GET", headers, mode: "cors", credentials: "omit" },
          TIMEOUT_MS,
          2
        );

        if (backupResponse?.ok) {
          const data = await backupResponse.json();
          if (validateApiResponse(data)) {
            performanceMetrics.backupServerHealth = true;
            return data;
          }
        }
      } catch (error) {
        logError(error, "fetchApiData_backup", { endpoint });
        performanceMetrics.backupServerHealth = false;
      }

      return null;
    } catch (error) {
      logError(error, "fetchApiData_general", { endpoint });
      return null;
    }
  });

  const results = await Promise.all(apiDataPromises);
  const successCount = results.filter((r) => r !== null).length;

  performanceMetrics.apiSuccessRate = successCount / results.length;

  // Track API performance
  await trackPerformance({
    operation: "api_fetch",
    duration: Date.now() - startTime,
    successRate: performanceMetrics.apiSuccessRate,
    endpointCount: apiEndpoints.length,
  });

  return results;
}

/**
 * Enhanced API response validation
 */
function validateApiResponse(data) {
  try {
    if (!data || typeof data !== "object") {
      return false;
    }

    // Check for Strapi response structure
    if (!data.data) {
      return false;
    }

    // Handle both array and single object responses
    if (Array.isArray(data.data)) {
      // Empty arrays are valid but not useful for rendering
      return data.data.length > 0;
    } else {
      // Single object responses should have some content
      return data.data && typeof data.data === "object";
    }
  } catch (error) {
    logError(error, "validateApiResponse");
    return false;
  }
}

// ======================================================================
// ENHANCED VALIDATION FUNCTIONS
// ======================================================================

/**
 * Enhanced photo data validation with detailed checks
 */
function isValidPhotoData(data) {
  try {
    if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return false;
    }

    const validItems = data.data.filter((item) => {
      if (!item) return false;

      const hasImage = !!(
        getImageUrl(item) ||
        getDataFromItem(item, "image") ||
        getDataFromItem(item, "Image")
      );

      const hasTitle = !!(
        getDataFromItem(item, "title") ||
        getDataFromItem(item, "Title") ||
        getDataFromItem(item, "name") ||
        getDataFromItem(item, "Name")
      );

      return hasImage || hasTitle;
    });

    return validItems.length > 0;
  } catch (error) {
    logError(error, "isValidPhotoData");
    return false;
  }
}

/**
 * Generic validation function for other content types
 */
function isValidContentData(data, requiredFields = []) {
  try {
    if (!data?.data) return false;

    if (Array.isArray(data.data)) {
      if (data.data.length === 0) return false;

      // If required fields specified, check at least one item has them
      if (requiredFields.length > 0) {
        return data.data.some((item) =>
          requiredFields.some((field) => getDataFromItem(item, field))
        );
      }

      return true;
    } else {
      // Single object
      if (requiredFields.length > 0) {
        return requiredFields.some((field) =>
          getDataFromItem(data.data, field)
        );
      }

      return true;
    }
  } catch (error) {
    logError(error, "isValidContentData", { requiredFields });
    return false;
  }
}

// Specific validation functions using the generic one
const isValidCertificateData = (data) =>
  isValidContentData(data, ["Title", "title", "name"]);
const isValidProjectData = (data) =>
  isValidContentData(data, ["Title", "title", "name"]);
const isValidPlanData = (data) =>
  isValidContentData(data, ["Title", "title", "name"]);
const isValidAmvData = (data) =>
  isValidContentData(data, ["Title", "title", "name"]);
/**
 * Enhanced blog data validation with better structure handling
 */
function isValidBlogData(data) {
  try {
    if (!data?.data) {
      console.log("❌ Blog validation failed: No data property");
      return false;
    }

    if (Array.isArray(data.data)) {
      if (data.data.length === 0) {
        console.log("❌ Blog validation failed: Empty data array");
        return false;
      }

      // Check if at least one item has required fields
      const validItems = data.data.filter((item) => {
        const hasTitle = !!(
          getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          getDataFromItem(item, "headline")
        );

        const hasContent = !!(
          getDataFromItem(item, "excerpt") ||
          getDataFromItem(item, "Excerpt") ||
          getDataFromItem(item, "description") ||
          getDataFromItem(item, "Description")
        );

        return hasTitle || hasContent;
      });

      console.log(
        `✅ Blog validation: ${validItems.length}/${data.data.length} valid items`
      );
      return validItems.length > 0;
    } else {
      // Single blog post
      const hasTitle = !!(
        getDataFromItem(data.data, "Title") ||
        getDataFromItem(data.data, "title") ||
        getDataFromItem(data.data, "headline")
      );

      console.log(`✅ Blog validation: Single post, has title: ${hasTitle}`);
      return hasTitle;
    }
  } catch (error) {
    console.error("❌ Blog validation error:", error);
    logError(error, "isValidBlogData");
    return false;
  }
}

// ======================================================================
// ENHANCED CONTENT GENERATORS
// ======================================================================

/**
 * Enhanced photography HTML generator with better error handling
 */
function generatePhotographyHtml(apiData) {
  try {
    if (!isValidPhotoData(apiData)) {
      return '<div class="no-photos"><h3>Photography content is being loaded...</h3></div>';
    }

    const shuffledData = shuffleArray(apiData.data);
    let html = `<div class="photography-gallery-bot masonry-grid" data-component="photography">`;

    shuffledData.forEach((item, index) => {
      if (!item) return;

      const title = escapeHtml(
        getDataFromItem(item, "title") ||
          getDataFromItem(item, "Title") ||
          `Photo ${index + 1}`
      );

      const description = escapeHtml(
        getDataFromItem(item, "description") ||
          getDataFromItem(item, "Description") ||
          ""
      );

      const location = escapeHtml(
        getDataFromItem(item, "location") ||
          getDataFromItem(item, "Location") ||
          ""
      );

      const altText = escapeHtml(
        getDataFromItem(item, "alt_text") ||
          getDataFromItem(item, "altText") ||
          title
      );

      // Enhanced category handling
      let categoryName = "general";
      const categoryData = getDataFromItem(item, "category");
      if (categoryData) {
        if (typeof categoryData === "string") {
          categoryName = categoryData;
        } else if (categoryData.name) {
          categoryName = categoryData.name;
        } else if (categoryData.data?.attributes?.name) {
          categoryName = categoryData.data.attributes.name;
        }
      }
      const category = escapeHtml(categoryName);

      const imageUrl =
        getImageUrl(item) || createAdaptivePlaceholder(400, 300, "Photo");

      html += `
        <div class="masonry-item photography-item" 
             data-category="${category}" 
             itemscope 
             itemtype="https://schema.org/ImageObject">
          <div class="photo-container">
            <img src="${imageUrl}" 
                 alt="${altText}" 
                 loading="lazy" 
                 decoding="async"
                 crossorigin="anonymous"
                 itemprop="contentUrl"
                 class="photography-image"
                 onerror="this.src='${createAdaptivePlaceholder(
                   400,
                   300,
                   "Error"
                 )}'" />
            <div class="photo-overlay">
              <h3 itemprop="name" class="photo-title">${title}</h3>
              ${
                description
                  ? `<p itemprop="description" class="photo-description">${description}</p>`
                  : ""
              }
              ${location ? `<p class="photo-location">${location}</p>` : ""}
            </div>
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generatePhotographyHtml");
    return '<div class="error-message"><h3>Error loading photography content</h3></div>';
  }
}

/**
 * Enhanced certificate HTML generator
 */
function generateCertificateHtml(apiData) {
  try {
    if (!isValidCertificateData(apiData)) {
      return '<div class="no-content"><h3>Certificate content is being loaded...</h3></div>';
    }

    let html = `<div class="certificate-carousel" data-component="certificate">`;

    apiData.data.forEach((item, index) => {
      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled Certificate"
      );

      const issuer = escapeHtml(
        getDataFromItem(item, "Issuer") ||
          getDataFromItem(item, "issuer") ||
          "Unknown Issuer"
      );

      const description = escapeHtml(
        getDataFromItem(item, "Description") ||
          getDataFromItem(item, "description") ||
          ""
      );

      const date =
        getDataFromItem(item, "Date") || getDataFromItem(item, "date") || "";
      const imageUrl =
        getImageUrl(item) || createAdaptivePlaceholder(300, 200, "Certificate");

      const certDate = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No date provided";

      html += `
        <div class="carousel-item certificate-item" 
             itemscope 
             itemtype="https://schema.org/EducationalOccupationalCredential">
          <div class="certificate-image-container">
            <img src="${imageUrl}" 
                 alt="${title}" 
                 loading="lazy" 
                 decoding="async"
                 crossorigin="anonymous"
                 class="certificate-image" />
          </div>
          <div class="certificate-info">
            <h3 itemprop="name" class="certificate-title">${title}</h3>
            <div class="meta">
              ${
                issuer
                  ? `<span class="issuer" itemprop="credentialCategory">${issuer}</span>`
                  : ""
              }
              ${
                date
                  ? `<time datetime="${date}" itemprop="dateCreated">${certDate}</time>`
                  : ""
              }
            </div>
            ${
              description
                ? `<div class="description-container"><p itemprop="description">${description}</p></div>`
                : ""
            }
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateCertificateHtml");
    return '<div class="error-message"><h3>Error loading certificate content</h3></div>';
  }
}

/**
 * Enhanced business plan HTML generator with better PDF handling
 */
function generateBusinessPlanHtml(apiData) {
  try {
    if (!isValidPlanData(apiData)) {
      return '<div class="no-content"><h3>Business plan content is being loaded...</h3></div>';
    }

    let html =
      '<div class="business-plans-container-bot" data-component="business-plan">';

    apiData.data.forEach((item, index) => {
      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled Plan"
      );

      const description = escapeHtml(
        getDataFromItem(item, "Description") ||
          getDataFromItem(item, "description") ||
          ""
      );

      const industry = escapeHtml(
        getDataFromItem(item, "Industry") ||
          getDataFromItem(item, "industry") ||
          ""
      );

      const slug =
        getDataFromItem(item, "Slug") || getDataFromItem(item, "slug") || "";

      // Enhanced document URL extraction
      let documentUrl =
        getDocumentFileUrl(item, "DocumentFile") ||
        getDocumentFileUrl(item, "documentFile") ||
        "";

      // Apply Cloudinary transformation if needed
      if (documentUrl && documentUrl.includes("cloudinary.com")) {
        documentUrl = transformCloudinaryPdfUrl(documentUrl);
      }

      // Enhanced file type detection
      let fileType = "";
      let fileSize = "";
      if (documentUrl) {
        const fileExt = documentUrl.split(".").pop()?.toLowerCase();
        fileType = fileExt?.toUpperCase() || "FILE";

        // Try to get file size from metadata
        const sizeData =
          getDataFromItem(item, "DocumentFile")?.size ||
          getDataFromItem(item, "documentFile")?.size;
        if (sizeData) {
          fileSize = formatFileSize(sizeData);
        }
      }

      const coverImageUrl =
        getImageUrl(item, "CoverImage") ||
        createAdaptivePlaceholder(300, 400, "Document");

      const createdAt = getDataFromItem(item, "createdAt");
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })
        : "";

      html += `
        <div class="document-item" data-file="${documentUrl}" data-slug="${slug}"
             itemscope itemtype="https://schema.org/CreativeWork">
          <div class="document-cover" style="background-image: url('${coverImageUrl}');">
            ${
              fileType
                ? `<div class="document-type-badge">${fileType}</div>`
                : ""
            }
          </div>
          <div class="document-details">
            <h2 itemprop="name">${title}</h2>
            <div class="document-meta">
              ${
                fileType
                  ? `<span class="document-type">${fileType} Document</span>`
                  : ""
              }
              ${
                fileSize ? `<span class="document-size">${fileSize}</span>` : ""
              }
              ${date ? `<span class="document-date">${date}</span>` : ""}
            </div>
            ${
              industry
                ? `<p>Industry: <span itemprop="about">${industry}</span></p>`
                : ""
            }
            ${
              description
                ? `<div class="document-description" itemprop="description">${description}</div>`
                : ""
            }
            <button class="view-document-btn" ${!documentUrl ? "disabled" : ""}>
              ${documentUrl ? "View Document" : "No Document Available"}
            </button>
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateBusinessPlanHtml");
    return '<div class="error-message"><h3>Error loading business plan content</h3></div>';
  }
}

/**
 * Enhanced marketing plan HTML generator
 */
function generateMarketingPlanHtml(apiData) {
  try {
    if (!isValidPlanData(apiData)) {
      return '<div class="no-content"><h3>Marketing plan content is being loaded...</h3></div>';
    }

    let html =
      '<div class="marketing-plans-container-bot" data-component="marketing-plan">';

    apiData.data.forEach((item, index) => {
      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled Plan"
      );

      const description = escapeHtml(
        getDataFromItem(item, "Description") ||
          getDataFromItem(item, "description") ||
          ""
      );

      const client = escapeHtml(
        getDataFromItem(item, "Client") || getDataFromItem(item, "client") || ""
      );

      const slug =
        getDataFromItem(item, "Slug") || getDataFromItem(item, "slug") || "";

      let documentUrl =
        getDocumentFileUrl(item, "DocumentFile") ||
        getDocumentFileUrl(item, "documentFile") ||
        "";

      if (documentUrl && documentUrl.includes("cloudinary.com")) {
        documentUrl = transformCloudinaryPdfUrl(documentUrl);
      }

      let fileType = "";
      let fileSize = "";
      if (documentUrl) {
        const fileExt = documentUrl.split(".").pop()?.toLowerCase();
        fileType = fileExt?.toUpperCase() || "FILE";

        const sizeData =
          getDataFromItem(item, "DocumentFile")?.size ||
          getDataFromItem(item, "documentFile")?.size;
        if (sizeData) {
          fileSize = formatFileSize(sizeData);
        }
      }

      const coverImageUrl =
        getImageUrl(item, "CoverImage") ||
        createAdaptivePlaceholder(300, 400, "Document");

      const createdAt = getDataFromItem(item, "createdAt");
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })
        : "";

      html += `
        <div class="document-item" data-file="${documentUrl}" data-slug="${slug}"
             itemscope itemtype="https://schema.org/CreativeWork">
          <div class="document-cover" style="background-image: url('${coverImageUrl}');">
            ${
              fileType
                ? `<div class="document-type-badge">${fileType}</div>`
                : ""
            }
          </div>
          <div class="document-details">
            <h2 itemprop="name">${title}</h2>
            <div class="document-meta">
              ${
                fileType
                  ? `<span class="document-type">${fileType} Document</span>`
                  : ""
              }
              ${
                fileSize ? `<span class="document-size">${fileSize}</span>` : ""
              }
              ${date ? `<span class="document-date">${date}</span>` : ""}
            </div>
            ${
              client
                ? `<p>Client: <span itemprop="creator">${client}</span></p>`
                : ""
            }
            ${
              description
                ? `<div class="document-description" itemprop="description">${description}</div>`
                : ""
            }
            <button class="view-document-btn" ${!documentUrl ? "disabled" : ""}>
              ${documentUrl ? "View Document" : "No Document Available"}
            </button>
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateMarketingPlanHtml");
    return '<div class="error-message"><h3>Error loading marketing plan content</h3></div>';
  }
}

/**
 * Enhanced coding project HTML generator
 */
function generateCodingProjectHtml(apiData) {
  try {
    if (!isValidProjectData(apiData)) {
      return '<div class="no-content"><h3>Coding project content is being loaded...</h3></div>';
    }

    let html =
      '<div class="coding-projects-container-bot" data-component="coding-project">';

    apiData.data.forEach((item) => {
      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled Project"
      );

      const description = escapeHtml(
        getDataFromItem(item, "Description") ||
          getDataFromItem(item, "description") ||
          ""
      );

      const technologies = escapeHtml(
        getDataFromItem(item, "Technologies") ||
          getDataFromItem(item, "technologies") ||
          ""
      );

      const githubUrl =
        getDataFromItem(item, "GithubUrl") ||
        getDataFromItem(item, "githubUrl") ||
        "#";

      const demoUrl =
        getDataFromItem(item, "DemoUrl") ||
        getDataFromItem(item, "demoUrl") ||
        "#";

      // Enhanced project metadata
      const status = escapeHtml(
        getDataFromItem(item, "Status") || getDataFromItem(item, "status") || ""
      );

      const featured =
        getDataFromItem(item, "Featured") ||
        getDataFromItem(item, "featured") ||
        false;

      html += `
        <div class="coding-project-item ${featured ? "featured" : ""}" 
             itemscope itemtype="https://schema.org/SoftwareApplication">
          <h3 itemprop="name">${title}</h3>
          <p itemprop="description">${description}</p>
          ${
            technologies
              ? `<p class="technologies">Technologies: <span itemprop="programmingLanguage">${technologies}</span></p>`
              : ""
          }
          ${
            status
              ? `<p class="status">Status: <span class="status-${status.toLowerCase()}">${status}</span></p>`
              : ""
          }
          <div class="project-links">
            ${
              githubUrl !== "#"
                ? `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" itemprop="codeRepository">GitHub</a>`
                : ""
            }
            ${
              demoUrl !== "#"
                ? `<a href="${demoUrl}" target="_blank" rel="noopener noreferrer" itemprop="url">Live Demo</a>`
                : ""
            }
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateCodingProjectHtml");
    return '<div class="error-message"><h3>Error loading coding project content</h3></div>';
  }
}

/**
 * Enhanced AMV editing HTML generator
 */
function generateAmvEditingHtml(apiData) {
  try {
    if (!isValidAmvData(apiData)) {
      return '<div class="no-content"><h3>AMV editing content is being loaded...</h3></div>';
    }

    let html =
      '<div class="amv-projects-container-bot" data-component="amv-editing">';

    apiData.data.forEach((item) => {
      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled AMV"
      );

      const description = escapeHtml(
        getDataFromItem(item, "Description") ||
          getDataFromItem(item, "description") ||
          ""
      );

      const videoUrl =
        getDataFromItem(item, "VideoUrl") ||
        getDataFromItem(item, "videoUrl") ||
        "#";

      const thumbnailUrl =
        getImageUrl(item, "Thumbnail") ||
        createAdaptivePlaceholder(400, 300, "Video");

      // Enhanced video metadata
      const duration =
        getDataFromItem(item, "Duration") ||
        getDataFromItem(item, "duration") ||
        "";

      const anime = escapeHtml(
        getDataFromItem(item, "Anime") || getDataFromItem(item, "anime") || ""
      );

      const music = escapeHtml(
        getDataFromItem(item, "Music") || getDataFromItem(item, "music") || ""
      );

      html += `
        <div class="amv-project-item" itemscope itemtype="https://schema.org/VideoObject">
          <img src="${thumbnailUrl}" 
               alt="${title}" 
               loading="lazy" 
               decoding="async"
               crossorigin="anonymous"
               itemprop="thumbnailUrl"
               class="amv-thumbnail" />
          <h3 itemprop="name">${title}</h3>
          ${description ? `<p itemprop="description">${description}</p>` : ""}
          ${anime ? `<p class="anime">Anime: <span>${anime}</span></p>` : ""}
          ${music ? `<p class="music">Music: <span>${music}</span></p>` : ""}
          ${
            duration
              ? `<p class="duration" itemprop="duration">${duration}</p>`
              : ""
          }
          ${
            videoUrl !== "#"
              ? `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-link" itemprop="contentUrl">Watch Video</a>`
              : ""
          }
        </div>
      `;
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateAmvEditingHtml");
    return '<div class="error-message"><h3>Error loading AMV editing content</h3></div>';
  }
}

/**
 * Enhanced blog HTML generator
 */
/**
 * Enhanced blog HTML generator with better category/tag extraction
 */
function generateBlogHtml(apiData) {
  try {
    console.log("🔧 Generating blog HTML...", apiData);

    if (!isValidBlogData(apiData)) {
      console.log("⚠️ Invalid blog data, showing fallback");
      return '<div class="no-content"><h3>Blog content is being loaded...</h3></div>';
    }

    let html = '<div class="blog-posts-container-bot" data-component="blog">';

    apiData.data.forEach((item, index) => {
      console.log(`Processing blog item ${index}:`, item);

      const title = escapeHtml(
        getDataFromItem(item, "Title") ||
          getDataFromItem(item, "title") ||
          "Untitled Post"
      );

      const excerpt = escapeHtml(
        getDataFromItem(item, "excerpt") ||
          getDataFromItem(item, "Excerpt") ||
          getDataFromItem(item, "description") ||
          getDataFromItem(item, "Description") ||
          ""
      );

      const publishedAt =
        getDataFromItem(item, "publishDate") ||
        getDataFromItem(item, "publishedAt") ||
        getDataFromItem(item, "PublishedAt") ||
        getDataFromItem(item, "createdAt");

      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : "";

      const slug =
        getDataFromItem(item, "slug") || getDataFromItem(item, "Slug") || "";

      // Enhanced featured image extraction
      const featuredImageUrl =
        getImageUrl(item, "featuredImage") ||
        getImageUrl(item, "FeaturedImage") ||
        getImageUrl(item, "image") ||
        createAdaptivePlaceholder(400, 300, "Blog Post");

      // Enhanced author extraction
      const author = escapeHtml(
        getDataFromItem(item, "Author") ||
          getDataFromItem(item, "author") ||
          "Shain Wai Yan"
      );

      // Enhanced reading time extraction
      const readTime =
        getDataFromItem(item, "ReadTime") ||
        getDataFromItem(item, "readTime") ||
        getDataFromItem(item, "reading_time") ||
        "";

      // Enhanced category extraction - FIXED
      const categories = [];
      const categoryData = getDataFromItem(item, "category");
      if (categoryData) {
        if (typeof categoryData === "string") {
          categories.push(categoryData.trim());
        } else if (categoryData.name) {
          categories.push(categoryData.name.trim());
        } else if (categoryData.data?.attributes?.name) {
          categories.push(categoryData.data.attributes.name.trim());
        }
      }

      // Also check for categories (plural)
      const categoriesData = getDataFromItem(item, "categories");
      if (categoriesData && Array.isArray(categoriesData)) {
        categoriesData.forEach((cat) => {
          if (typeof cat === "string") {
            categories.push(cat.trim());
          } else if (cat.name) {
            categories.push(cat.name.trim());
          } else if (cat.attributes?.name) {
            categories.push(cat.attributes.name.trim());
          }
        });
      }

      // Enhanced tags extraction - FIXED
      const tags = [];
      const tagsData = getDataFromItem(item, "tags");
      if (tagsData) {
        if (Array.isArray(tagsData)) {
          tagsData.forEach((tag) => {
            if (typeof tag === "string") {
              tags.push(tag.trim());
            } else if (tag.name) {
              tags.push(tag.name.trim());
            } else if (tag.attributes?.name) {
              tags.push(tag.attributes.name.trim());
            }
          });
        }
      }

      console.log(`Blog item ${index} processed:`, {
        title,
        categories,
        tags,
        slug,
        hasImage: !!featuredImageUrl,
      });

      html += `
        <article class="blog-post-item" itemscope itemtype="https://schema.org/BlogPosting">
          <img src="${featuredImageUrl}" 
               alt="${title}" 
               loading="lazy" 
               decoding="async"
               crossorigin="anonymous"
               itemprop="image"
               class="blog-featured-image" />
          <h2 itemprop="headline">${title}</h2>
          <div class="blog-meta">
            <span itemprop="author" itemscope itemtype="https://schema.org/Person">
              <span itemprop="name">${author}</span>
            </span>
            ${
              date
                ? `<time datetime="${publishedAt}" itemprop="datePublished">${date}</time>`
                : ""
            }
            ${readTime ? `<span class="read-time">${readTime}</span>` : ""}
          </div>
          ${excerpt ? `<p itemprop="description">${excerpt}</p>` : ""}
          ${
            categories.length > 0
              ? `<div class="categories">${categories
                  .map(
                    (cat) => `<span class="category">${escapeHtml(cat)}</span>`
                  )
                  .join("")}</div>`
              : ""
          }
          ${
            tags.length > 0
              ? `<div class="tags">${tags
                  .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
                  .join("")}</div>`
              : ""
          }
          ${
            slug
              ? `<a href="/blog/${slug}" class="read-more" itemprop="url">Read More</a>`
              : ""
          }
        </article>
      `;
    });

    html += "</div>";
    console.log("✅ Blog HTML generated successfully");
    return html;
  } catch (error) {
    console.error("❌ Error generating blog HTML:", error);
    logError(error, "generateBlogHtml");
    return '<div class="error-message"><h3>Error loading blog content</h3></div>';
  }
}

/**
 * Enhanced generic HTML generator
 */
function generateGenericHtml(apiData) {
  try {
    if (!apiData) {
      return '<div class="no-content"><h3>Content is being loaded...</h3></div>';
    }

    let html = '<div class="generic-content-bot">';

    if (apiData.data) {
      if (Array.isArray(apiData.data)) {
        apiData.data.forEach((item) => {
          html += `<div class="api-data-item" itemscope itemtype="https://schema.org/Thing">`;

          const title =
            getDataFromItem(item, "Title") || getDataFromItem(item, "title");
          const description =
            getDataFromItem(item, "Description") ||
            getDataFromItem(item, "description");

          if (title) {
            html += `<h3 itemprop="name">${escapeHtml(title)}</h3>`;
          }

          if (description) {
            html += `<p itemprop="description">${escapeHtml(description)}</p>`;
          }

          const imageUrl = getImageUrl(item);
          if (imageUrl) {
            const imageAlt = escapeHtml(title || "Image");
            html += `<img src="${imageUrl}" alt="${imageAlt}" loading="lazy" decoding="async" crossorigin="anonymous" itemprop="image" />`;
          }

          html += `</div>`;
        });
      } else {
        html += `<div itemscope itemtype="https://schema.org/Thing">`;

        const title =
          getDataFromItem(apiData.data, "Title") ||
          getDataFromItem(apiData.data, "title");
        const description =
          getDataFromItem(apiData.data, "Description") ||
          getDataFromItem(apiData.data, "description");
        const content = sanitizeHtml(
          getDataFromItem(apiData.data, "Content") ||
            getDataFromItem(apiData.data, "content") ||
            ""
        );

        if (title) {
          html += `<h2 itemprop="name">${escapeHtml(title)}</h2>`;
        }

        if (description) {
          html += `<p itemprop="description">${escapeHtml(description)}</p>`;
        }

        if (content) {
          html += `<div class="content" itemprop="text">${content}</div>`;
        }

        const imageUrl = getImageUrl(apiData.data);
        if (imageUrl) {
          const imageAlt = escapeHtml(title || "Image");
          html += `<img src="${imageUrl}" alt="${imageAlt}" loading="lazy" decoding="async" crossorigin="anonymous" itemprop="image" />`;
        }

        html += `</div>`;
      }
    }

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateGenericHtml");
    return '<div class="error-message"><h3>Error loading content</h3></div>';
  }
}

// ======================================================================
// ENHANCED CONTENT INJECTION
// ======================================================================

/**
 * Enhanced component type detection
 */
function getComponentType(pathname) {
  const pathMap = {
    photography: "photography",
    certificate: "certificate",
    "coding-project": "coding-project",
    "marketing-plan": "marketing-plan",
    "business-plan": "business-plan",
    "amv-editing": "amv-editing",
    blog: "blog",
  };

  for (const [key, value] of Object.entries(pathMap)) {
    if (pathname.includes(`/${key}`)) {
      return value;
    }
  }

  return "generic";
}

/**
 * Enhanced content generation with error boundaries
 */
function generateContentForPath(pathname, apiDataResults) {
  const componentType = getComponentType(pathname);

  try {
    if (componentType === "coding-project") {
      // Check if we have GitHub API data
      const hasGitHubData =
        apiDataResults &&
        Array.isArray(apiDataResults) &&
        apiDataResults.some(
          (item) => item && (item.login || Array.isArray(item))
        );

      if (hasGitHubData) {
        console.log("✅ Using GitHub API data for coding project");
        return generateGitHubContentHtml(apiDataResults);
      } else {
        console.log("⚠️ No GitHub data, using Strapi data");
        // Find the first non-GitHub API response for Strapi data
        const strapiData = apiDataResults?.find((item) => item && item.data);
        return generateCodingProjectHtml(strapiData);
      }
    }

    // Handle other content types with first API result
    const apiData =
      apiDataResults && apiDataResults.length > 0 ? apiDataResults[0] : null;

    switch (componentType) {
      case "photography":
        return generatePhotographyHtml(apiData);
      case "certificate":
        return generateCertificateHtml(apiData);
      case "marketing-plan":
        return generateMarketingPlanHtml(apiData);
      case "business-plan":
        return generateBusinessPlanHtml(apiData);
      case "amv-editing":
        return generateAmvEditingHtml(apiData);
      case "blog":
        return generateBlogHtml(apiData);
      default:
        return generateGenericHtml(apiData);
    }
  } catch (error) {
    logError(error, "generateContentForPath", { pathname, componentType });
    return '<div class="error-message"><h3>Error generating content</h3></div>';
  }
}

/**
 * Enhanced content injection with better DOM manipulation
 */
async function injectContentSafely(html, apiDataResults, pathname) {
  try {
    if (!apiDataResults || apiDataResults.length === 0) {
      return html;
    }

    const contentHtml = generateContentForPath(pathname, apiDataResults);
    const contentSelector =
      BOT_CONFIG.contentSelectors[pathname] ||
      BOT_CONFIG.defaultContentSelector;

    // Enhanced content injection with better pattern matching
    if (pathname.includes("/photography")) {
      const gridPattern =
        /<div[^>]+id=["']masonry-grid["'][^>]*>[\s\S]*?<\/div>/i;
      if (gridPattern.test(html)) {
        return html.replace(
          gridPattern,
          `<div class="masonry-grid" id="masonry-grid">${contentHtml}</div>`
        );
      }
    } else if (
      pathname.includes("/business-plan") ||
      pathname.includes("/marketing-plan")
    ) {
      const docPattern =
        /<div[^>]+class=["'][^"']*document-list[^"']*["'][^>]*>[\s\S]*?<\/div>/i;
      if (docPattern.test(html)) {
        return html.replace(
          docPattern,
          `<div class="document-list">${contentHtml}</div>`
        );
      }
    } else if (pathname.includes("/coding-project")) {
      // Inject GitHub content into the github-container
      const githubPattern =
        /<div[^>]+class="[^"]*github-container[^"]*"[^>]*>/i;
      if (githubPattern.test(html)) {
        return html.replace(githubPattern, `$&\n${contentHtml}`);
      } else {
        // Fallback: inject before closing main tag
        return html.replace(
          "</main>",
          `<div class="bot-rendered-content">${contentHtml}</div></main>`
        );
      }
    }

    // Generic injection for other content types
    const mainPattern =
      /<main[^>]+id=["']main-content["'][^>]*>([\s\S]*?)<\/main>/i;
    if (mainPattern.test(html)) {
      return html.replace(mainPattern, (match, content) => {
        return match.replace(
          content,
          `<div class="bot-rendered-content">${contentHtml}</div>${content}`
        );
      });
    }

    // Final fallback: just before closing main tag
    return html.replace(
      "</main>",
      `<div class="bot-rendered-content">${contentHtml}</div></main>`
    );
  } catch (error) {
    logError(error, "injectContentSafely", { pathname });
    return html;
  }
}

/**
 * Enhanced GitHub content HTML generator
 */
function generateGitHubContentHtml(githubDataResults) {
  try {
    if (!githubDataResults || githubDataResults.length === 0) {
      return '<div class="github-loading">Loading GitHub data...</div>';
    }

    let html = '<div class="github-bot-content">';

    // Process GitHub API responses
    githubDataResults.forEach((apiResponse, index) => {
      if (!apiResponse) return;

      console.log(
        `Processing GitHub API response ${index}:`,
        typeof apiResponse
      );

      // Handle user data (from /api/github/users/username)
      if (apiResponse.login) {
        html += `
          <div class="github-profile-bot" itemscope itemtype="https://schema.org/Person">
            <div class="profile-header-bot">
              <img src="${apiResponse.avatar_url}" alt="${
          apiResponse.login
        }" width="80" height="80" itemprop="image">
              <div class="profile-info-bot">
                <h3 itemprop="name">${escapeHtml(
                  apiResponse.name || apiResponse.login
                )}</h3>
                <p itemprop="alternateName">@${apiResponse.login}</p>
                ${
                  apiResponse.bio
                    ? `<p itemprop="description">${escapeHtml(
                        apiResponse.bio
                      )}</p>`
                    : ""
                }
                <div class="profile-stats-bot">
                  <span>Repositories: <strong>${
                    apiResponse.public_repos
                  }</strong></span>
                  <span>Followers: <strong>${
                    apiResponse.followers
                  }</strong></span>
                  <span>Following: <strong>${
                    apiResponse.following
                  }</strong></span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Handle pinned repositories array
      if (
        Array.isArray(apiResponse) &&
        apiResponse.length > 0 &&
        apiResponse[0].name
      ) {
        html +=
          '<div class="github-pinned-repos-bot"><h4>Pinned Repositories</h4>';
        apiResponse.forEach((repo) => {
          html += `
            <div class="repo-item-bot" itemscope itemtype="https://schema.org/SoftwareSourceCode">
              <h5 itemprop="name">${escapeHtml(repo.name)}</h5>
              <p itemprop="description">${escapeHtml(
                repo.description || "No description"
              )}</p>
              <div class="repo-stats-bot">
                <span>Language: ${
                  repo.primaryLanguage?.name || "Not specified"
                }</span>
                <span>⭐ ${repo.stargazerCount || 0}</span>
                <span>🍴 ${repo.forkCount || 0}</span>
              </div>
            </div>
          `;
        });
        html += "</div>";
      }

      // Handle top languages array
      if (
        Array.isArray(apiResponse) &&
        apiResponse.length > 0 &&
        apiResponse[0].percentage
      ) {
        html += '<div class="github-languages-bot"><h4>Top Languages</h4>';
        apiResponse.slice(0, 5).forEach((lang) => {
          html += `
            <div class="language-item-bot">
              <span class="language-name" style="color: ${
                lang.color || "#333"
              }">${escapeHtml(lang.name)}</span>
              <span class="language-percentage">${lang.percentage}%</span>
            </div>
          `;
        });
        html += "</div>";
      }
    });

    html += "</div>";
    return html;
  } catch (error) {
    logError(error, "generateGitHubContentHtml");
    return '<div class="error-message"><h3>Error loading GitHub content</h3></div>';
  }
}
// ======================================================================
// ENHANCED DYNAMIC COMPONENT HYDRATION
// ======================================================================

/**
 * Enhanced component hydration with better error handling
 */
function addComponentHydration(html, pathname, apiData) {
  const componentType = getComponentType(pathname);
  const config = DYNAMIC_COMPONENTS[componentType];

  if (!config) return html;

  const nonce = generateNonce();

  const hydrationScript = `
    <script nonce="${nonce}" data-hydrate="${componentType}" defer>
      (function() {
        'use strict';
        
        const componentRegistry = window.componentRegistry || (window.componentRegistry = {
          retryQueue: [],
          failedComponents: new Set(),
          maxRetries: 3,
          retryDelay: 1000,
          
          register: function(component, fn) {
            try { 
              fn(); 
              console.log('✅ Component', component, 'initialized successfully');
              return true;
            } catch(e) {
              console.warn('⚠️ Component ' + component + ' failed, queued for retry:', e.message);
              this.retryQueue.push({ 
                component: component, 
                fn: fn, 
                attempts: 0,
                lastError: e.message
              });
              return false;
            }
          },
          
          retry: function() {
            if (this.retryQueue.length === 0) return;
            
            this.retryQueue = this.retryQueue.filter(function(item) {
              if (item.attempts >= this.maxRetries) {
                console.error('❌ Component', item.component, 'failed after', this.maxRetries, 'attempts. Last error:', item.lastError);
                this.failedComponents.add(item.component);
                return false;
              }
              
              try {
                item.fn();
                console.log('✅ Component', item.component, 'recovered on attempt', item.attempts + 1);
                return false;
              } catch(e) {
                item.attempts++;
                item.lastError = e.message;
                console.warn('⚠️ Retry', item.attempts, 'failed for', item.component, ':', e.message);
                return true;
              }
            }.bind(this));
          },
          
          scheduleRetry: function(delay) {
            setTimeout(function() {
              this.retry();
            }.bind(this), delay || this.retryDelay);
          }
        });
        
        function initComponent() {
          try {
            ${config.init};
          } catch(e) {
            console.error('❌ Component ${componentType} initialization failed:', e);
            throw e;
          }
        }
        
        function scheduleInit() {
          if ('${config.hydrationStrategy}' === 'immediate') {
            componentRegistry.register('${componentType}', initComponent);
          } else if ('${config.hydrationStrategy}' === 'visible') {
            if ('IntersectionObserver' in window) {
              const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                  if (entry.isIntersecting) {
                    componentRegistry.register('${componentType}', initComponent);
                    observer.disconnect();
                  }
                });
              }, { threshold: 0.1, rootMargin: '50px' });
              
              const target = document.querySelector('[data-component="${componentType}"]') || 
                           document.querySelector('.${componentType}-container-bot');
              
              if (target) {
                observer.observe(target);
              } else {
                componentRegistry.register('${componentType}', initComponent);
              }
            } else {
              componentRegistry.register('${componentType}', initComponent);
            }
          } else if ('${config.hydrationStrategy}' === 'idle') {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(function() {
                componentRegistry.register('${componentType}', initComponent);
              }, { timeout: 5000 });
            } else {
              setTimeout(function() {
                componentRegistry.register('${componentType}', initComponent);
              }, 100);
            }
          }
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', scheduleInit);
        } else {
          scheduleInit();
        }
        
        // Retry failed components
        componentRegistry.scheduleRetry(3000);
        componentRegistry.scheduleRetry(10000);
        
      })();
    </script>
    ${config.fallback}
  `;

  html = html.replace(
    "</head>",
    `<meta name="csp-nonce" content="${nonce}"></head>`
  );
  return html.replace("</body>", hydrationScript + "</body>");
}

// ======================================================================
// ENHANCED PERFORMANCE & SECURITY
// ======================================================================

/**
 * Enhanced performance budget enforcement with streaming
 */
function enforcePerfBudget(html, apiData) {
  try {
    const htmlSize = new TextEncoder().encode(html).length;
    performanceMetrics.memoryUsage = estimateMemoryUsage({ html, apiData });

    if (htmlSize > PERF_BUDGET.maxHtmlSize) {
      html = gracefulDegradation(html);
    }

    const imgCount = (html.match(/<img/g) || []).length;
    if (imgCount > PERF_BUDGET.maxImages) {
      html = optimizeImageLoading(html);
    }

    // Check memory usage
    if (performanceMetrics.memoryUsage > PERF_BUDGET.maxMemoryUsage) {
      html = reduceMemoryFootprint(html);
    }

    return html;
  } catch (error) {
    logError(error, "enforcePerfBudget");
    return html;
  }
}

/**
 * Enhanced graceful degradation
 */
function gracefulDegradation(html) {
  try {
    return html
      .replace(/<script\b(?![^>]*data-hydrate)[^>]*>(.*?)<\/script>/gis, "")
      .replace(/<img([^>]+)loading="lazy"/g, '<img$1loading="eager"')
      .replace(/<div[^>]*class="[^"]*decoration[^"]*"[^>]*>.*?<\/div>/gis, "")
      .replace(/animation-[^;]+;/g, "")
      .replace(/transition-[^;]+;/g, "")
      .replace(/transform-[^;]+;/g, "")
      .replace(/\s+data-[^=]+="[^"]*"/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/<!--[\s\S]*?-->/g, "");
  } catch (error) {
    logError(error, "gracefulDegradation");
    return html;
  }
}

/**
 * Enhanced image loading optimization
 */
/**
 * Enhanced image loading optimization - REPLACE THIS FUNCTION
 */
function optimizeImageLoading(html) {
  try {
    let imgCount = 0;

    // First pass: Add progressive loading attributes
    html = html.replace(/<img([^>]+)>/g, (match, attrs) => {
      imgCount++;

      // Add progressive loading attributes
      if (imgCount > PERF_BUDGET.maxImages / 2) {
        if (!attrs.includes("loading=")) {
          attrs += ' loading="lazy"';
        }
        if (!attrs.includes("decoding=")) {
          attrs += ' decoding="async"';
        }
        if (!attrs.includes("sizes=")) {
          attrs +=
            ' sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"';
        }
      }

      // Add error handling
      if (!attrs.includes("onerror=")) {
        attrs += ` onerror="this.style.display='none'"`;
      }

      return `<img${attrs}>`;
    });

    // Second pass: FIXED - Ensure all images have alt text
    html = html.replace(/<img([^>]+)>/g, (match, attrs) => {
      // Fix empty alt attributes
      attrs = attrs.replace(/alt=""/g, 'alt="Image"');
      // Add alt if missing
      if (!attrs.includes("alt=")) {
        attrs += ' alt="Image"';
      }
      return `<img${attrs}>`;
    });

    return html;
  } catch (error) {
    logError(error, "optimizeImageLoading");
    return html;
  }
}

/**
 * Memory footprint reduction
 */
function reduceMemoryFootprint(html) {
  try {
    // Remove non-essential attributes and content
    return html
      .replace(/\s+style="[^"]*"/g, "")
      .replace(/\s+class="[^"]*(?:animation|transition)[^"]*"/g, "")
      .replace(/<noscript>[\s\S]*?<\/noscript>/g, "")
      .replace(/\s+title="[^"]*"/g, "")
      .replace(/\s{2,}/g, " ");
  } catch (error) {
    logError(error, "reduceMemoryFootprint");
    return html;
  }
}

/**
 * Enhanced CSP header generation
 */
function generateCSPHeader(nonce) {
  const csp = Object.entries(SECURITY_CONFIG.contentSecurityPolicy)
    .map(([directive, sources]) => {
      if (directive === "script-src") {
        return `${directive} 'nonce-${nonce}' 'strict-dynamic' ${sources.join(
          " "
        )}`;
      }
      return `${directive} ${sources.join(" ")}`;
    })
    .join("; ");

  return csp;
}

// ======================================================================
// ENHANCED SEO & STRUCTURED DATA
// ======================================================================

/**
 * Enhanced SEO enhancements with better metadata
 */
/**
 * Enhanced SEO enhancements with better metadata - REPLACE THIS FUNCTION
 */
function addSEOEnhancements(html, url, apiData) {
  try {
    const pathname = url.pathname;
    const isChinesePage = pathname.startsWith("/zh/");
    const normalizedPath = pathname.endsWith(".html")
      ? pathname.slice(0, -5)
      : pathname;
    const canonicalUrl = url.origin + normalizedPath.replace(/\.html$/, "");

    // Enhanced canonical URL handling
    if (!html.includes('rel="canonical"')) {
      html = html.replace(
        /<head>/,
        `<head>\n    <link rel="canonical" href="${canonicalUrl}">`
      );
    }

    // Enhanced hreflang implementation - FIXED: Check if hreflang already exists
    if (!html.includes('rel="alternate" hreflang=')) {
      if (isChinesePage) {
        const englishUrl = url.origin + normalizedPath.replace("/zh", "");
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="en" href="${englishUrl}">`
        );
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="zh" href="${canonicalUrl}">`
        );
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="x-default" href="${englishUrl}">`
        );
      } else {
        const chineseUrl = url.origin + "/zh" + normalizedPath;
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="zh" href="${chineseUrl}">`
        );
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="en" href="${canonicalUrl}">`
        );
        html = html.replace(
          /<head>/,
          `<head>\n    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">`
        );
      }
    }

    // Enhanced structured data
    if (apiData && apiData.data) {
      const structuredData = generateEnhancedStructuredData(
        normalizedPath,
        apiData,
        url
      );
      if (structuredData) {
        html = html.replace(
          /<\/head>/,
          `  <script type="application/ld+json">${JSON.stringify(
            structuredData,
            null,
            2
          )}</script>\n</head>`
        );
      }
    }

    // Enhanced social meta tags
    html = addEnhancedSocialMetaTags(html, normalizedPath, apiData, url);

    // Add preconnect hints
    html = addPreconnectHints(html);

    return html;
  } catch (error) {
    logError(error, "addSEOEnhancements", { pathname: url.pathname });
    return html;
  }
}

/**
 * Enhanced structured data generation
 */
function generateEnhancedStructuredData(pathname, apiData, url) {
  try {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: url.href,
      name: "Shain Wai Yan - Professional Portfolio",
      description: "Marketing, Programming, and Creative Design Portfolio",
      author: {
        "@type": "Person",
        name: "Shain Wai Yan",
        url: "https://shainwaiyan.com",
        sameAs: [
          "https://linkedin.com/in/shainwaiyan",
          "https://github.com/shainwaiyan",
        ],
      },
      publisher: {
        "@type": "Organization",
        name: "Shain Wai Yan Portfolio",
        url: "https://shainwaiyan.com",
      },
    };

    if (!apiData || !apiData.data) {
      return baseData;
    }

    if (pathname.includes("/photography")) {
      return {
        ...baseData,
        "@type": "ImageGallery",
        name: "Photography Portfolio - Shain Wai Yan",
        description:
          "Professional photography portfolio showcasing various projects and artistic vision",
        image: apiData.data
          .map((item) => {
            const imageUrl = getImageUrl(item);
            if (!imageUrl) return null;

            return {
              "@type": "ImageObject",
              url: imageUrl,
              name:
                getDataFromItem(item, "Title") ||
                getDataFromItem(item, "title"),
              description:
                getDataFromItem(item, "Description") ||
                getDataFromItem(item, "description"),
              author: {
                "@type": "Person",
                name: "Shain Wai Yan",
              },
            };
          })
          .filter(Boolean),
        numberOfItems: apiData.data.length,
      };
    }

    if (pathname.includes("/certificate")) {
      return {
        ...baseData,
        "@type": "CreativeWork",
        name: "Professional Certificates - Shain Wai Yan",
        description:
          "Collection of professional certifications and achievements",
        hasPart: apiData.data.map((item) => ({
          "@type": "EducationalOccupationalCredential",
          name:
            getDataFromItem(item, "Title") || getDataFromItem(item, "title"),
          description:
            getDataFromItem(item, "Description") ||
            getDataFromItem(item, "description"),
          credentialCategory:
            getDataFromItem(item, "Issuer") || getDataFromItem(item, "issuer"),
          dateCreated:
            getDataFromItem(item, "Date") || getDataFromItem(item, "date"),
        })),
      };
    }

    if (
      pathname.includes("/marketing-plan") ||
      pathname.includes("/business-plan")
    ) {
      const planType = pathname.includes("/marketing-plan")
        ? "Marketing"
        : "Business";
      return {
        ...baseData,
        "@type": "CreativeWork",
        name: `${planType} Plans Portfolio - Shain Wai Yan`,
        description: `Professional ${planType.toLowerCase()} plans and strategic documents`,
        workExample: apiData.data.map((item) => ({
          "@type": "DigitalDocument",
          name:
            getDataFromItem(item, "Title") || getDataFromItem(item, "title"),
          description:
            getDataFromItem(item, "Description") ||
            getDataFromItem(item, "description"),
          fileFormat: "application/pdf",
          encodingFormat: "application/pdf",
          author: {
            "@type": "Person",
            name: "Shain Wai Yan",
          },
        })),
      };
    }

    if (pathname.includes("/coding-project")) {
      return {
        ...baseData,
        "@type": "CreativeWork",
        name: "Coding Projects Portfolio - Shain Wai Yan",
        description: "Software development projects and programming portfolio",
        workExample: apiData.data.map((item) => ({
          "@type": "SoftwareApplication",
          name:
            getDataFromItem(item, "Title") || getDataFromItem(item, "title"),
          description:
            getDataFromItem(item, "Description") ||
            getDataFromItem(item, "description"),
          programmingLanguage:
            getDataFromItem(item, "Technologies") ||
            getDataFromItem(item, "technologies"),
          codeRepository:
            getDataFromItem(item, "GithubUrl") ||
            getDataFromItem(item, "githubUrl"),
          url:
            getDataFromItem(item, "DemoUrl") ||
            getDataFromItem(item, "demoUrl"),
          author: {
            "@type": "Person",
            name: "Shain Wai Yan",
          },
        })),
      };
    }

    if (pathname.includes("/blog")) {
      return {
        ...baseData,
        "@type": "Blog",
        name: "Blog - Shain Wai Yan",
        description: "Insights on marketing, programming, and creative design",
        blogPost: apiData.data.map((item) => {
          // Enhanced blog post structured data
          const title =
            getDataFromItem(item, "Title") || getDataFromItem(item, "title");
          const excerpt =
            getDataFromItem(item, "excerpt") ||
            getDataFromItem(item, "Excerpt") ||
            getDataFromItem(item, "description");
          const publishedAt =
            getDataFromItem(item, "publishDate") ||
            getDataFromItem(item, "publishedAt") ||
            getDataFromItem(item, "PublishedAt");
          const slug =
            getDataFromItem(item, "slug") || getDataFromItem(item, "Slug");
          const featuredImage =
            getImageUrl(item, "featuredImage") ||
            getImageUrl(item, "FeaturedImage");

          return {
            "@type": "BlogPosting",
            headline: title,
            description: excerpt,
            datePublished: publishedAt,
            url: slug ? `${url.origin}/blog/${slug}` : url.href,
            image: featuredImage,
            author: {
              "@type": "Person",
              name: "Shain Wai Yan",
            },
            publisher: {
              "@type": "Organization",
              name: "Shain Wai Yan Digital Studio",
            },
          };
        }),
      };
    }

    return baseData;
  } catch (error) {
    logError(error, "generateEnhancedStructuredData", { pathname });
    return null;
  }
}

/**
 * Enhanced social meta tags with preservation
 */
function addEnhancedSocialMetaTags(html, pathname, apiData, url) {
  try {
    // Don't replace existing meta tags
    if (
      html.includes('property="og:title"') ||
      html.includes('name="twitter:card"')
    ) {
      return html;
    }

    const title =
      getDataFromItem(apiData?.data, "Title") ||
      getDataFromItem(apiData?.data, "title") ||
      "Shain Wai Yan - Professional Portfolio";

    const description =
      getDataFromItem(apiData?.data, "Description") ||
      getDataFromItem(apiData?.data, "description") ||
      "Marketing, Programming, and Creative Design Portfolio";

    const image =
      getImageUrl(apiData?.data) ||
      "https://shainwaiyan.com/default-og-image.jpg";

    // Enhanced meta tags with additional properties
    const metaTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url.href}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="Shain Wai Yan Portfolio">
    <meta property="og:locale" content="${
      pathname.startsWith("/zh/") ? "zh_CN" : "en_US"
    }">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url.href}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    `;

    html = html.replace(/<\/head>/, `${metaTags}</head>`);
    return html;
  } catch (error) {
    logError(error, "addEnhancedSocialMetaTags", { pathname });
    return html;
  }
}

/**
 * Add preconnect hints for performance
 */
function addPreconnectHints(html) {
  const preconnectHints = `
    <link rel="preconnect" href="${PRIMARY_STRAPI}" crossorigin>
    <link rel="preconnect" href="${BACKUP_STRAPI}" crossorigin>
    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
  `;

  return html.replace(/<\/head>/, `${preconnectHints}</head>`);
}

/**
 * Enhanced pre-render metadata
 */
function addPreRenderMetadata(html) {
  try {
    const timestamp = new Date().toISOString();
    const preRenderComment = `<!-- Pre-rendered for search engines at ${timestamp} by Enhanced Bot Rendering Worker v6.0.0 -->`;

    // Add comment at the beginning of head
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>\n    ${preRenderComment}`);
    }

    // Add meta tag at the end of head
    const metaTag = `<meta name="rendering-info" content="pre-rendered-for-bots" data-timestamp="${Date.now()}" data-version="6.0.0" data-features="enhanced-security,performance-monitoring,error-tracking">`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `  ${metaTag}\n</head>`);
    }

    return html;
  } catch (error) {
    logError(error, "addPreRenderMetadata");
    return html;
  }
}

// ======================================================================
// ENHANCED CACHE MANAGEMENT
// ======================================================================

/**
 * Enhanced cache key generation with locale support
 */
function generateBotCacheKey(url) {
  const locale = url.pathname.startsWith("/zh/") ? "zh" : "en";
  const baseUrl = "https://cache.shainwaiyan.com";
  const queryString = url.search || "";
  return `${baseUrl}/bot-render/${locale}${url.pathname}${queryString}?v=${CACHE_CONFIG.invalidationToken}`;
}

/**
 * Enhanced template cache key with locale
 */
function generateTemplateCacheKey(normalizedPath) {
  const locale = normalizedPath.startsWith("/zh/") ? "zh" : "en";
  const baseUrl = "https://cache.shainwaiyan.com";
  return `${baseUrl}/template/${locale}${normalizedPath}?v=${CACHE_CONFIG.invalidationToken}`;
}

/**
 * Enhanced cache checking with size limits
 */
async function checkBotCache(cacheKey) {
  try {
    const cache = caches.default;
    const response = await cache.match(cacheKey);

    if (response) {
      const contentLength = response.headers.get("content-length");
      if (
        contentLength &&
        parseInt(contentLength) > CACHE_CONFIG.maxCacheSize
      ) {
        // Remove oversized cache entries
        await cache.delete(cacheKey);
        return null;
      }
    }

    return response;
  } catch (error) {
    logError(error, "checkBotCache", { cacheKey });
    return null;
  }
}

/**
 * Enhanced template caching with compression
 */
async function cacheTemplate(cacheKey, html) {
  try {
    const cache = caches.default;
    const response = new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_CONFIG.templateTtl}`,
        "Content-Encoding": "gzip",
      },
    });
    await cache.put(cacheKey, response);
  } catch (error) {
    logError(error, "cacheTemplate", { cacheKey });
  }
}

/**
 * Enhanced bot response caching with metadata
 */
async function cacheBotRenderedResponse(cacheKey, response) {
  try {
    const cache = caches.default;
    const clonedResponse = response.clone();

    // Add cache metadata
    const headers = new Headers(clonedResponse.headers);
    headers.set("X-Cache-Timestamp", Date.now().toString());
    headers.set("X-Cache-Version", "6.0.0");

    const cachedResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers,
    });

    await cache.put(cacheKey, cachedResponse);
  } catch (error) {
    logError(error, "cacheBotRenderedResponse", { cacheKey });
  }
}

// ======================================================================
// ENHANCED MAIN REQUEST HANDLER
// ======================================================================

/**
 * Enhanced bot detection with additional patterns
 */
/**
 * Enhanced bot detection with caching and performance optimization
 */
const botDetectionCache = new Map();
const BOT_PATTERNS_SET = new Set(BOT_CONFIG.botPatterns);

function isBotUserAgent(userAgent) {
  if (!userAgent) return false;

  // Check cache first
  if (botDetectionCache.has(userAgent)) {
    return botDetectionCache.get(userAgent);
  }

  const lowerUA = userAgent.toLowerCase();

  // Fast exact match check
  if (BOT_PATTERNS_SET.has(lowerUA)) {
    botDetectionCache.set(userAgent, true);
    return true;
  }

  // Pattern matching for partial matches
  const isBot = Array.from(BOT_PATTERNS_SET).some((pattern) =>
    lowerUA.includes(pattern)
  );

  // Additional heuristic checks
  const heuristicBot =
    isBot ||
    /bot|crawler|spider|scraper|fetcher|validator|checker/i.test(userAgent) ||
    /curl|wget|python|java|go-http|okhttp/i.test(userAgent) ||
    userAgent.length < 10 || // Suspiciously short UA
    !/mozilla/i.test(userAgent); // Most real browsers include Mozilla

  // Cache result (limit cache size)
  if (botDetectionCache.size > 1000) {
    const firstKey = botDetectionCache.keys().next().value;
    botDetectionCache.delete(firstKey);
  }

  botDetectionCache.set(userAgent, heuristicBot);
  return heuristicBot;
}

/**
 * Enhanced path validation
 */
function shouldRenderForBot(pathname) {
  return BOT_CONFIG.renderablePaths.some((path) => {
    if (path === pathname) return true;
    if (path === pathname + "/" || path + "/" === pathname) return true;
    if (pathname.startsWith("/blog/") && path === "/blog") return true;
    if (pathname.startsWith("/zh/blog/") && path === "/zh/blog") return true;
    if (pathname.endsWith(".html")) {
      const pathWithoutHtml = pathname.slice(0, -5);
      if (path === pathWithoutHtml) return true;
    }
    return false;
  });
}

/**
 * Enhanced bot rendering with comprehensive optimizations
 */
async function renderForBot(request, url, env, ctx) {
  const renderStart = Date.now();
  const requestId = generateNonce().substring(0, 8);
  const userAgent = request.headers.get("User-Agent") || "";

  try {
    console.log(
      `🤖 [${requestId}] Enhanced bot rendering started for: ${url.pathname}`
    );

    const pathname = url.pathname;
    const normalizedPath = pathname.endsWith(".html")
      ? pathname.slice(0, -5)
      : pathname;

    // Enhanced cache checking with compression
    const botCacheKey = generateBotCacheKey(url);
    const cachedResponse = await checkBotCache(botCacheKey);

    if (cachedResponse) {
      console.log(`📦 [${requestId}] Cache hit for bot render`);
      enhancedMetrics.seoMetrics.cacheHitRate =
        enhancedMetrics.seoMetrics.cacheHitRate * 0.9 + 1 * 0.1;

      // Track cache hit
      await trackEnhancedPerformance({
        operation: "bot_render_cached",
        renderTime: Date.now() - renderStart,
        path: pathname,
        cacheStatus: "hit",
        requestId,
      });

      return cachedResponse;
    }

    enhancedMetrics.seoMetrics.cacheHitRate =
      enhancedMetrics.seoMetrics.cacheHitRate * 0.9;

    // Fetch API data with enhanced error handling
    const apiEndpoints = BOT_CONFIG.pathToApiMap[normalizedPath] || [];
    let apiDataResults = [];

    if (apiEndpoints.length > 0) {
      console.log(
        `📡 [${requestId}] Fetching API data from ${apiEndpoints.length} endpoints`
      );
      const apiStart = Date.now();
      apiDataResults = await fetchAndValidateApiData(apiEndpoints, env, ctx);

      enhancedMetrics.apiMetrics.avgApiResponseTime = Date.now() - apiStart;
      enhancedMetrics.apiMetrics.dataFreshness = Date.now();
    }

    // Get HTML template with mobile optimization
    let html = await getHTMLTemplate(request, normalizedPath);
    if (!html) {
      console.error(`❌ [${requestId}] Failed to get HTML template`);
      return null;
    }

    // Enhanced HTML processing pipeline
    console.log(
      `🔧 [${requestId}] Processing HTML with enhanced optimizations...`
    );

    // 1. Inject content first
    html = await injectContentSafely(html, apiDataResults, normalizedPath);

    // 2. Add SEO enhancements without modifying existing meta tags
    html = addSEOEnhancements(html, url, apiDataResults[0]);

    // 3. Add pre-render metadata
    html = addPreRenderMetadata(html);

    // Skip these steps that might be causing issues:
    // - Skip component hydration if it's causing problems
    // - Skip sanitization since we fixed it to be less aggressive
    // - Skip performance optimizations that might strip content
    // - Skip mobile optimizations that might interfere
    // - Skip compression that might corrupt content

    console.log(
      `✅ [${requestId}] HTML processing completed - simplified pipeline`
    );

    // Generate enhanced security headers
    const nonce = generateNonce();
    const cspHeader = generateCSPHeader(nonce);
    const renderTime = Date.now() - renderStart;

    const response = new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Rendered-For": "bot",
        "X-Rendering-Time": new Date().toISOString(),
        "X-Request-ID": requestId,
        "X-Performance-Score": calculatePerformanceScore(
          renderTime,
          html.length
        ).toString(),
        "Cache-Control": `public, max-age=${CACHE_CONFIG.botRenderedTtl}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`,
        "Content-Security-Policy": cspHeader,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        ...ENHANCED_SECURITY.advancedHeaders,
      },
    });

    // Enhanced caching with compression
    await cacheBotRenderedResponse(botCacheKey, response.clone());

    console.log(
      `✅ [${requestId}] Enhanced bot render completed in ${renderTime}ms`
    );

    // Track enhanced performance metrics
    enhancedMetrics.seoMetrics.avgResponseTime = renderTime;
    await trackEnhancedPerformance({
      operation: "bot_render",
      renderTime,
      path: pathname,
      success: true,
      cacheStatus: "miss",
      requestId,
      htmlSize: html.length,
      apiCalls: apiEndpoints.length,
      userAgent: userAgent.substring(0, 100),
      url: url.href,
    });

    return response;
  } catch (error) {
    const renderTime = Date.now() - renderStart;
    console.error(`❌ [${requestId}] Error in enhanced renderForBot:`, error);

    enhancedMetrics.seoMetrics.errorRate =
      enhancedMetrics.seoMetrics.errorRate * 0.9 + 1 * 0.1;

    await logError(error, "renderForBot_enhanced", {
      url: url.href,
      userAgent: userAgent.substring(0, 200),
      renderTime,
      requestId,
    });

    await trackEnhancedPerformance({
      operation: "bot_render",
      renderTime,
      path: url.pathname,
      success: false,
      error: error.message,
      requestId,
    });

    return null;
  }
}

/**
 * Calculate performance score based on render time and size
 */
function calculatePerformanceScore(renderTime, htmlSize) {
  const timeScore = Math.max(0, 100 - renderTime / 100);
  const sizeScore = Math.max(0, 100 - htmlSize / 1000);
  return Math.round((timeScore + sizeScore) / 2);
}

/**
 * Enhanced SEO optimizations
 */
function addEnhancedSEOOptimizations(html, url, apiData, userAgent) {
  try {
    // Add existing SEO enhancements
    html = addSEOEnhancements(html, url, apiData);

    // Add Core Web Vitals optimization
    html = addCoreWebVitalsOptimization(html);

    return html;
  } catch (error) {
    logError(error, "addEnhancedSEOOptimizations");
    return html;
  }
}

/**
 * Core Web Vitals optimization
 */
function addCoreWebVitalsOptimization(html) {
  const optimizations = `
    <link rel="preload" as="style" href="/styles/critical.css">
    <link rel="preload" as="font" href="/fonts/main.woff2" type="font/woff2" crossorigin>
  `;
  return html.replace("</head>", `${optimizations}</head>`);
}

/**
 * Simple HTML compression
 */
async function compressHtml(html) {
  return html
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<");
}

/**
 * Enhanced HTML template fetching
 */
async function getHTMLTemplate(request, normalizedPath) {
  try {
    const templateCacheKey = generateTemplateCacheKey(normalizedPath);
    let html = await getCachedTemplate(templateCacheKey);

    if (html) {
      console.log("📦 Using cached HTML template");
      return html;
    }

    console.log("🌐 Fetching fresh HTML template");
    const pageResponse = await fetchWithTimeout(
      request.url,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SEO-Bot-Worker/6.0.0)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          "Cache-Control": "no-cache",
        },
      },
      TIMEOUT_MS
    );

    if (!pageResponse.ok) {
      console.error(`❌ Failed to fetch page: ${pageResponse.status}`);
      return null;
    }

    html = await pageResponse.text();
    await cacheTemplate(templateCacheKey, html);
    console.log("💾 HTML template cached");
    return html;
  } catch (error) {
    logError(error, "getHTMLTemplate", { normalizedPath });
    return null;
  }
}

/**
 * Enhanced cached template retrieval
 */
async function getCachedTemplate(cacheKey) {
  try {
    const cache = caches.default;
    const response = await cache.match(cacheKey);
    return response ? await response.text() : null;
  } catch (error) {
    logError(error, "getCachedTemplate", { cacheKey });
    return null;
  }
}

/**
 * Enhanced health check with detailed metrics
 */
async function handleHealthCheck() {
  const healthData = {
    timestamp: new Date().toISOString(),
    version: "6.0.0",
    status: "healthy",
    uptime: Date.now() - performanceMetrics.lastReset,
    botDetection: {
      enabled: BOT_CONFIG.enabled,
      patterns: BOT_CONFIG.botPatterns.length,
      renderablePaths: BOT_CONFIG.renderablePaths.length,
    },
    cache: {
      botRenderedTtl: CACHE_CONFIG.botRenderedTtl,
      templateTtl: CACHE_CONFIG.templateTtl,
      invalidationToken: CACHE_CONFIG.invalidationToken,
      maxCacheSize: CACHE_CONFIG.maxCacheSize,
    },
    performance: {
      ...performanceMetrics,
      errorsByType: Object.fromEntries(performanceMetrics.errorsByType),
      averageRenderingTime: Math.round(performanceMetrics.averageRenderingTime),
    },
    security: {
      sanitizeHtml: SECURITY_CONFIG.sanitizeHtml,
      cspEnabled: true,
      allowedTags: SECURITY_CONFIG.allowedTags.length,
    },
    features: {
      pdfSupport: true,
      cloudinaryTransformation: true,
      universalDataExtraction: true,
      strapiV4AndV5Support: true,
      enhancedErrorHandling: true,
      performanceMonitoring: true,
      securityHeaders: true,
      structuredData: true,
      socialMetaTags: true,
      multiLanguageSupport: true,
    },
    servers: {
      primary: {
        url: PRIMARY_STRAPI,
        healthy: performanceMetrics.primaryServerHealth,
        lastCheck: new Date().toISOString(),
      },
      backup: {
        url: BACKUP_STRAPI,
        healthy: performanceMetrics.backupServerHealth,
        lastCheck: new Date().toISOString(),
      },
    },
    analytics: {
      enabled: ANALYTICS_CONFIG.enabled,
      sampleRate: ANALYTICS_CONFIG.sampleRate,
    },
  };

  return new Response(JSON.stringify(healthData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * Enhanced file size formatting
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

// ======================================================================
// ENHANCED DYNAMIC COMPONENTS CONFIGURATION
// ======================================================================

const DYNAMIC_COMPONENTS = {
  photography: {
    init: "window.initMasonry && window.initMasonry()",
    fallback: `<noscript><style>.masonry-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}</style></noscript>`,
    hydrationStrategy: "visible",
  },
  certificate: {
    init: "window.initCarousel && window.initCarousel()",
    fallback: `<noscript><style>.certificate-carousel{display:block!important}.carousel-item{display:block!important;margin-bottom:2rem}</style></noscript>`,
    hydrationStrategy: "idle",
  },
  "business-plan": {
    init: "window.initPDFViewer && window.initPDFViewer()",
    fallback: `<noscript><div class="pdf-static-links"></div></noscript>`,
    hydrationStrategy: "immediate",
  },
  "marketing-plan": {
    init: "window.initPDFViewer && window.initPDFViewer()",
    fallback: `<noscript><div class="pdf-static-links"></div></noscript>`,
    hydrationStrategy: "immediate",
  },
  "coding-project": {
    init: "window.initProjects && window.initProjects()",
    fallback: `<noscript><style>.project-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}</style></noscript>`,
    hydrationStrategy: "idle",
  },
  "amv-editing": {
    init: "window.initVideoGallery && window.initVideoGallery()",
    fallback: `<noscript><style>.video-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}</style></noscript>`,
    hydrationStrategy: "idle",
  },
};

// ======================================================================
// CLOUDFLARE WORKER EXPORT
// ======================================================================

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const requestId = generateNonce().substring(0, 8);

    try {
      const url = new URL(request.url);

      // Handle health check
      if (url.pathname === "/bot-health") {
        return handleHealthCheck();
      }
      if (url.pathname.startsWith("/api/github/")) {
        console.log(`🔍 GitHub API request detected: ${url.pathname}`);
        const githubResponse = await handleGitHubAPI(request, env, ctx);
        if (githubResponse) {
          return githubResponse;
        }
      }
      // Enhanced bot detection
      const userAgent = request.headers.get("User-Agent") || "";
      const isBot = BOT_CONFIG.enabled && isBotUserAgent(userAgent);

      console.log(
        `🔍 [${requestId}] Request: ${
          url.pathname
        } | User-Agent: ${userAgent.substring(0, 50)}... | Is Bot: ${isBot}`
      );

      // Track request metrics
      performanceMetrics.requestsPerMinute++;

      if (
        isBot &&
        request.method === "GET" &&
        shouldRenderForBot(url.pathname)
      ) {
        const renderedResponse = await renderForBot(request, url, env, ctx);

        if (renderedResponse) {
          // Add request tracking headers
          const headers = new Headers(renderedResponse.headers);
          headers.set("X-Request-ID", requestId);
          headers.set("X-Processing-Time", `${Date.now() - startTime}ms`);

          return new Response(renderedResponse.body, {
            status: renderedResponse.status,
            statusText: renderedResponse.statusText,
            headers: headers,
          });
        }
      }

      // Pass through to origin for non-bot requests or fallback
      const response = await fetch(request);

      // Track successful passthrough
      await trackPerformance({
        operation: "passthrough",
        duration: Date.now() - startTime,
        path: url.pathname,
        success: response.ok,
        requestId,
      });

      return response;
    } catch (error) {
      console.error(`💥 [${requestId}] Critical error in worker:`, error);

      await logError(error, "worker_main", {
        url: request.url,
        userAgent: request.headers.get("User-Agent"),
        requestId,
        processingTime: Date.now() - startTime,
      });

      return new Response("Service temporarily unavailable", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
          "Retry-After": "60",
          "X-Request-ID": requestId,
          "X-Error": "worker_error",
        },
      });
    }
  },

  async scheduled(event, env, ctx) {
    try {
      console.log("⏰ Running scheduled tasks...");

      // Reset performance metrics periodically
      if (Date.now() - performanceMetrics.lastReset > 3600000) {
        // 1 hour
        performanceMetrics.lastReset = Date.now();
        performanceMetrics.requestsPerMinute = 0;
        performanceMetrics.errorsByType.clear();
        performanceMetrics.renderingTimes = [];
      }

      // Pre-warm critical pages with enhanced strategy
      const criticalPaths = [
        "/",
        "/about",
        "/portfolio",
        "/photography",
        "/marketing-plan",
        "/business-plan",
        "/coding-project",
        "/zh",
        "/zh/about",
        "/zh/portfolio",
      ];
      const baseUrl = "https://www.shainwaiyan.com";

      const preWarmPromises = criticalPaths.map(async (path) => {
        try {
          const response = await fetchWithTimeout(
            `${baseUrl}${path}`,
            {
              headers: {
                "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
            },
            15000
          );

          if (response.ok) {
            console.log(`✅ Pre-cached: ${path}`);
            return { path, success: true };
          } else {
            console.log(`⚠️ Pre-cache warning for ${path}: ${response.status}`);
            return { path, success: false, status: response.status };
          }
        } catch (error) {
          console.log(`❌ Failed to pre-cache ${path}: ${error.message}`);
          return { path, success: false, error: error.message };
        }
      });

      const results = await Promise.all(preWarmPromises);
      const successCount = results.filter((r) => r.success).length;

      console.log(
        `✅ Scheduled tasks completed: ${successCount}/${results.length} pages pre-cached`
      );

      // Track scheduled task performance
      await trackPerformance({
        operation: "scheduled_prewarm",
        successRate: successCount / results.length,
        totalPaths: results.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("❌ Error in scheduled tasks:", error.message);
      await logError(error, "scheduled_tasks");
    }
  },
};
