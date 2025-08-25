const path = require('path');
const express = require('express');

const server = require("./src/server");
const { conn } = require('./src/database');
require('./cron/actualizarPrestamosCron');
const initializeTasas = require('../back/initializeTasas');
const {QuitaCuotas} = require ('../back/src/database')

const port = process.env.PORT || 3001;

// Servir el frontend
server.use(express.static(path.join(__dirname, 'dist')));

server.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

conn.sync({ force: false }).then(async () => {
  await initializeTasas(); // Inicializa tasas
  //await QuitaCuotas.bulkCreate([
  //{ tipo: "tipo1", porcentaje: 10 },
  //{ tipo: "tipo2", porcentaje: 20 }
//]);
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}).catch(error => console.error(error));
