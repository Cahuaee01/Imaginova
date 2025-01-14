import db from "../config/database.js";
import crypto from "crypto"; //utilizzato per generare l'otp e criptare la password
import logger from "../config/logger.js";
import { Op } from "sequelize";
import { emailTemplates, EmailService } from "../config/email.js";
import { Regex } from "../config/regex.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

//status code legenda 
    // SUCCESS: 1
    // ERROR: 0

export class UserService{
    /************************************************************** RESET PASSWORD **************************************************************/
    // Controlla se l'email è già presente in db
    static async checkEmail(email) {
        try {
            const user = await db.imaginova_user.findOne({
                where: { email },
            });

            if (user) {
                return {code: 1, message: "Email exists inside db"};
            }
            return {code: 0, message: "Email not found"}; 
        } catch (error) {
            logger.error(`Error during email research: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    // Controlla se c'è già una richiesta di reset password
    static async checkIfPending(email) {
        try {
            const pending_req = await db.pending_request.findOne({
                where: { email },
            });
    
            const now = new Date();
    
            if (pending_req) {
                const expiration = new Date(pending_req.expiration);
    
                if (expiration > now) {
                    // La richiesta è ancora valida, non consentire una nuova richiesta
                    return { code: 0, message: "A reset request is already pending for this email." };
                } else {
                    // La richiesta è scaduta, quindi può essere sovrascritta
                    await db.pending_request.destroy({ where: { email } });
                    return { code: 1, message: "A reset request had expired for this email. New reset request initialized" };
                }
            }
            // Nessuna richiesta esistente
            return { code: 1, message: "A reset request doesn't exist for this email." };
        } catch (error) {
            logger.error(`Error during pending request check: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
    

    // Creazione dell' OTP, ritorna l'otp
    static async createOTPforSpecificEmail(email) {
        const otp = crypto.randomBytes(2).toString("hex");

        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 2);
    
        await db.pending_request.create({
            email,
            otp,
            expiration,
        });
    
        return { otp, code: 1, message: "Otp created" };
    }    

    // Crea ed invia l'email con rimpiazzo del placeholder otp
    static async createAndSendEmail(email, otp){
        const template = emailTemplates.resetPassword;
        const messageText = template.text.replace("{{otp}}", otp);
        const messageHtml = template.html.replace("{{otp}}", otp);

        logger.info(`Preparing to send email to: ${email}`);
        logger.info(`Email content: SUBJECT=${template.subject}, TEXT=${messageText}, HTML=${messageHtml}`);

        await EmailService.sendMail({
            to: email,
            subject: template.subject,
            text: messageText,
            html: messageHtml,
        });

        return {code: 1, message: "Email created and sent with otp."};
    }

    // Richiesta del reset della password
    static async resetPassword(email){
        try{
            const user = await this.checkEmail(email);
            if (user.code !== 1) {
                return { code: 0, message: user.message }
            }

            const pendingRequest = await this.checkIfPending(email);
            if (pendingRequest.code !== 1) {
                return { code: 0, message: pendingRequest.message }
            }

            const otp_object = await this.createOTPforSpecificEmail(email);
            if(otp_object.code !== 1){
                return { code: 0, message: "Error while creating otp." }
            }

            const email_sent = await this.createAndSendEmail(email, otp_object.otp);
            if(email_sent.code !== 1){
                return { code: 0, message: email_sent.message }
            }
            
            return {code: 1, message: "Reset request created and email sent"}
        } catch (error) {
            logger.error(`Error during password reset request: ${error.message}`, { stack: error.stack });
            throw new Error("An internal server error occurred during password reset request.");
        }
        
    }

    /************************************************************** OTP VALIDATION AND PASSWORD RESET SAVE **************************************************************/
    
    // Verifica dell'otp, in caso positivo restituisce la mail di chi ha quell'otp
    static async otpVerify(otp){
        const request = await db.pending_request.findOne({
            where: { otp }
        });

        if(request){
            return { email: request.email, code: 1, message: "Otp is verified and user can reset password."}
        }
        return { code: 0, message: "Otp is not verified or user has not requested a password reset."}
    }

    // Salva la nuova password nel db a patto che il codice otp sia valido e che l'utente esista, poi rimuove la pending request
    static async saveNewPassword(email, password, otp) {
        try {
            const otp_verified = await UserService.otpVerify(otp);
    
            if (!otp_verified) {
                return { code: 0, message: "OTP is not valid anymore." };
            }
    
            const user = await db.imaginova_user.findOne({
                where: { email }
            });
    
            if (!user) {
                return { code: 0, message: "User not found." };
            }
    
            const hashedPassword = await this.hashPassword(password);
    
            const updatedUser = await db.imaginova_user.update(
                { password: hashedPassword },
                { where: { email } }
            );
    
            if (!updatedUser) { 
                return { code: 0, message: "Password not modified." };
            }
    
            const remove_pending_request = await db.pending_request.destroy({
                where: { email }
            });
    
            if (!remove_pending_request) {
                return { code: 0, message: "Pending request not removed." };
            }
    
            return {
                code: 1,
                message: "OTP is verified, pending request has been removed, and password has been updated."
            };
        } catch (error) {
            logger.error(`Error during saveNewPassword: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
    

    // Inserisce la nuova password nel db, a patto che rispetti la regex
    static async insertNewPassword(email, password, otp){
        try{
            if (!Regex.passwordRegex.test(password)) {
                return {
                code: 0,
                message:
                    "Invalid password. It must be 8-16 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                };
            }

            const savePassword = await this.saveNewPassword(email, password, otp);

            if(savePassword.code != 1){
                return { code: 0, message: savePassword.message }
            }

            return { code: 1, message: "Otp is verified and password has been saved."}
        } catch (error) {
            logger.error(`Error during new password reset: ${error.message}`, { stack: error.stack });
            throw new Error("An internal server error occurred during new password reset.");
        }
    }

    /************************************************************** SIGN UP **************************************************************/
    // Hash della password;
    static async hashPassword(password) {
        const hash = crypto.pbkdf2Sync(password, process.env.FIXED_SALT, 1000, 64, 'sha512').toString('hex');
        return hash;
    }

    // Validazione credenziali
    static async checkCredentials(user) {
        try {
            const { username, email, password1, password2 } = user;

            if (!Regex.emailRegex.test(email)) {
                return { code: 0, message: "Invalid email format." };
            }

            if (!Regex.usernameRegex.test(username)) {
                return {
                code: 0,
                message: "Invalid username. It must be 3-20 characters, alphanumeric, and can include underscores.",
                };
            }

            if (!Regex.passwordRegex.test(password1)) {
                return {
                code: 0,
                message:
                    "Invalid password. It must be 8-16 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                };
            }

            if (password1 !== password2) {
                return { code: 0, message: "Passwords do not match." };
            }

            // Controlla l'unicità di email e username nel database
            const existingUser = await db.imaginova_user.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });

            if (existingUser) {
                return { code: 0, message: "The email or username is already taken." };
            }

            // Tutte le validazioni sono passate
            return { code: 1, message: "Credentials are valid." };
        } catch (error) {
            logger.error(`Error during validation: ${error.message}`, { stack: error.stack });
            throw new Error("An internal server error occurred during validation.");
        }
    }

    // Registra un nuovo utente nel db
    static async register(username, email, password1, password2){
        try {
            const validation = await this.checkCredentials({ username, email, password1, password2 });
      
            if (validation.code != 1) {
                return { code: 0, message: validation.message }
            }
      
            // Crittografa la password
            const hashedPassword = await this.hashPassword(password1);
      
            // Salva il nuovo utente nel database
            const user = await db.imaginova_user.create({
                username,
                email,
                password: hashedPassword,
            });

            // Imposta il ruolo ad utente
            const role = await db.user_role.create({
                role: 1, // Utente
                imaginova_user: user.imaginova_user_id
            });

            if(!role){
                return { code: 0, message: "Problems with user role."}
            }
      
            return { code: 1, message: "User registered successfully!" }
          } catch (error) {
            logger.error(`Error during registration: ${error.message}`, { stack: error.stack });
            throw new Error("An internal server error occurred during registration.");
          }
    }

    /************************************************************** LOG IN **************************************************************/

    // Controlla se l'utente esiste e se la password è valida e restituisce il token jwt
    static async login(email, password){  
        try { 
            const user = await db.imaginova_user.findOne({ where: { email} }); 
    
            if (!user) { 
                return { code: 0, message: "User is not registered."}         
            } 

            const hash = await this.hashPassword(password);
    
            if (hash !== user.password) {
                return { code: 0, message: "Password is not valid." };
            }
    
            const token = jwt.sign( 
                { user_id: user.imaginova_user_id, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' } 
            ); 
            return { token, user_id: user.imaginova_user_id , code: 1, message: "Token succesfully created."}; 
    
        } catch (error) { 
           logger.error(`Error during login: ${error.message}`, { stack: error.stack });
           throw error; 
        } 
    }

    // Verifica la validità del token e restituisce l'user_id
    static async verifyAndDecodeToken(token) {
        if (token) {
          try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
            if (!decodedToken.user_id) {
              return { code: 0, message: "Token does not contain a valid user_id." };
            }
      
            return { 
              code: 1, 
              message: "Token is valid.", 
              user_id: decodedToken.user_id 
            };
          } catch (error) {
            if (error.name === 'TokenExpiredError') {
              return { code: 0, message: "Token has expired." };
            }
            return { code: 0, message: "Error during token validation." };
          }
        }
        return { code: 0, message: "Token is invalid." };
    }   
      
    // Preleva l'owner della creazione dall'id della creazione
    static async getOwner(creation_id) {
        const creation = await db.creation.findOne({
            where: {creation_id}
        });

        const user = await db.imaginova_user.findOne({
            where: { imaginova_user_id: creation.imaginova_user }
        })

        if(user){
            return { code: 1, message: "Owner found.", user: user }
        } else {
            return { code: 0, message: "Owner not found." }
        }
    }

    // Info del profilo utente
    static async getProfile(user_id) {
        try {
            // Verifica se l'utente esiste
            const user = await db.imaginova_user.findOne({
                where: { imaginova_user_id: user_id }
            });
    
            if (!user) {
                return { code: 0, message: "User not found." };
            }
    
            // Conta il numero totale di creazioni dell'utente
            const totalCreations = await db.creation.count({
                where: { imaginova_user: user_id }
            });
    
            // Recupera i dati delle creazioni
            const creationData = await db.creation.findAll({
                where: { imaginova_user: user_id },
                attributes: {
                    include: [
                        // Somma dei voti positivi
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM imaginova.feedback AS f 
                                WHERE f.creation = creation.creation_id AND f.feedback_value = TRUE
                            )`),
                            'positiveVotes'
                        ],
                        // Somma dei voti negativi
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
                order: [['creation_date', 'ASC']], // Ordina per data crescente (prima creazione)
                raw: true
            });
    
            // Calcolo del numero totale di likes ricevuti
            const totalLikes = creationData.reduce((sum, creation) => {
                return sum + parseInt(creation.positiveVotes || 0, 10);
            }, 0);
    
            // Determina la creazione con il massimo numero di voti positivi
            let bestCreation = null;
            let maxLikes = 0;
    
            creationData.forEach((creation) => {
                const likes = parseInt(creation.positiveVotes || 0, 10);
                if (likes > maxLikes) {
                    maxLikes = likes;
                    bestCreation = creation;
                }
            });
    
            // Estrae la data della prima creazione
            const firstCreationDate = creationData.length > 0 ? creationData[0].creation_date : null;
    
            return {
                code: 1,
                message: "User found.",
                user,
                stats: {
                    totalLikes,
                    totalCreations,
                    bestCreation: bestCreation
                        ? {
                            creationId: bestCreation.creation_id,
                            positiveVotes: bestCreation.positiveVotes
                        }
                        : null,
                    firstCreationDate  
                }
            };
        } catch (error) {
            logger.error(`Error during getProfile: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }    
}