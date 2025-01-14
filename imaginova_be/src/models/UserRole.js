import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const user_role = sequelize.define('user_role', {
    user_role_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    role: {
      type: DataTypes.BIGINT
    },
    imaginova_user: {
      type: DataTypes.BIGINT
    }
  })

  return user_role
}