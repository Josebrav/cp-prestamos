const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PagoCuota = sequelize.define('PagoCuota', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cuotaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    fechaPago: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });

  PagoCuota.associate = (models) => {
    PagoCuota.belongsTo(models.Cuota, { foreignKey: 'cuotaId' });
  };

  return PagoCuota;
};