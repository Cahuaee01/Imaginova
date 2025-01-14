import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const storage_type = sequelize.define('storage_type', {
    storage_type_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    storage_type_name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  })

  return storage_type
}