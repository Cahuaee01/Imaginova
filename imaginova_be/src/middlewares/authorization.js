import { UserService } from "../services/user.service.js";

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']; // Preleva l'header authoization
    const token = authHeader && authHeader.split(' ')[1]; // Separa il token dal bearer

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not provided" });
    }

    const decodedToken = await UserService.verifyAndDecodeToken(token); // Verifica e decodifica del token

    if(decodedToken.code === 0){
      return res.status(403).json({ message: "Unauthorized: Invalid token" });
    }

    const userIdFromToken = decodedToken.user_id; // Prelevo id utente dal token

    // Confronta user_id del token con i dati della richiesta
    const userIdFromRequest = req.params.imaginova_user;

    if (userIdFromRequest && userIdFromRequest !== userIdFromToken) {
      return res.status(403).json({ message: "Forbidden: User ID does not match token" });
    }

    req.imaginova_user = userIdFromToken; // Aggiunge dati utente alla richiesta
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Token scaduto
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      // Token non valido
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    // Errore sconosciuto
    return res.status(500).json({ message: "Server error: Unable to verify token" });
  }
}

