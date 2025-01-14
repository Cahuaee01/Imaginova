import app from "./app.js";
import logger from './src/config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

export const start = async () => {
  try {
    // Mette l'applicazione in ascolto sulla porta 3000 da locale e 5000 da docker
    app.listen(process.env.PORT, () => {
      logger.info(`Imaginova is starting, REST API on http://localhost:${process.env.PORT}`);
    })
  } catch (e) {
    logger.error(`Error while starting Imaginova: ${e}`);
  }
}




