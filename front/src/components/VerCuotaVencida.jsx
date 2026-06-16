import {
  Box,
  Text,
  Input,
  Button,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { numeroALetras } from "../utils/numerosALetras";

const API_BASE = "http://192.168.1.48:3001";

export default function VerCuotaVencida() {
  const { id } = useParams();

  const [cuota, setCuota] = useState(null);
  const [loading, setLoading] = useState(true);

  const [montoRecibido, setMontoRecibido] = useState("");
  const [montoCalculado, setMontoCalculado] = useState(0);
  const [montoEnLetras, setMontoEnLetras] = useState("");

  const val = (x) => {
    if (!x) return 0;
    const n = Number(String(x).replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  // 🔹 Fetch cuota
  useEffect(() => {
    axios
      .get(`${API_BASE}/cuotas/${id}`)
      .then((res) => {
        setCuota(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // 🔹 Calcular deuda real (SIEMPRE con intereses)
  useEffect(() => {
    if (!cuota) return;

    const deuda = val(cuota.montoConInteres) || val(cuota.monto);
    const yaPagado = val(cuota.montoPagado);

    let restante = deuda - yaPagado;
    if (restante < 0) restante = 0;

    setMontoCalculado(restante);

    if (!montoRecibido) {
      setMontoRecibido(restante.toFixed(2));
    }
  }, [cuota]);

  // 🔹 Monto a mostrar
  const displayAmount = useMemo(() => {
    return val(montoRecibido) || montoCalculado;
  }, [montoRecibido, montoCalculado]);

  // 🔹 Letras
  useEffect(() => {
    setMontoEnLetras(numeroALetras(displayAmount));
  }, [displayAmount]);

  // 🔴 HANDLE PAGO CORREGIDO
  const handlePago = async () => {
    if (!cuota) return;

    const pago = val(montoRecibido);
    const hoyISO = new Date().toLocaleDateString("sv-SE");

    const deudaActual = val(cuota.montoConInteres) || val(cuota.monto);
    const yaPagado = val(cuota.montoPagado);
    const totalPagado = yaPagado + pago;

    // 🔹 Interés mínimo (lo vencido menos capital)
    const interesMinimo = Math.max(
      0,
      val(cuota.montoConInteres) - val(cuota.monto)
    );

    // ❌ VALIDACIÓN
    if (pago < interesMinimo) {
      return alert("❌ Debe cubrir al menos los intereses");
    }

    const estaPagada = totalPagado >= deudaActual;

    try {
      await axios.post(`${API_BASE}/cuotas/${id}/pago`, {
        montoPagado: pago,
        fechaPago: hoyISO,
        interesPagado: interesMinimo,
        registrarPagoCuota: true,
      });

      alert("✅ Pago registrado");

      setCuota((prev) => {
  const pagosActualizados = [
    ...(prev.PagoCuota || []),
    { monto: pago }
  ];

  const totalPagadoNuevo = pagosActualizados.reduce(
    (acc, p) => acc + val(p.monto),
    0
  );

  const deudaRestante = montoCalculado - pago;

  return {
    ...prev,
    PagoCuota: pagosActualizados,
    montoPagado: totalPagadoNuevo,
    estado: deudaRestante <= 0 ? "pagada" : "pendiente", // ✅ clave
    numeroControl: numeroControlUsado,
  };
});

      setMontoRecibido("");

    } catch (err) {
      console.error(err);
      alert("Error en pago");
    }
  };

  if (loading) return <Spinner size="xl" />;

  const prestamo = cuota?.Prestamo || {};
  const cliente = prestamo?.User || {};

  const hoy = new Date();
  const fechaString = `${hoy.getDate()}-${hoy.getMonth() + 1}-${hoy.getFullYear()}`;

  return (
    <Box bg="white">
      {/* 🔴 PANEL SUPERIOR */}
      {cuota.estado !== "pagada" && (
        <Flex bg="red.600" color="white" p={3} gap={4}>
          <Input
            type="number"
            value={montoRecibido}
            onChange={(e) =>
              setMontoRecibido(e.target.value.replace(",", "."))
            }
            placeholder="Monto recibido"
            w="200px"
          />

          <Text fontWeight="bold">
            ⚠ Cuota vencida - debe cubrir intereses
          </Text>
        </Flex>
      )}

      {/* 🔹 BOLETA */}
      <Box p={6}>
        <Text><b>Cliente:</b> {cliente.name} {cliente.surname}</Text>
        <Text><b>Cuota:</b> {cuota.numeroCuota}</Text>
        <Text><b>Fecha:</b> {fechaString}</Text>

        <Text mt={4}><b>Monto restante:</b> ${montoCalculado}</Text>
        <Text><b>Monto a pagar:</b> ${displayAmount}</Text>
        <Text><b>En letras:</b> {montoEnLetras}</Text>
      </Box>

      {/* 🔹 BOTONES */}
      <Flex p={4} gap={3}>
        {cuota.estado !== "pagada" && (
          <Button colorScheme="green" onClick={handlePago}>
            Registrar Pago
          </Button>
        )}

        <Button colorScheme="blue" onClick={() => window.print()}>
          Imprimir
        </Button>
      </Flex>
    </Box>
  );
}