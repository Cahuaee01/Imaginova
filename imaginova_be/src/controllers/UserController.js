import { UserService } from "../services/user.service.js";
import logger from "../config/logger.js";

export class UserController{
    
    // Richiesta reset password
    static async resetRequest(req, res) {
        const { email } = req.body;
    
        const resetRequest = await UserService.resetPassword(email);

        if(resetRequest.code === 1){
            return res.status(201).json({ message: resetRequest.message });
        } else {
            return res.status(500).json({ message: resetRequest.message });
        }
    }   
    
    // Registrazione utente
    static async registerUser(req, res) {
        const { usr: username, email, pwd1: password1, pwd2: password2 } = req.body;

        const register = await UserService.register(username, email, password1, password2);

        if(register.code === 1){
            return res.status(201).json({ message: register.message });
        } else {
            return res.status(500).json({ message: register.message });
        }
    }

    // Verifica otp
    static async verifyOtp(req,res){
        const { otp } = req.body;

        const otp_verified = await UserService.otpVerify(otp);

        if(otp_verified.code === 1){
            return res.status(201).json({email: otp_verified.email, message: otp_verified.message });
        } else {
            return res.status(500).json({ message: otp_verified.message });
        }
    }

    // Salvataggio della nuova password
    static async changePassword(req, res) {
        const { email, password, otp } = req.body;

        const change = await UserService.insertNewPassword(email, password, otp);

        if(change.code === 1){
            return res.status(201).json({message: change.message });
        } else {
            return res.status(500).json({ message: change.message });
        }
    }

    // Login
    static async login(req, res) { 
        const { email, password } = req.body; 

        const isLogged = await UserService.login(email, password); 
    
        if(isLogged.code === 1){ 
                return res.status(201).json({token: isLogged.token, user_id: isLogged.user_id, message: isLogged.message }); 
        } else { 
            return res.status(500).json({ message: isLogged.message }); 
        } 
    }

    // Verifica della validità del jwt token
    static async verifyJWT(req, res){
        const { token } = req.body;

        const token_verified = await UserService.verifyJWT(token);

        if(token_verified.code === 1){
            return res.status(201).json({ message: token_verified.message });
        } else {
            return res.status(500).json({ message: token_verified.message });
        }
    }

    // Recupero delle info dell'utente per il profilo
    static async getProfile(req, res){
        const user_id = req.params.user_id;

        const profile = await UserService.getProfile(user_id);

        if(profile.code === 1){
            return res.status(201).json({ message: profile.message, user: profile.user, stats: profile.stats });
        } else {
            return res.status(500).json({ message: profile.message });
        }
    }
}