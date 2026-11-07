export const incidentLogs = [
  { time: '14:18:42', level: 'WARN', msg: 'Elevated latency detected on api-gateway' },
  { time: '14:19:01', level: 'ERROR', msg: 'Connection pool saturated - 5/5 active' },
  { time: '14:19:15', level: 'ERROR', msg: '504 Gateway Timeout spike: 340 errors/min' },
  { time: '14:19:33', level: 'FATAL', msg: 'Circuit breaker OPEN - api-gateway' },
  { time: '14:20:01', level: 'ERROR', msg: 'Cascading timeout across service mesh' },
  { time: '14:20:18', level: 'WARN', msg: 'Memory pressure increasing - 87% utilized' },
  { time: '14:20:44', level: 'ERROR', msg: 'Database connection refused - pool exhausted' },
  { time: '14:21:02', level: 'FATAL', msg: 'Production SLA breach - P1 incident declared' },
];

export const deploymentMessages = [
  { progress: 5, msg: 'Compiling configuration...' },
  { progress: 15, msg: 'Validating connection pool parameters...' },
  { progress: 25, msg: 'Running integration tests...' },
  { progress: 40, msg: 'Building container image...' },
  { progress: 55, msg: 'Pushing to container registry...' },
  { progress: 65, msg: 'Rolling deployment to prod-cluster-01...' },
  { progress: 75, msg: 'Rolling deployment to prod-cluster-02...' },
  { progress: 85, msg: 'Health checks passing...' },
  { progress: 92, msg: 'Draining old connections...' },
  { progress: 100, msg: 'Deployment complete. All nodes healthy.' },
];

export const welcomeMessages = [
  '╔══════════════════════════════════════════════════════════════╗',
  '║                  CODE RED — INCIDENT ACTIVE                 ║',
  '║                                                              ║',
  '║  SEVERITY:  P1 — CRITICAL                                    ║',
  '║  IMPACT:    87% of requests returning 504 Gateway Timeout    ║',
  '║  AFFECTED:  api-gateway, db-primary, service mesh            ║',
  '║  STARTED:   2024-03-15 14:18:42 UTC                          ║',
  '║                                                              ║',
  '║  Your mission: Diagnose the root cause and deploy a hotfix.  ║',
  '║  Type "help" to see available commands.                      ║',
  '╚══════════════════════════════════════════════════════════════╝',
];
