import logger from "../config/logger.js";
import { CreationService } from "../services/creation.service.js";

export class CreationController {

    //usato per salvare la creazione a db e per determinare il path dell'eventuale media caricato
    static async postUserCreation(req, res) {    
        try {    
            const { title, description, imaginova_user, media_type, storage_type } = req.body;
    
            //preleva il file da req.files, se presente
            const file = req.files?.file || null;
    
            const challenge = req.params.challenge_id;
    
            //passa i dati al servizio per postare la creazione
            const postedCreation = await CreationService.postCreation(
                title,
                description,
                imaginova_user,
                challenge,
                media_type,
                storage_type,
                file
            );
    
            if (postedCreation.code === 1) {
                return res.status(201).json({ message: postedCreation.message });
            } else {
                return res.status(500).json({ message: postedCreation.message });
            }
        } catch (error) {
            return res.status(500).json({ message: "An error occurred during creation upload.", error: error.message });
        }
    }      
    

    //usato per controllare se un utente hagià partecipato alla challenge giornaliera
    static async checkUserParticipation(req, res) {
        const userId = req.params.user_id;

        const challengeId = req.params.challenge_id;

        try {
            const participation = await CreationService.hasUserParticipated(userId, challengeId);

            if(participation.alreadyParticipated === false){
                return res.status(200).json({ message: "User has not participated."});
            } else {
                return res.status(200).json({ alreadyParticipated: true , message: "User has already participated."});
            }
        } catch (error) {
            res.status(500).json({ message: "Error checking participation", error: error.message });
        }
    }

    //usato per mostrare creazioni nel db
    static async getUsersCreations(req, res) {
        const { limit, page, sortBy, order } = req.query;

        try {
            const creations = await CreationService.getUsersCreations(limit,page,sortBy,order);

            if(creations){
                return res.status(200).json({creations: creations.data, message: "Creations loaded.", hasNextPage: creations.hasNextPage })
            } else {
                return res.status(500).json({ message: creations.message })
            }
        } catch (error) {
            res.status(500).json({ message: "Error during creations retrieval ", error: error.message })
        }
    } 

    static async getUserCreations(req, res) {
        const { limit, page, sortBy, order, media } = req.query;

        const user_id = req.params.user_id;

        try {
            const creations = await CreationService.getUserCreations(limit,page,sortBy,order,media,user_id);

            if(creations){
                return res.status(200).json({creations: creations.data, message: "Creations loaded.", hasNextPage: creations.hasNextPage })
            } else {
                return res.status(500).json({ message: creations.message })
            }
        } catch (error) {
            res.status(500).json({ message: "Error during creations retrieval ", error: error.message })
        }
    }

    //usato per mostrare creazioni relative ad una challenge
    static async getChallengeCreations(req,res) {
        const { limit, page, sortBy, order, media } = req.query;

        const challenge_id = req.params.challenge_id;

        try {
            const creations = await CreationService.getUsersCreations(limit,page,sortBy,order,challenge_id, media);

            if(creations){
                return res.status(200).json({creations: creations, message: "Creations loaded."})
            } else {
                return res.status(500).json({ message: creations.message })
            }
        } catch (error) {
            res.status(500).json({ message: "Error during creations retrieval ", error: error.message })
        }
    }

    //usato per impostare un voto
    static async setVote(req,res) { // /challenge/:challenge_id/creation/:creation_id/vote
        const user_id = req.query.imaginova_user;

        const creation_id = req.params.creation_id;

        const vote_type = req.body.vote_type;

        try {
            const vote = await CreationService.setVote(user_id, creation_id, vote_type);

            if(vote){
                return res.status(200).json({ message: vote.message, positiveVotes: vote.positiveVotes, negativeVotes: vote.negativeVotes, voteStatus: vote.voteStatus })
            } else {
                return res.status(500).json({ message: vote.message })
            }
        } catch (error) {
            res.status(500).json({ message: "Error during vote setting ", error: error.message })
        }
    }

    static async getVote(req,res){
        const creation_id = req.params.creation_id;

        try {
            const vote = await CreationService.getVote(creation_id);

            if(vote){
                return res.status(200).json({ message: vote.message, positiveVotes: vote.positiveVotes, negativeVotes: vote.negativeVotes, who_voted: vote.who_voted })
            } else {
                return res.status(500).json({ message: vote.message })
            }
        } catch (error) {
            res.status(500).json({ message: "Error during vote get ", error: error.message })
        }
    }
}
