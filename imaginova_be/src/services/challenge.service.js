import db from "../config/database.js";
import { Op } from 'sequelize';
import logger from "../config/logger.js";
import dotenv from 'dotenv';

dotenv.config();

//status code legenda 
    // SUCCESS: 1
    // ERROR: 0

export class ChallengeService {

    // Usato per recuperare la challenge giornaliera
    static async getCurrentChallenge() {
        const now = new Date();
    
        // Calcola le 12pm del giorno corrente
        const noonToday = new Date(now.setHours(now.getHours() + 1));
        noonToday.setHours(process.env.CHALLENGE_UPLOAD_TIME, 0, 0, 0); 
    
        let targetDate;
        if (now.getHours() < noonToday.getHours()) {
            // Se siamo prima delle 12pm, usa il giorno precedente
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() - 1);
        } else {
            // Altrimenti usa il giorno corrente
            targetDate = new Date(now);
        }
    
        // Recupera la sfida del giorno target
        const challenge = await db.challenge.findOne({
            where: {
                definitive: true,
                [Op.and]: [
                    db.sequelize.where(
                        db.sequelize.cast(db.sequelize.col('challenge_date'), 'DATE'),
                        targetDate.toISOString().split('T')[0] // Confronta solo YYYY-MM-DD
                    ),
                ],
            },
        });     
    
        if (challenge) {
            logger.info(`Challenge for ${targetDate.toDateString()}: ${challenge.description}`);
            return { challenge, code: 1, message: `Found challenge for ${targetDate.toDateString()}.` };
        } else {
            return { code: 0, message: "No challenge available for the target date." };
        }
    }    

    // Usato per prelevare le challenges degli ultimi due mesi, a meno di filtri settati per date specifiche
    static async getChallenges(limit, page, sortBy, order, startDate, endDate) {
        try {
            // Validazione dei parametri
            const validSortFields = ["id", "date", "engaging"];
            if (!validSortFields.includes(sortBy)) {
                return { code: 0, message: "Invalid sort field." };
            }
    
            if (!["asc", "desc"].includes(order.toLowerCase())) {
                return { code: 0, message: "Invalid order value." };
            }
    
            const whereConditions = {};
    
            // Controlla che endDate sia maggiore o uguale a startDate
            if (startDate && endDate) {
                const start = `${startDate}T00:00:00.000Z`;
                const end = `${endDate}T23:59:59.999Z`;
    
                if (new Date(end) < new Date(start)) {
                    return { code: 0, message: "End date must be greater than or equal to start date." };
                }
    
                whereConditions.challenge_date = {
                    [Op.between]: [start, end],
                };
            } else {
                const currentDate = new Date();
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
    
                whereConditions.challenge_date = {
                    [Op.between]: [twoMonthsAgo, currentDate],
                };
            }
    
            // Cerca solo le challenge che sono definitive
            whereConditions.definitive = true;
    
            // Calcola l'offset
            const offset = (page - 1) * limit;
    
            // Determinazione del campo di ordinamento
            let orderField;
            if (sortBy === "date") {
                orderField = "challenge_date";
            } else if (sortBy === "id") {
                orderField = "challenge_id";
            } else if (sortBy === "engaging") {
                orderField = db.sequelize.literal(`(
                    SELECT COUNT(*) 
                    FROM imaginova.creation AS c 
                    WHERE c.challenge = challenge.challenge_id
                )`);
            }
    
            // Query principale per recuperare le sfide
            const challenges = await db.challenge.findAll({
                where: whereConditions,
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: {
                    include: [
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.creation AS c 
                                WHERE c.challenge = challenge.challenge_id
                            )`),
                            'creationsCount',
                        ],
                    ],
                },
                having: db.sequelize.literal(`(
                    SELECT COUNT(*) 
                    FROM imaginova.creation AS c
                    WHERE c.challenge = challenge.challenge_id
                ) > 0`),
                group: ['challenge.challenge_id'],
                order: [
                    [orderField, order.toUpperCase()],
                ],
            });
    
            // Calcolo del numero totale di sfide disponibili
            const totalChallenges = await db.challenge.findAll({
                where: whereConditions,
                attributes: {
                    include: [
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.creation AS c 
                                WHERE c.challenge = challenge.challenge_id
                            )`),
                            'creationsCount',
                        ],
                    ],
                },
                having: db.sequelize.literal(`(
                    SELECT COUNT(*) 
                    FROM imaginova.creation AS c
                    WHERE c.challenge = challenge.challenge_id
                ) > 0`),
                group: ['challenge.challenge_id'],
            });
    
             // Calcolo del numero totale di pagine
            const totalPages = Math.ceil(totalChallenges.length / limit);

            // Determina se esiste una pagina successiva
            const hasNextPage = page < totalPages;

            if (challenges.length > 0) {
                return {
                    code: 1,
                    message: "Challenges successfully retrieved.",
                    challenges: challenges,
                    hasNextPage: hasNextPage,
                    totalPages: totalPages, 
                };
            } else {
                return { code: 0, message: "No challenges available." };
            }
        } catch (error) {
            logger.error(`Error during challenges retrieval: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }    
    
    // Usato per prelevare una challenge dato il suo id
    static async getChallenge(challenge_id){
        try{
            const challenge = await db.challenge.findOne({
                where: {challenge_id: challenge_id}
            });

            if(challenge){
                return { code: 1, message: "Challenge succesfully retrieved.", challenge: challenge }
            } else {
                return { code: 0, message: "No challenge found." }
            }

        } catch (error) {
            logger.error(`Error during specific challenge retrieval: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
    
}
