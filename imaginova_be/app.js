import express from "express";
import morgan from "morgan"; 
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import './src/jobs/scheduler.js';
import { start } from './server.js';
import logger from "./src/config/logger.js";
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Ottiene il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routers imports
import { userRouter } from "./src/routes/userRouter.js";
import { challengeRouter } from "./src/routes/challengeRouter.js";

// Configurazione servizio Email
import { EmailService } from "./src/config/email.js";

EmailService.initialize({
  host: process.env.SMTP_HOST,
  port: 587,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
});

// Start app
const app = express();

app.use(cors({
  origin: 'http://localhost:4200', // Consenti solo richieste da questa origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Consenti metodi specifici
  credentials: true // Consenti cookie e credenziali
}));

app.options('*', cors()); // App accessibile ovunque

// Logging delle richieste http
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
})); 

// Fa il parsing delle ichieste con carico JSON
app.use(express.json());

// Gestore degli errori
app.use( (err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    code: err.status || 500,
    description: err.message || "An error occurred"
  });
});

// Caricamento di un file
app.use(fileUpload({
  createParentPath: true,
  tempFileDir : './uploads/'	
}));

// Serve i file dalla cartella uploads
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Genera specifiche OpenAPI 
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Imaginova',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*Router.js'], 
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Definisce le routes
app.use(userRouter);
app.use(challengeRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Imaginova application." });
})

export default app;

start();
