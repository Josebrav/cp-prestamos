// src/components/VerCuota.jsx
import {
  Box,
  Text,
  Input,
  Button,
  Select,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import Image from "@chakra-ui/react"; // si usás <Image />, importalo
// import recibo from "../assets/recibo2.jpg";
import { numeroALetras } from "../utils/numerosALetras";

const API_BASE = "http://192.168.0.115:3001";

export default function VerCuota() {
  const { id } = useParams();

  // ----- Estados principales -----
  const [cuota, setCuota] = useState(null);
  const [quitas, setQuitas] = useState([]);
  const [quitaSeleccionada, setQuitaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);

  // nControl global
  const [nControlActual, setNControlActual] = useState(null);
  const [nControlSiguiente, setNControlSiguiente] = useState(null);
  const [loadingNControl, setLoadingNControl] = useState(true);

  // Input y cálculos de monto
  const [montoRecibido, setMontoRecibido] = useState(""); // string para no romper mientras escribe
  const [montoCalculado, setMontoCalculado] = useState(0);
  const [montoEnLetras, setMontoEnLetras] = useState("");

  // helper: parsear números (acepta "123,45" y "123.45")
  const val = (x) => {
    if (x === null || x === undefined || x === "") return 0;
    const n = Number(String(x).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  // ----- Fetch cuota + quitas -----
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_BASE}/cuotas/${id}`),
      axios.get(`${API_BASE}/quitas`),
    ])
      .then(([resCuota, resQuitas]) => {
        setCuota(resCuota.data);
        setQuitas(resQuitas.data || []);
      })
      .catch((err) => {
        console.error("Error cargando datos:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ----- Fetch nControl global -----
  useEffect(() => {
  setLoadingNControl(true);
  axios
    .get(`${API_BASE}/control`)
    .then((res) => {
      const curr = Number(
        res.data?.numero ?? res.data?.numeroControl ?? 0
      );
      setNControlActual(curr);
      setNControlSiguiente(curr + 1);
    })
    .catch((err) => {
      console.error("Error al obtener nControl:", err);
    })
    .finally(() => setLoadingNControl(false));
}, []);

  // ----- Helpers de cuota -----
  const estaVencida = useMemo(() => {
    if (!cuota) return () => false;
    return () => {
      const hoy = new Date();
      const venc = new Date(cuota.fechaVencimiento);
      return new Date(hoy.toDateString()) > new Date(venc.toDateString());
    };
  }, [cuota]);

  const cuotaPagada = cuota?.estado === "pagada";

  // ----- Recalcular montoCalculado cada vez que cambian datos relevantes -----
  useEffect(() => {
    if (!cuota) return;

    const prestamo = cuota.Prestamo || {};
    const cantidadCuotas = prestamo.cuotas?.length || 1;

    // Determinar finalPorCuota (valor "base" sin mora)
    let finalPorCuota = 0;
    if (val(prestamo.montoFinal) > 0) {
      finalPorCuota = val(prestamo.montoFinal) / cantidadCuotas;
    } else if (val(cuota.monto) > 0) {
      finalPorCuota = val(cuota.monto);
    } else {
      finalPorCuota = val(prestamo.monto) / cantidadCuotas;
    }

    const capitalPorCuota = val(prestamo.monto) / cantidadCuotas;
    const interesPorCuota = finalPorCuota - capitalPorCuota;

    let monto = 0;

    if (estaVencida()) {
      // Si la cuota ya está vencida: usar montoConInteres si viene; si no, calcular mora.
      if (val(cuota.montoConInteres) > 0) {
        monto = val(cuota.montoConInteres);
      } else {
        const hoy = new Date();
        const venc = new Date(cuota.fechaVencimiento);
        const diffMs =
          new Date(hoy.toDateString()) - new Date(venc.toDateString());
        const diasAtraso = Math.max(
          0,
          Math.floor(diffMs / (1000 * 60 * 60 * 24))
        );

        const tasaAnual = val(prestamo.tasaMoraAnual) / 100; // ej. 50 => 0.5
        const tasaDiaria = tasaAnual / 365;
        const interesMora = finalPorCuota * tasaDiaria * diasAtraso;

        monto = finalPorCuota + interesMora;
      }
    } else {
      // No vencida: monto base = finalPorCuota.
      monto = finalPorCuota;
      // aplicar quita (si hay) sobre la PORCIÓN INTERÉS
      if (quitaSeleccionada) {
        const quita = quitas.find((q) => q.tipo === quitaSeleccionada);
        if (quita) {
          const porc = val(quita.porcentaje);
          const descuento = interesPorCuota * (porc / 100);
          monto = finalPorCuota - descuento;
        }
      }
    }

    const montoRounded = Math.round(monto * 100) / 100;
    setMontoCalculado(montoRounded);

    // Si no hay monto escrito a mano o se cambió la quita, sincronizamos el input
    if (!montoRecibido || quitaSeleccionada) {
      setMontoRecibido(montoRounded.toFixed(2));
    }
  }, [cuota, quitaSeleccionada]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mostrar cantidad final que se imprime / muestra:
  const displayAmount = useMemo(() => {
    if (!cuota) return 0;
    if (cuotaPagada) return val(cuota.montoPagado);
    return val(montoRecibido) > 0 ? val(montoRecibido) : montoCalculado;
  }, [cuota, cuotaPagada, montoRecibido, montoCalculado]);

  // Letras del monto
  useEffect(() => {
    setMontoEnLetras(numeroALetras(displayAmount));
  }, [displayAmount]);

  // Sincronizar input cuando llega cuota o cambia calculado
  useEffect(() => {
    if (!cuota) return;
    if (cuotaPagada) {
      setMontoRecibido(val(cuota.montoPagado).toFixed(2));
    } else {
      setMontoRecibido((val(montoCalculado) || 0).toFixed(2));
    }
  }, [cuota, cuotaPagada, montoCalculado]);

  // ----- Registrar pago + incrementar nControl -----
  const handlePago = async () => {
    if (!cuota) return;

    const pago = val(montoRecibido);
    const hoyISO = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    let interes = 0;
    if (estaVencida()) {
      const prestamo = cuota.Prestamo || {};
      const cantidadCuotas = prestamo.cuotas?.length || 1;

      const finalPorCuota =
        (val(prestamo.montoFinal) > 0
          ? val(prestamo.montoFinal) / cantidadCuotas
          : val(cuota.monto)) || 0;

      const capitalPorCuota = val(prestamo.monto) / cantidadCuotas;

      if (val(cuota.montoConInteres) > 0) {
        interes = val(cuota.montoConInteres) - capitalPorCuota;
      } else {
        const hoy = new Date();
        const venc = new Date(cuota.fechaVencimiento);
        const diffMs = new Date(hoy.toDateString()) - new Date(venc.toDateString());
        const diasAtraso = Math.max(
          0,
          Math.floor(diffMs / (1000 * 60 * 60 * 24))
        );
        const tasaAnual = val(prestamo.tasaMoraAnual) / 100;
        const tasaDiaria = tasaAnual / 365;
        interes = finalPorCuota * tasaDiaria * diasAtraso;
      }
    }

    // Número de control visible en la boleta
    const numeroControlUsado = nControlSiguiente;

    try {
      // 1) Registrar pago (si tu backend acepta numeroControl, lo guardamos para auditoría)
      await axios.post(`${API_BASE}/cuotas/${id}/pago`, {
        montoPagado: pago,
        fechaPago: hoyISO,
        interesPagado: interes,
        quitaAplicada: !!quitaSeleccionada,
        numeroControl: numeroControlUsado, // opcional pero recomendado
      });

      // 2) Incrementar nControl global
      await axios.post(`${API_BASE}/control/sumar`);

      // 3) Feedback y estado local
      alert("✅ Pago registrado");
      setCuota((prev) => ({
        ...prev,
        estado: "pagada",
        fechaPago: hoyISO,
        interesPagado: interes,
        montoPagado: pago,
        numeroControl: numeroControlUsado,
      }));

      // 4) Actualizar contador local (para próxima boleta)
      setNControlActual((prev) => (prev == null ? null : prev + 1));
      setNControlSiguiente((prev) => (prev == null ? null : prev + 1));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error en pago");
    }
  };

  if (loading) return <Spinner size="xl" />;

  const prestamo = cuota?.Prestamo || {};
  const cliente = prestamo?.User || {};

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // fecha para imprimir en boleta
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  const fechaString = `${dia} ${mes} ${anio}`;

  const montoMenor = cuota?.montoConInteres;

  // N° de control a mostrar (si ya está pagada, mostramos el que quedó; si no, el global+1)
  const nroControlParaMostrar = cuotaPagada
    ? cuota?.numeroControl ?? nControlSiguiente
    : nControlSiguiente;

  return (
    <Box>
      {/* Panel superior (no imprimible) */}
      {!(montoMenor > 10 && displayAmount > montoMenor) && (
        <Flex
          className="no-print"
          bg="gray.800"
          color="white"
          p={3}
          align="center"
          position="relative"
          zIndex={10}
          gap={4}
        >
          <Input
            type="number"
            step="0.01"
            value={montoRecibido}
            onChange={(e) => {
              const valStr = e.target.value.replace(",", ".");
              setMontoRecibido(valStr);
            }}
            placeholder="Monto recibido"
            w="200px"
          />

          {estaVencida() ? (
            <Text fontWeight="bold">Ingrese monto a pagar (mínimo intereses)</Text>
          ) : (
            <>
              <Text fontWeight="bold">Aplicar quita</Text>
              <Select
                value={quitaSeleccionada}
                onChange={(e) => setQuitaSeleccionada(e.target.value)}
                w="220px"
                bg="white"
                color="black"
              >
                <option value="">Sin descuento</option>
                {quitas.map((q) => (
                  <option key={q.id} value={q.tipo}>
                    {q.tipo === "tipo1" ? "Opción 1" : "Opción 2"} ({q.porcentaje}
                    %)
                  </option>
                ))}
              </Select>
            </>
          )}
        </Flex>
      )}

      {/* Boletas duplicadas */}
      <Box w="100%" maxW="100%" className="screen-preview">
        {[0, 1].map((i) => (
          <Box
            key={i}
            position="absolute"
            top={`${i * 51}%`}
            left="0"
            w="100%"
            height="47%"
          >
            {/* Si usás una imagen de fondo para el recibo, descomentalo */}
            {/* <Image
              src={recibo}
              alt="Recibo"
              width="700px"
              height="350px"
              className="no-print"
              zIndex={0}
            /> */}

            <Box
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              bgColor={"white"}
            >
              <Text position="absolute" top="19px" right="31px" fontWeight="bold">
                {fechaString}
              </Text>

              <Text position="absolute" top="44px" right="38px" fontWeight="bold">
                N° Control: {loadingNControl ? "..." : nroControlParaMostrar ?? "-"}
              </Text>

              <Text position="absolute" top="70px" left="170px" fontWeight="bold">
                {cuota?.numeroCuota}/{prestamo?.cuotas?.length ?? "-"}
              </Text>

              <Text position="absolute" top="105px" left="210px">
                {capitalize(cliente?.name)} {capitalize(cliente?.surname)}
              </Text>

              <Text position="absolute" top="136px" left="280px" w="50%">
                {montoEnLetras}
              </Text>

              <Text position="absolute" top="400px" left="150px" fontWeight="bold">
                {montoMenor < 10 && displayAmount > montoMenor
                  ? `$ ${val(displayAmount).toLocaleString("es-AR")}`
                  : `$${val(montoMenor).toLocaleString("es-AR")}`}
              </Text>
            </Box>
          </Box>
        ))}

        {/* Botones solo para pantalla */}
        <Box
          className="no-print"
          position="relative"
          bottom="40px"
          left="150px"
          display="flex"
          gap={3}
          m={"370px"}
        >
          {!cuotaPagada && (
            <Button colorScheme="green" onClick={handlePago}>
              Registrar Pago
            </Button>
          )}
          <Button colorScheme="blue" onClick={() => window.print()}>
            Imprimir
          </Button>
        </Box>
      </Box>

      {/* estilos impresión */}
      <style>
        {`
          @media print {
            .screen-preview {
              transform: none !important;
              width: 100%;
              height: 100vh;
              overflow: hidden;
            }
            .no-print { display: none !important; }
            button, select, input { display: none !important; }
            @page { margin: 0; size: auto; }
          }
        `}
      </style>
    </Box>
  );
}
