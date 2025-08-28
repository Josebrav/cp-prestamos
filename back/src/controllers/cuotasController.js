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
    const { montoPagado, fechaPago, interesPagado, quitaAplicada } = req.body;

    const cuota = await Cuota.findByPk(id, { include: [Prestamo] });
    if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });

    // monto a cobrar: si hay montoConInteres lo usamos, si no monto base
    let montoActualizado = cuota.montoConInteres || cuota.monto;

    let intereses = 0;
    if (cuota.estado === "vencida") {
      intereses = montoActualizado - cuota.monto;
      if (montoPagado < intereses) {
        return res.status(400).json({ error: `Debe abonar al menos los intereses: $${intereses}` });
      }
    }

    // 🔹 Pago final: si pago >= montoActualizado o si hay quita aplicada, marcamos como pagada
    const pagoFinal = montoPagado >= montoActualizado || quitaAplicada;

    if (pagoFinal) {
      cuota.estado = "pagada";
      cuota.montoConInteres = 0;
      cuota.montoPagado = montoPagado;
      cuota.fechaPago = fechaPago || new Date().toISOString().split("T")[0];
      cuota.interesPagado = cuota.estado === "vencida" ? intereses : 0;

      await cuota.save();
      return res.json({ message: "Cuota pagada correctamente", cuota });
    }

    // Pago parcial vencida
    if (montoPagado < montoActualizado && cuota.estado === "vencida") {
      cuota.montoConInteres = montoActualizado - montoPagado;
      cuota.montoPagado = montoPagado;
      await cuota.save();
      return res.json({ message: "Pago parcial registrado (cuota vencida)", cuota });
    }

    // Pago parcial al día (sin quita)
    if (montoPagado < montoActualizado && cuota.estado === "al dia") {
      cuota.montoConInteres = montoActualizado - montoPagado;
      cuota.montoPagado = montoPagado;
      await cuota.save();
      return res.json({ message: "Pago parcial registrado (cuota al día)", cuota });
    }

    // Última defensa (seguridad)
    cuota.estado = "pagada";
    cuota.montoConInteres = 0;
    cuota.montoPagado = montoPagado;
    cuota.fechaPago = fechaPago || new Date().toISOString().split("T")[0];
    cuota.interesPagado = cuota.estado === "vencida" ? intereses : 0;

    await cuota.save();
    res.json({ message: "Cuota pagada correctamente", cuota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};




module.exports = { getCuotaById, pagarCuota };
