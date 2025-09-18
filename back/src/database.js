require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require('fs');
const path = require('path');



const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT
} = process.env;

// 🔧 Conexión local a PostgreSQL
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  logging: false, // desactiva logs de SQL en consola
  native: false   // desactiva optimizaciones nativas
});

const basename = path.basename(__filename);
const modelDefiners = [];

// Carga todos los modelos desde /models
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js')
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Inyecta sequelize en cada modelo
modelDefiners.forEach(model => model(sequelize));

// Capitaliza los nombres de los modelos
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(([modelName, model]) => [
  modelName[0].toUpperCase() + modelName.slice(1),
  model
]);
sequelize.models = Object.fromEntries(capsEntries);

// Relaciones (adaptalas a tus modelos actuales)
const { User, Prestamo, Cuota } = sequelize.models;

User.hasMany(Prestamo, { foreignKey: 'userId' });
Prestamo.belongsTo(User, { foreignKey: 'userId' });
Prestamo.hasMany(Cuota, { foreignKey: 'prestamoId', as: 'cuotas' });
Cuota.belongsTo(Prestamo, { foreignKey: 'prestamoId' }); // ❌ sin 'as'

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
