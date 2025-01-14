import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const feedback = sequelize.define('feedback', {
    feedback_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    feedback_value: {
      type: DataTypes.BOOLEAN
    },
    imaginova_user: {
      type: DataTypes.BIGINT
    },
    creation: {
      type: DataTypes.BIGINT
    }
  })

  return feedback
}