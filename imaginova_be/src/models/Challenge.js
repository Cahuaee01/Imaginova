import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const challenge = sequelize.define('challenge', {
    challenge_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,  
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    definitive: {
      type: DataTypes.BOOLEAN
    },
    theme_event: {
      type: DataTypes.TEXT
    },
    challenge_date: {
      type: DataTypes.DATE
    },
    media_type: {
      type: DataTypes.BIGINT
    }
  })

  challenge.associate = (models) => {
    challenge.hasMany(models.creation, {
        foreignKey: 'challenge',
        as: 'creations',
    });
  };

  return challenge
}