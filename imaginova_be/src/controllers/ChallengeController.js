import { ChallengeService } from "../services/challenge.service.js";

export class ChallengeController{

    // Preleva la challenge quotidiana
    static async getCurrentChallenge(req,res){
        const challenge = await ChallengeService.getCurrentChallenge();

        if(challenge.code === 1){
            return res.status(201).json({ challenge: challenge.challenge, message: challenge.message });
        } else {
            return res.status(500).json({ message: challenge.message });
        }
    }

    // Preleva tutte le challenges in base ai filtri immessi
    static async getChallenges(req, res){
        const { limit, page, sortBy, order, startDate, endDate } = req.query;

        const challenges = await ChallengeService.getChallenges(limit, page, sortBy, order, startDate, endDate);

        if(challenges.code === 1){
            return res.status(201).json({ challenges: challenges.challenges, message: challenges.message, hasNextPage: challenges.hasNextPage, totalPages: challenges.totalPages });
        } else {
            return res.status(500).json({ message: challenges.message });
        }
    }

    // Preleva una specifica challenge
    static async getChallengeByPk(req, res){
        const challenge_id = req.params.challenge_id;

        const challenge = await ChallengeService.getChallenge(challenge_id);

        if(challenge.code === 1){
            return res.status(201).json({ challenge: challenge.challenge, message: challenge.message });
        } else {
            return res.status(500).json({ message: challenge.message });
        }
    }
}