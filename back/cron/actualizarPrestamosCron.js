// cron/actualizarPrestamosCron.js
const cron = require('node-cron');
const { actualizarPrestamosVencidos } = require('../src/controllers/calcularCuota');

// 🔹 Ejecutar al iniciar la app
(async () => {
  const cantidad = await actualizarPrestamosVencidos();
  console.log(`🚀 Inicio: Se actualizaron ${cantidad} préstamos vencidos.`);
})();

// 🔹 Programar ejecución cada 1 hora
cron.schedule('0 * * * *', async () => {
  const cantidad = await actualizarPrestamosVencidos();
  console.log(`🔁 Cron: Se actualizaron ${cantidad} préstamos vencidos.`);
}, {
  timezone: 'America/Argentina/Buenos_Aires'
});