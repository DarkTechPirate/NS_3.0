const cron = require('node-cron');
const { runMatchEngine, MATCH_CONFIG } = require('../services/matchEngine');

/**
 * Initializes the automated matching worker.
 */
const initMatchWorker = () => {
  // Test mode: rotate every minute. You can override with MATCH_WORKER_CRON.
  const cronExpression = process.env.MATCH_WORKER_CRON || '* * * * *';
  const visibleLimitLabel = MATCH_CONFIG.MAX_VISIBLE_MATCHES > 0 ? MATCH_CONFIG.MAX_VISIBLE_MATCHES : 'all';

  cron.schedule(cronExpression, async () => {
    console.log('[Cron] Starting rotating matching engine run...');
    try {
      await runMatchEngine();
    } catch (err) {
      console.error('[Cron] Matching engine failed:', err);
    }
  });

  console.log(
    `[Cron] Matching worker initialized (${cronExpression}). Top ${visibleLimitLabel}, no-repeat ${MATCH_CONFIG.NO_REPEAT_DAYS} days, refresh ${MATCH_CONFIG.ROTATION_MINUTES} minute(s).`
  );
};

module.exports = { initMatchWorker };
