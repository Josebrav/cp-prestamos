// src/components/VerCuota.jsx
import {
  Box,
  Text,
  Input,
  Button,
  Select,
  Spinner,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import Image from "@chakra-ui/react"; // si usás <Image />, importalo
// import recibo from "../assets/recibo2.jpg";
import { numeroALetras } from "../utils/numerosALetras";


const API_BASE = "http://192.168.1.48:3001";

export default function VerCuota() {
  const { id } = useParams();

  // ----- Estados principales -----
  const [cuota, setCuota] = useState(null);
  const [quitas, setQuitas] = useState([]);
  const [quitaSeleccionada, setQuitaSeleccionada] = useState("");
  const [quitaPorcentaje, setQuitaPorcentaje] = useState(0);
  const [descuentoCalculado, setDescuentoCalculado] = useState(0);
  const [loading, setLoading] = useState(true);

  // nControl global
  const [nControlActual, setNControlActual] = useState(null);
  const [nControlSiguiente, setNControlSiguiente] = useState(null);
  const [loadingNControl, setLoadingNControl] = useState(true);
  const [controlInput, setControlInput] = useState('');
  const toast = useToast();

  // Input y cálculos de monto
  const [montoRecibido, setMontoRecibido] = useState(""); // string para no romper mientras escribe
  const [montoCalculado, setMontoCalculado] = useState(0);
  const [montoEnLetras, setMontoEnLetras] = useState("");
  const [pagoRealizado, setPagoRealizado] = useState(false);


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
        // inicializar controlInput desde la cuota recibida
        if (resCuota.data && resCuota.data.numeroControl) {
          setControlInput(String(resCuota.data.numeroControl));
        }
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



  // Mostrar cantidad final que se imprime / muestra:
  const displayAmount = val(montoRecibido);
  useEffect(() => {
    if (!cuota) return;

    // 🚫 Si ya se pagó, NO tocar el input
    if (pagoRealizado) return;

    // Si ya hay pagos parciales registrados, mostrar el restante correctamente
    const sumaPagoCuotas = (cuota.PagoCuota || []).reduce((acc, p) => acc + val(p.monto), 0) || val(cuota.montoPagado);
    if (sumaPagoCuotas > 0) {
      // El backend puede haber reducido `montoConInteres` al registrar pagos.
      // Si `montoConInteres` está presente, ya representa el restante, por lo que
      // debemos mostrarlo directamente y NO restar los pagos otra vez.
      if (cuota.montoConInteres !== null && cuota.montoConInteres !== undefined) {
        const restanteDirecto = Number(val(cuota.montoConInteres).toFixed(2));
        setDescuentoCalculado(0);
        setQuitaPorcentaje(0);
        setMontoCalculado(restanteDirecto);
        setMontoRecibido(restanteDirecto.toFixed(2));
        return;
      }

      // Si no hay `montoConInteres`, calculamos restante desde el monto base
      const montoAdeudado = val(cuota.monto);
      const restante = Number((montoAdeudado - sumaPagoCuotas).toFixed(2));
      setDescuentoCalculado(0);
      setQuitaPorcentaje(0);
      setMontoCalculado(restante);
      setMontoRecibido(restante.toFixed(2));
      return;
    }

    // Si la cuota está vencida, mostramos el monto con interés
    if (cuota.estado === "vencida") {
      const montoFinal = val(cuota.montoConInteres);
      setMontoCalculado(montoFinal);
      setMontoRecibido(montoFinal.toFixed(2));
      setDescuentoCalculado(0);
      setQuitaPorcentaje(0);
      return;
    }

    // Si está al día, aplicamos quita (si hay)
    const montoBase = val(cuota.monto);
    const porcentaje = Number(quitaPorcentaje) || 0;
    const descuento = Number(((montoBase * porcentaje) / 100).toFixed(2));
    const montoConQuita = Number((montoBase - descuento).toFixed(2));
    setDescuentoCalculado(descuento);
    setMontoCalculado(montoConQuita);
    setMontoRecibido(montoConQuita.toFixed(2));

  }, [cuota, pagoRealizado, quitaPorcentaje]);

  // Recalcular cuando cambia la quita seleccionada
  useEffect(() => {
    if (!cuota) return;
    if (pagoRealizado) return; // no sobrescribir monto después de un pago
    // si ya hay pagos parciales, no aplicar quita (usar suma de PagoCuota)
    const sumaPagoCuotas = (cuota.PagoCuota || []).reduce((acc, p) => acc + val(p.monto), 0) || val(cuota.montoPagado);
    if (sumaPagoCuotas > 0) return;
    if (cuota.estado === "vencida") return; // no aplica
    const q = quitas.find((q) => q.tipo === quitaSeleccionada);
    const porcentaje = q ? Number(q.porcentaje) : 0;
    setQuitaPorcentaje(porcentaje);

    const montoBase = val(cuota.monto);
    const descuento = Number(((montoBase * porcentaje) / 100).toFixed(2));
    const montoConQuita = Number((montoBase - descuento).toFixed(2));
    setDescuentoCalculado(descuento);
    setMontoCalculado(montoConQuita);
    setMontoRecibido(montoConQuita.toFixed(2));
  }, [quitaSeleccionada, quitas, cuota]);
  // Letras del monto
  useEffect(() => {
    setMontoEnLetras(numeroALetras(displayAmount));
  }, [displayAmount]);

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

      // Calcular pagos previos sobre esta cuota
      const sumaPagoCuotas = (cuota.PagoCuota || []).reduce((acc, p) => acc + val(p.monto), 0) || val(cuota.montoPagado);

      if (val(cuota.montoConInteres) > 0) {
        // El interés actual es la diferencia entre lo que se debe con interés
        // y el saldo original pendiente (monto original menos pagos previos)
        const saldoPendienteOriginal = val(cuota.monto) - sumaPagoCuotas;
        interes = val(cuota.montoConInteres) - saldoPendienteOriginal;
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

    // Validaciones frontend
    if (pago <= 0) return alert('Ingrese un monto válido mayor que 0');

    // Si la cuota está vencida, al menos permitir cualquier pago (backend controla intereses)
    // Si la cuota está vencida, exigir que el pago parcial cubra al menos los intereses
    if (estaVencida()) {
      if (pago < interes) {
        return alert(`Pago insuficiente: debe abonar al menos los intereses: $${interes.toFixed(2)}`);
      }
    }

    // Si la cuota está al día y se seleccionó quita, exigir pago completo del monto con quita
    if (cuota.estado === 'al dia' && quitaSeleccionada) {
      const esperado = Number(montoCalculado);
      if (pago < esperado) {
        return alert('La quita sólo se aplica si paga el monto total con descuento. Ingrese el monto con quita o quite la opción.');
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
        quitaTipo: quitaSeleccionada || null,
        quitaPorcentaje: quitaPorcentaje || 0,
        numeroControl: numeroControlUsado,
        registrarPagoCuota: true, // 🔥 CLAVE
      });

      // 2) Incrementar nControl global
      await axios.post(`${API_BASE}/control/sumar`);





      // 3) Feedback y estado local
      alert("✅ Pago registrado");
      setPagoRealizado(true);
      const res = await axios.get(`${API_BASE}/cuotas/${id}`);
      setCuota(res.data);

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

  const totalPagado = (cuota.PagoCuota || [])
    .reduce((acc, p) => acc + val(p.monto), 0);

  return (
    <Box backgroundColor={"white"}>
      {/* Panel superior (no imprimible) */}
      {!cuotaPagada && (
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
      {/* Recibo pequeño (no imprimible) */}
      {pagoRealizado && cuota && (
        <Box className="no-print" bg="green.50" p={3} m={3} borderRadius="md">
          <Text fontWeight="bold">Recibo (registro rápido)</Text>
          <Text>Fecha: {new Date().toLocaleDateString()}</Text>
          <Text>
            Monto pagado: $
            {(
              // Mostrar el último pago registrado si existe, si no fallback a cuota.montoPagado o monto recibido
              (cuota.PagoCuota && cuota.PagoCuota.length > 0
                ? val(cuota.PagoCuota[cuota.PagoCuota.length - 1].monto)
                : val(cuota.montoPagado) || val(montoRecibido)
              )
            ).toLocaleString('es-AR')}
          </Text>
          {descuentoCalculado > 0 && (
            <Text>Descuento aplicado: ${descuentoCalculado.toLocaleString('es-AR')}</Text>
          )}
          <Text>Estado cuota: {cuota.estado}</Text>
          <Button size="sm" mt={2} onClick={() => window.print()}>
            Imprimir recibo
          </Button>
        </Box>
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

              {/* Texto visible sólo en impresión en la posición original (debajo de la fecha) */}
              <Text
                className="print-only"
                position="absolute"
                top="44px"
                right="38px"
                fontWeight="bold"
              >
                N° Control: {cuota?.numeroControl ?? nroControlParaMostrar ?? '-'}
              </Text>

              {/* Input editable (pantalla) para cambiar número de control; está oculto al imprimir por las reglas CSS globales */}
              <Box position="absolute" top="40px" right="24px" className="no-print">
                <Text fontSize="xs" color="gray.200">N° Control</Text>
                <Input
                  size="sm"
                  w="90px"
                  value={controlInput}
                  onChange={(e) => setControlInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const valStr = e.target.value.trim();
                      if (!valStr) {
                        toast({ title: 'Error', description: 'Ingrese un número válido', status: 'error', duration: 3000 });
                        return;
                      }
                      const n = parseInt(valStr);
                      if (!Number.isInteger(n) || n <= 0) {
                        toast({ title: 'Error', description: 'Número inválido', status: 'error', duration: 3000 });
                        return;
                      }
                      try {
                        const res = await axios.put(`${API_BASE}/cuotas/${id}/numero-control`, { numeroControl: n });
                        setCuota(res.data);
                        setControlInput(String(res.data.numeroControl));
                        toast({ title: 'Actualizado', description: 'Número de control guardado', status: 'success', duration: 2500 });
                      } catch (err) {
                        if (err.response?.status === 409) {
                          toast({ title: 'Conflicto', description: 'Número de control ya en uso', status: 'error', duration: 4000 });
                        } else {
                          toast({ title: 'Error', description: err.response?.data?.error || err.message || 'Error al guardar', status: 'error', duration: 4000 });
                        }
                        // restaurar valor actual del servidor
                        const latest = await axios.get(`${API_BASE}/cuotas/${id}`);
                        setCuota(latest.data);
                        setControlInput(String(latest.data.numeroControl ?? ''));
                      }
                    }
                  }}
                />
              </Box>

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
                ${val(displayAmount).toLocaleString("es-AR")}
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
          <Button colorScheme="gray" onClick={() => window.history.back()}>
            ← Volver
          </Button>
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
            .print-only { display: block !important; }
            @page { margin: 0; size: auto; }
          }
          /* En pantalla ocultar elementos solo-impresión */
          .print-only { display: none; }
        `}
      </style>
    </Box>
  );
}