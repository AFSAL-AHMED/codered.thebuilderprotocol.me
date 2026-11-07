export const brokenConfig = `// ═══════════════════════════════════════════
// PRODUCTION SERVER CONFIGURATION
// Last modified: 2024-03-15 09:14:22 UTC
// Author: deploy-bot@ci-pipeline
// ═══════════════════════════════════════════

const cluster = require('cluster');
const http = require('http');

module.exports = {
  server: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    workers: require('os').cpus().length,
  },

  database: {
    host: process.env.DB_HOST || 'db-primary.internal',
    port: 5432,
    name: 'production_main',
    pool: {
      max: 5,          // ← CRITICAL: Increase to 50+
      min: 1,
      idleTimeoutMs: 10000,
      connectionTimeoutMs: 3000,
    },
  },

  gateway: {
    upstream: {
      timeout: 3000,   // ← CRITICAL: Increase to 30000+
      retries: 1,
      keepAlive: false,
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 10000,
    },
  },

  monitoring: {
    healthCheck: '/health',
    metricsEndpoint: '/metrics',
    alertThreshold: {
      cpu: 90,
      memory: 85,
      errorRate: 5,
    },
  },
};`;

export const validationRules = {
  poolMax: { min: 25, recommended: 50 },
  gatewayTimeout: { min: 10000, recommended: 30000 },
};
