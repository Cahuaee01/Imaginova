import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  static transporter = null;

  //inizializzazione configurazione email
  static initialize(config) {
    this.transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: {
        user: config.user,
        pass: config.pass,
    },
    });
  }

  //invio email
  static async sendMail({ to, subject, text, html }) {
    if (!this.transporter) {
      logger.error("EmailService not initialized. Call initialize() first.");
      throw new Error("EmailService not initialized. Call initialize() first.");
    }

    try {
      const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to,
          subject,
          text,
          html, 
      });
      logger.info(`Email sent: FROM ${process.env.EMAIL_USER} TO ${to} SUBJECT ${subject}`);
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

//templates delle email
export const emailTemplates = {
  resetPassword: {
    subject: process.env.EMAIL_SUBJECT,
    text: process.env.EMAIL_TEXT,
    html: process.env.EMAIL_HTML,
  },
};
  
