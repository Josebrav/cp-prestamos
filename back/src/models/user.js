const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true,
      },
    },
    dni: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sueldo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lugarDeTrabajo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    veraz: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    situacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: false
  });

  // Asociaciones
  User.associate = (models) => {
    // Relación con préstamos
    User.hasMany(models.Prestamo, { foreignKey: 'userId' });

    // Autorrelación muchos-a-muchos para garantes
    User.belongsToMany(models.User, {
      as: 'Garantes',
      through: 'Guarantors',
      foreignKey: 'userId',
      otherKey: 'garanteId',
    });

    User.belongsToMany(models.User, {
      as: 'Avalados',
      through: 'Guarantors',
      foreignKey: 'garanteId',
      otherKey: 'userId',
    });
  };

  return User;
};
