import { ChallengeController } from "../controllers/ChallengeController.js";
import { CreationController } from "../controllers/CreationController.js";
import { authenticateToken } from "../middlewares/authorization.js";
import express from "express";

export const challengeRouter = express.Router(); 

// Route per prelevare la challenge giornaliera
challengeRouter.get("/challenge/current", ChallengeController.getCurrentChallenge);

// Route per prelevare le sfide
//esempi
// Recupera 10 challenge degli ultimi due mesi ordinate per ID in ordine crescente: GET /challenge?limit=10&page=1&sortBy=id&order=asc
// Recupera 10 challenge comprese tra il 10-12-2024 e il 23-12-2024 ordinate per data in ordine crescente: GET /challenge?limit=10&page=1&sortBy=date&order=asc&startDate=2024-12-10&endDate=2024-12-23
challengeRouter.get("/challenge", authenticateToken, ChallengeController.getChallenges);

// Route per prelevare una specifica challenge
challengeRouter.get("/challenge/:challenge_id", authenticateToken, ChallengeController.getChallengeByPk);

// Route per postare la creazione relativa ad una challenge con eventuale media
challengeRouter.post("/challenge/:challenge_id/creation", authenticateToken, CreationController.postUserCreation);

// Route per controllare se un utente ha partecipato o meno ad una challenge
challengeRouter.get("/challenge/:challenge_id/creation/:user_id", authenticateToken, CreationController.checkUserParticipation);

// Route per prelevare le creazioni
//esempi
// Recupera 10 creazioni ordinate per ID in ordine crescente: GET /creation?limit=10&page=1&sortBy=id&order=asc
// Recupera 5 creazioni ordinate per votazioni positive in ordine decrescente: GET /creation?limit=5&page=2&sortBy=likes&order=desc
// Recupera 10 creazioni ordinate per data crescente: GET /creation?limit=10&page=1&sortBy=date&order=asc
challengeRouter.get("/creation", CreationController.getUsersCreations);

// Route per prelevare le creazioni di un utente
challengeRouter.get("/user/:user_id/creation", authenticateToken, CreationController.getUserCreations);

// Route per il recupero delle creazioni relative ad una challenge
challengeRouter.get("/challenge/:challenge_id/creation", CreationController.getChallengeCreations);

// Route per votare una creazione
//esempio POST /challenge/:challenge_id/creation/:creation_id/vote
challengeRouter.post("/challenge/:challenge_id/creation/:creation_id/vote", authenticateToken, CreationController.setVote);

// Route per fare il refresh dei voti di una creazione
challengeRouter.get("/challenge/:challenge_id/creation/:creation_id/vote", authenticateToken, CreationController.getVote);