import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const creation = sequelize.define('creation', {
    creation_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,  
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    media_path: {
      type: DataTypes.TEXT
    },
    creation_date: {
      type: DataTypes.DATE
    },
    imaginova_user: {
      type: DataTypes.BIGINT
    },
    challenge: {
      type: DataTypes.BIGINT
    },
    media_type: {
      type: DataTypes.BIGINT
    },
    storage_type: {
      type: DataTypes.BIGINT
    }
  })

  creation.associate = (models) => {
    creation.belongsTo(models.imaginova_user, {
      foreignKey: 'imaginova_user', 
      as: 'owner', 
    });
    creation.belongsTo(models.challenge, {
      foreignKey: 'challenge', 
      as: 'relative_challenge', 
    });
  };
  
  return creation
}