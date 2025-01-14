import cron from 'node-cron';
import { ChallengeGenerator } from './challengeGeneration.js';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Pianifica il job per mezzanotte ogni giorno
cron.schedule(process.env.CHALLENGE_CREATION_SCHEDULING, async () => {
    try {
        logger.info('Starting daily challenge generation job.');
        await ChallengeGenerator.runDailyJob();
        logger.info('Daily challenge generation job completed successfully.');
    } catch (error) {
        logger.error(`Error during daily job execution: ${error.message}`, { stack: error.stack });
    }
});

// Schedulazione per il test ogni 3 minuti
// cron.schedule(process.env.CHALLENGE_CREATION_SCHEDULING_TEST, async () => {
//     try {
//         logger.info('Starting test job...');
//         await ChallengeGenerator.runDailyJob();
//         logger.info('Test job completed successfully.');
//     } catch (error) {
//         logger.error(`Error during test job execution: ${error.message}`, { stack: error.stack });
//     }
// });
