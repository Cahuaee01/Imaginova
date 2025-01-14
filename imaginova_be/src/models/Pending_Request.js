import { DataTypes } from "sequelize";

export default (sequelize, Sequelize) => {
  const pending_request = sequelize.define('pending_request', {
    pending_request_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiration: {
        type: DataTypes.DATE,
        allowNull: false
    }
  });

  return pending_request
}