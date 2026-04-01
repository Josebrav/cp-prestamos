const { Prestamo,Cuota,User } = require('../database');

const { Op } = require("sequelize");

const getRestante = async (req, res) => {
  try {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    // Traemos préstamos con cuotas desde mañana
    const prestamos = await Prestamo.findAll({
      include: [
        {
          model: Cuota,
          as: "cuotas",
          where: {
            fechaVencimiento: {
              [Op.gte]: manana.toISOString().split("T")[0], // cuotas desde mañana
            },
            estado: {
              [Op.ne]: "pagada", // solo cuotas pendientes
            },  
          },
          required: true, // 👈 evita traer préstamos sin cuotas futuras
        },
        {
          model: User,
          attributes: ["name", "surname", "dni"], // solo nombre y apellido
        },
      ],
    });

    // Formatear resultado
    const resultado = prestamos.map((prestamo) => {
      const cuotasRestantes = prestamo.cuotas.length;
      const montoRestante = prestamo.cuotas.reduce(
        (acc, cuota) => acc + parseFloat(cuota.montoConInteres || cuota.monto),
        0
      );

      return {
        numeroControl: prestamo.numeroControl,
        estado: prestamo.estado,
        cuotasRestantes,
        montoRestante: montoRestante.toFixed(2),
        cliente: `${prestamo.User?.name || ""} ${prestamo.User?.surname || ""}`,
        dni: prestamo.User?.dni || "-", 
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error en reporte restante-futuro:", error);
    res.status(500).json({ error: "Error al generar reporte restante a futuro" });
  }
}
module.exports= getRestante;