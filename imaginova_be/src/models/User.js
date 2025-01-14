import { DataTypes } from "sequelize";

export default (sequelize) => {
  const imaginova_user = sequelize.define('imaginova_user', {
    imaginova_user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  imaginova_user.associate = (models) => {
    imaginova_user.hasMany(models.creation, {
      foreignKey: 'imaginova_user',
      as: 'creations',
    });
  };  

  return imaginova_user;
};