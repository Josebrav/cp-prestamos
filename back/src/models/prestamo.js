const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prestamo = sequelize.define('Prestamo', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numeroControl: {             // <-- Nuevo campo
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tipoTasa: {
      type: DataTypes.ENUM('normal', 'veraz1', 'veraz2'),
      allowNull: false,
    },
    tasaMoraAnual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    montoFinal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'al dia', 'vencido', 'cancelado', 'finalizado', 'en legales'),
      defaultValue: 'pendiente',
    }
  }, {
    timestamps: true,
  });

  Prestamo.associate = (models) => {
    Prestamo.belongsTo(models.User, { foreignKey: 'userId' });
    Prestamo.hasMany(models.Cuota, { foreignKey: 'prestamoId', as: 'cuotas' });
  };

  return Prestamo;
};
