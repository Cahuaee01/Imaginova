// database.js
import imaginova_user from "../models/User.js";
import creation from "../models/Creation.js";
import role from "../models/Role.js"
import user_role from "../models/UserRole.js";
import challenge from "../models/Challenge.js";
import pending_request from "../models/Pending_Request.js";
import media_type from "../models/Media_Type.js";
import storage_type from "../models/Storage_Type.js";
import feedback from "../models/Feedback.js";
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  schema: 'imaginova',
  define: {
    timestamps: false,
    freezeTableName: true,
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.imaginova_user = imaginova_user(sequelize); // Usa direttamente l'importazione
db.creation = creation(sequelize);
db.role = role(sequelize);
db.user_role = user_role(sequelize);
db.challenge = challenge(sequelize);
db.pending_request = pending_request(sequelize);
db.media_type = media_type(sequelize);
db.storage_type = storage_type(sequelize);
db.feedback = feedback(sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
