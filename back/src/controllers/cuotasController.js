const { Cuota, Prestamo, User } = require("../database");
const { Op } = require("sequelize");

// Trae datos de una cuota
const getCuotaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cuota = await Cuota.findByPk(id, {
      include: [
        { model: Prestamo, 
          include: [
            { model: User },
            { model: Cuota, as: "cuotas" }, 
      ]
    }
  ]
  });
    if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });
    res.json(cuota);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cuota" });
  }
};

// Registrar pago de una cuota (parcial o total)
const pagarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { montoPagado } = req.body;

    const cuota = await Cuota.findByPk(id, { include: [Prestamo] });
    if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });

    let montoActualizado = cuota.montoConInteres || cuota.monto;

    if (cuota.estado === "vencida") {
      const intereses = montoActualizado - cuota.monto;
      if (montoPagado < intereses) {
        return res.status(400).json({ error: `Debe abonar al menos los intereses: $${intereses}` });
      }
    }

    // Pago parcial
    if (montoPagado < montoActualizado) {
      cuota.montoConInteres = montoActualizado - montoPagado;
      await cuota.save();
      return res.json({ message: "Pago parcial registrado", cuota });
    }

    // Pago total
    cuota.estado = "pagada";
    cuota.montoConInteres = 0;
    await cuota.save();

    res.json({ message: "Cuota pagada correctamente", cuota });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};

module.exports = { getCuotaById, pagarCuota };
