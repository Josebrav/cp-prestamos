// src/database/models/TasaConfig.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TasaConfig = sequelize.define('TasaConfig', {
    tipo: {
      type: DataTypes.ENUM('normal', 'veraz1', 'veraz2'),
      primaryKey: true,
    },
    tasaAnual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'TasaConfig',
  });

  return TasaConfig;
};
