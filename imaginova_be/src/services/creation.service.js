import db from "../config/database.js";
import logger from "../config/logger.js";
import dotenv from 'dotenv';

dotenv.config();

export class CreationService{

    //usato per verificare se un utente ha già partecipato ad una challenge
    static async hasUserParticipated(id_utente, id_challenge) {
        try {
            const alreadyParticipated = await db.creation.findOne({
                where: {
                    imaginova_user: id_utente,
                    challenge: id_challenge
                }
            });

            if(alreadyParticipated){
                return { alreadyParticipated: true, code: 0, message: "User has already participated." }
            } else {
                return { alreadyParticipated: false, code: 1, message: "User can participate." }
            }
        } catch (error) {
            logger.error(`Error during hasUserParticipated: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }    
    

    //usato per inserire la creazione nel db a patto che l'utente non abbia già partecipato alla sfida
    static async postCreation(titolo, descrizione, id_utente, id_challenge, tipo_media, tipo_storage, file) {
        try {

            if (titolo.length > 64) {
                return { code: 0, message: "Title exceeds the maximum length of 64 characters." };
            }
    
            if (descrizione.length > 4096) {
                return { code: 0, message: "Description exceeds the maximum length of 4096 characters." };
            }

            const creationDate = new Date();
            const hasUserParticipated = await this.hasUserParticipated(id_utente, id_challenge);
            
            //controllo se l'utente ha già partecipato
            if (hasUserParticipated.alreadyParticipated) {
                return { code: 0, message: "User has already posted today's creation." };
            }
    
            //crea il record della creazione nel database
            const newCreation = await db.creation.create({
                title: titolo,
                description: descrizione,
                creation_date: creationDate,
                imaginova_user: id_utente,
                challenge: id_challenge,
            });
    
            if (!newCreation) {
                return { code: 0, message: "Failed to create the new creation record." };
            }
    
            let mediaPath = null;
    
            //se è stato caricato un file, determina il percorso e salvalo
            if (file) {
                const fs = await import('fs'); 
                const path = await import('path');

                //genera un nome unico per il file
                const fileExtension = path.extname(file.name); //estrae l'estensione del file
                const uniqueFileName = `${newCreation.creation_id}${fileExtension}`; //nome unico con estensione

                const directory = path.join(process.env.IMAGE_FOLDER, id_challenge); //directory del tipo /uploads/challenge_id/
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }
    
                mediaPath = path.join(directory, uniqueFileName); //path del tipo /uploads/challenge_id/nome_unico.estensione
                file.mv(mediaPath, (err) => {
                    if (err) throw new Error(`Error moving file: ${err.message}`);
                });
    
                tipo_media = 2; //tipo foto
                tipo_storage = 2; //tipo filesystem
            } else {
                //se non c'è un file, usa tipi predefiniti per il testo    
                tipo_media = 1; //tipo testo
                tipo_storage = 1; //tipo database
            }
    
            //aggiorna la creazione con il percorso del media (se presente)
            await db.creation.update(
                {
                    media_path: mediaPath,
                    media_type: tipo_media,
                    storage_type: tipo_storage,
                },
                { where: { creation_id: newCreation.creation_id } }
            );
    
            return { code: 1, message: "Creation successfully uploaded." };
        } catch (error) {
            logger.error(`Error during postCreation: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }   
    
    //mostra creazioni del db
    static async getUsersCreations(limit, page, sortBy, order, challenge, media) {
        try {
            // Validazione dei parametri
            const validSortFields = ["id", "likes", "dislikes", "date"];
            if (!validSortFields.includes(sortBy)) {
                return { code: 0, message: "Invalid sort field." };
            }
    
            if (!["asc", "desc"].includes(order.toLowerCase())) {
                return { code: 0, message: "Invalid order value." };
            }

            if(!["photo", "text", "all"].includes(media.toLowerCase())) {
                return { code: 0, message: "Invalid media type." };
            }
    
            // Calcolo offset per la paginazione
            const offset = (page - 1) * limit;
    
            // Costruzione dei filtri
            const whereConditions = {};
            if (challenge) {
                whereConditions.challenge = challenge; // Ricerca per creazioni relative a una challenge specifica
            }
    
            // Filtro per media
            if (media === "text") {
                whereConditions.media_path = null; //solo testo
            } else if (media === "photo") {
                whereConditions.media_path = { [db.Sequelize.Op.ne]: null }; //solo foto
            }
    
            // Query al database per recuperare le creazioni con i filtri
            const creations = await db.creation.findAll({
                where: whereConditions,
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: {
                    include: [
                        // Somma dei voti positivi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = TRUE
                            )`),
                            'positiveVotes' // Nome alias del campo aggiunto
                        ],
                        // Somma dei voti negativi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = FALSE
                            )`),
                            'negativeVotes' // Nome alias del campo aggiunto
                        ]
                    ]
                },
                include: [
                    {
                        model: db.imaginova_user,
                        as: 'owner',
                        attributes: ['imaginova_user_id', 'username', 'email'],
                    },
                ],
                order: [
                    [
                        sortBy === "likes" // Se è ordinamento per likes ordina per positiveVotes
                            ? db.sequelize.col('positiveVotes')
                            : sortBy === "dislikes" // Se è ordinamento per dislikes ordina per negativeVotes
                            ? db.sequelize.col('negativeVotes')
                            : sortBy === "date" // Altrimenti se è per date ordina per creation_date
                            ? "creation_date"
                            : "creation_id", // Altrimenti ordina per creation_id
                        order.toUpperCase(), // Ordina asc o desc
                    ],
                ],
            });
    
            // Calcolo del numero totale di creazioni
            const totalCreations = await db.creation.findAll({
                where: whereConditions,
            });
    
            // Determina se esiste una pagina successiva
            const hasNextPage = page * limit < totalCreations.length;
    
            if (creations.length > 0) {
                return {
                    code: 1,
                    message: "Creations successfully loaded.",
                    data: creations,
                    hasNextPage: hasNextPage,
                };
            } else {
                return { code: 0, message: "No creations found." };
            }
        } catch (error) {
            logger.error(`Error during creation retrieval: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    //mostra creazioni di un utente
    static async getUserCreations(limit,page,sortBy,order,media,user_id) {
        try {
            // Validazione dei parametri
            const validSortFields = ["id", "likes", "dislikes", "date"];
            if (!validSortFields.includes(sortBy)) {
                return { code: 0, message: "Invalid sort field." };
            }
    
            if (!["asc", "desc"].includes(order.toLowerCase())) {
                return { code: 0, message: "Invalid order value." };
            }

            if(!["photo", "text", "all"].includes(media.toLowerCase())) {
                return { code: 0, message: "Invalid media type." };
            }
    
            // Calcolo offset per la paginazione
            const offset = (page - 1) * limit;
    
            // Costruzione dei filtri
            const whereConditions = {};
            whereConditions.imaginova_user = user_id;
    
            // Filtro per media
            if (media === "text") {
                whereConditions.media_path = null; //solo testo
            } else if (media === "photo") {
                whereConditions.media_path = { [db.Sequelize.Op.ne]: null }; //solo foto
            }
    
            // Query al database per recuperare le creazioni con i filtri
            const creations = await db.creation.findAll({
                where: whereConditions,
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: {
                    include: [
                        // Somma dei voti positivi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = TRUE
                            )`),
                            'positiveVotes' // Nome alias del campo aggiunto
                        ],
                        // Somma dei voti negativi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = FALSE
                            )`),
                            'negativeVotes' // Nome alias del campo aggiunto
                        ]
                    ]
                },
                include: [
                    {
                        model: db.imaginova_user,
                        as: 'owner',
                        attributes: ['imaginova_user_id', 'username', 'email'],
                    },
                    {
                        model: db.challenge,
                        as: 'relative_challenge',
                        attributes: ['challenge_id', 'theme_event', 'description', 'challenge_date'],
                    },
                ],
                order: [
                    [
                        sortBy === "likes" // Se è ordinamento per likes ordina per positiveVotes
                            ? db.sequelize.col('positiveVotes')
                            : sortBy === "dislikes" // Se è ordinamento per dislikes ordina per negativeVotes
                            ? db.sequelize.col('negativeVotes')
                            : sortBy === "date" // Altrimenti se è per date ordina per creation_date
                            ? "creation_date"
                            : "creation_id", // Altrimenti ordina per creation_id
                        order.toUpperCase(), // Ordina asc o desc
                    ],
                ],
            });
    
            // Calcolo del numero totale di creazioni
            const totalCreations = await db.creation.findAll({
                where: whereConditions,
            });
    
            // Determina se esiste una pagina successiva
            const hasNextPage = page * limit < totalCreations.length;
    
            if (creations.length > 0) {
                return {
                    code: 1,
                    message: "Creations successfully loaded.",
                    data: creations,
                    hasNextPage: hasNextPage,
                };
            } else {
                return { code: 0, message: "No creations found." };
            }
        } catch (error) {
            logger.error(`Error during user creation loading: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
    
    //vota una creazione
    static async setVote(user_id, creation_id, vote_type) {
        try {
            const validVotes = { like: true, dislike: false };
            if (!(vote_type in validVotes)) {
                return { code: 0, message: "Invalid vote type." };
            }
    
            const vote_code = validVotes[vote_type];
    
            const getVoteCounts = async (creation_id) => {
                return db.creation.findOne({
                    where: { creation_id },
                    attributes: {
                        include: [
                            [
                                db.sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM imaginova.feedback AS f
                                    WHERE f.creation = creation.creation_id AND f.feedback_value = TRUE
                                )`),
                                'positiveVotes'
                            ],
                            [
                                db.sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM imaginova.feedback AS f
                                    WHERE f.creation = creation.creation_id AND f.feedback_value = FALSE
                                )`),
                                'negativeVotes'
                            ]
                        ]
                    },
                    raw: true
                });
            };
    
            const existingVote = await db.feedback.findOne({
                where: { imaginova_user: user_id, creation: creation_id }
            });
    
            if (existingVote) {
                if (existingVote.feedback_value === vote_code) {
                    await db.feedback.destroy({
                        where: { feedback_id: existingVote.feedback_id }
                    });
    
                    const creation = await getVoteCounts(creation_id);
                    return {
                        code: 1,
                        message: "Vote successfully reset.",
                        positiveVotes: creation.positiveVotes,
                        negativeVotes: creation.negativeVotes,
                        voteStatus: "null" 
                    };
                } else {
                    await db.feedback.update(
                        { feedback_value: vote_code },
                        { where: { feedback_id: existingVote.feedback_id } }
                    );
    
                    const creation = await getVoteCounts(creation_id);
                    return {
                        code: 1,
                        message: "Vote successfully changed.",
                        positiveVotes: creation.positiveVotes,
                        negativeVotes: creation.negativeVotes,
                        voteStatus: vote_type 
                    };
                }
            }
    
            await db.feedback.create({
                feedback_value: vote_code,
                imaginova_user: user_id,
                creation: creation_id
            });
    
            const creation = await getVoteCounts(creation_id);
            return {
                code: 1,
                message: "Feedback created.",
                positiveVotes: creation.positiveVotes,
                negativeVotes: creation.negativeVotes,
                voteStatus: vote_type 
            };
        } catch (error) {
            logger.error(`Error during feedback creation: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
    
    

    static async getVote(creation_id){
        try {
            const creation = await db.creation.findOne({
                where: { creation_id: creation_id },
                attributes: {
                    include: [
                        //somma dei voti positivi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = TRUE
                            )`),
                            'positiveVotes' //nome alias del campo aggiunto
                        ],
                        //somma dei voti negativi dalla tabella feedback
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = FALSE
                            )`),
                            'negativeVotes' //nome alias del campo aggiunto
                        ]
                    ]
                },
                raw: true
            });

            if(creation){
                const who_voted = await db.feedback.findAll({
                    where: { creation: creation_id },
                    attributes: ['imaginova_user', 'feedback_value'], 
                    raw: true
                });
                return { code: 1, message: "Creation found for votes refresh.", positiveVotes: creation.positiveVotes, negativeVotes: creation.negativeVotes, who_voted: who_voted }
            } else {
                return { code: 0, message: "Creation not found for votes refresh." }
            }
        } catch (error) {
            logger.error(`Error during votes retrieval: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
}