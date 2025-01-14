import express from "express";
import { UserController } from "../controllers/UserController.js";
import { authenticateToken } from "../middlewares/authorization.js"

export const userRouter = express.Router(); 

//route per registrare un utente
userRouter.post("/sign-up", UserController.registerUser);

//route per richiedere il reset della password
userRouter.post("/password-reset", UserController.resetRequest);

//route per la verifica dell'otp
userRouter.post("/verify-otp", UserController.verifyOtp);

//route per l'inserimento di una nuova password
userRouter.post("/insert-new-password", UserController.changePassword);

//route per effettuare il login
userRouter.post("/login", UserController.login); 

//route per la verifica della validità del JWT token
userRouter.post("/verify-JWT", UserController.verifyJWT);

//route per il retrieval delle info dell'utente per il profilo
userRouter.get("/profile/:user_id", authenticateToken, UserController.getProfile);
