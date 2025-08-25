// src/database/models/TasaConfig.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuitaCuotas = sequelize.define('QuitaCuotas', {
    tipo: {
      type: DataTypes.ENUM('tipo1', 'tipo2'), // dos tipos posibles
      allowNull: false,
      unique: true,  // para que no haya duplicados
    },
    porcentaje: {
      type: DataTypes.FLOAT, // porcentaje como número decimal
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      defaultValue: 2
    },
  }, {
    timestamps: false,
    tableName: 'quitas_cuotas', // opcional: nombre de la tabla
  });

  return QuitaCuotas;
};
