const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cuota = sequelize.define('Cuota', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prestamoId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    numeroCuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      numeroControl: {             // <-- Nuevo campo
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    fechaVencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    montoConInteres: {    // <-- Nuevo campo
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    estado: {
      type: DataTypes.ENUM('al dia', 'vencida', 'pagada'),
      defaultValue: 'al dia',
    },
    fechaPago: {
  type: DataTypes.DATEONLY,
  allowNull: true,
  defaultValue: null,
},
interesPagado: {
  type: DataTypes.DECIMAL(10,2),
  allowNull: true,
  defaultValue: 0,
},
montoPagado: {    // <-- Nuevo campo
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
  }, {
    timestamps: true,
  });

  Cuota.associate = (models) => {
    Cuota.belongsTo(models.Prestamo, { foreignKey: 'prestamoId' });
  };

  return Cuota;
};
