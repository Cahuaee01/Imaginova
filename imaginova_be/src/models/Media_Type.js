import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const media_type = sequelize.define('media_type', {
    media_type_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    media_type_name: {
      type: DataTypes.ENUM('photo', 'text'),
      allowNull: false
    }
  })

  return media_type
}