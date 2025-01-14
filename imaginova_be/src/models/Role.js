import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const role = sequelize.define('role', {
    role_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false
    }
  })

  return role
}