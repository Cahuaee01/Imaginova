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

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// routers imports
import { userRouter } from "./src/routes/userRouter.js";
import { challengeRouter } from "./src/routes/challengeRouter.js";

import { EmailService } from "./src/config/email.js";

EmailService.initialize({
  host: process.env.SMTP_HOST,
  port: 587,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
});

// start app
const app = express();

//API will be accessible from anywhere.
app.use(cors({
  origin: 'http://localhost:4200', // Consenti solo richieste da questa origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Consenti metodi specifici
  credentials: true // Consenti cookie e credenziali
}));

app.options('*', cors());

//logging http requests
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
})); 

// Parse incoming requests with a JSON payload
app.use(express.json());

//error handler
app.use( (err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    code: err.status || 500,
    description: err.message || "An error occurred"
  });
});

//uploading of a file
app.use(fileUpload({
  createParentPath: true,
  tempFileDir : './uploads/'	
}));

// Servi i file dalla cartella uploads
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

//generate OpenAPI spec and show swagger ui
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Imaginova',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*Router.js'], // files containing annotations
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//define routes
app.use(userRouter);
app.use(challengeRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Imaginova application." });
})

export default app;

start();
