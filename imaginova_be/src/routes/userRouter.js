import express from "express";
import { UserController } from "../controllers/UserController.js";
import { authenticateToken } from "../middlewares/authorization.js"

export const userRouter = express.Router(); 

// Route per registrare un utente
userRouter.post("/sign-up", UserController.registerUser);

// Route per richiedere il reset della password
userRouter.post("/password-reset", UserController.resetRequest);

// Route per la verifica dell'otp
userRouter.post("/verify-otp", UserController.verifyOtp);

// Route per l'inserimento di una nuova password
userRouter.post("/insert-new-password", UserController.changePassword);

// Route per effettuare il login
userRouter.post("/login", UserController.login); 

// Route per la verifica della validità del JWT token
userRouter.post("/verify-JWT", UserController.verifyJWT);

// Route per il recupero delle info dell'utente per il profilo
userRouter.get("/profile/:user_id", authenticateToken, UserController.getProfile);
