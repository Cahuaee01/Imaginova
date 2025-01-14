import db from "../config/database.js";
import { generateChallenge } from "../config/ai.js";
import logger from "../config/logger.js";
import dotenv from 'dotenv';

dotenv.config();

export class ChallengeGenerator {

    // Usato per generare e salvare nel db 3 challenge giornaliere
    static async generateAndSaveTodaysChallengeSuggestions() {
        try {
            const date = new Date();
            const currentMonthIndex = date.getMonth();
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const currentMonthName = months[currentMonthIndex];
            const currentDay = date.getDate();

            logger.info(`Starting challenge generation for ${currentDay} ${currentMonthName}.`);

            // Genera la matrice delle possibili sfide giornaliere
            const matrix = await generateChallenge(currentMonthName, currentDay);
            logger.info(`Generated challenge matrix: ${JSON.stringify(matrix)}`);

            // Le inserisco nel database
            for (const row of matrix) {
                const [themeEvent, description] = row;

                await db.challenge.create({
                    theme_event: themeEvent,
                    description: description,
                    definitive: false,
                    challenge_date: date.setHours(process.env.CHALLENGE_UPLOAD_TIME, 0, 0, 0), //alle 12
                    media_type: null, //quando il media type è null non è specificato quale tipo di media la challenge propone 
                });
            }

            logger.info("Challenges created successfully and response sent.");
        } catch (error) {
            logger.error(`Error while generating and saving challenges: ${error.message}`, { stack: error.stack });
        }
    }

    // Metodo per eseguire il daily job
    static async runDailyJob() {
        try {
            await this.generateAndSaveTodaysChallengeSuggestions();
        } catch (error) {
            logger.error(`Error during daily job execution: ${error.message}`, { stack: error.stack });
        }
    }
}
