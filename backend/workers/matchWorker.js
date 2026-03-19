const cron = require('node-cron');
const { runMatchEngine } = require('../services/matchEngine');

/**
 * Initializes the automated matching worker.
 */
const initMatchWorker = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Starting daily matching engine run...');
    try {
      await runMatchEngine();
    } catch (err) {
      console.error('[Cron] Matching engine failed:', err);
    }
  });

  console.log('[Cron] Matching worker initialized and scheduled for daily runs.');
};

module.exports = { initMatchWorker };
