// models/control.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Control = sequelize.define('control', {
    // PK "id" autoincremental la agrega Sequelize
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: false,
    freezeTableName: true, // la tabla se llama exactamente "control"
  });

  return Control;
};
