// src/components/VerCuota.jsx
import {
  Box,
  Text,
  Input,
  Button,
  Image,
  Select,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import recibo from "../assets/recibo2.jpg";
import { numeroALetras } from "../utils/numerosALetras";

export default function VerCuota() {
  const { id } = useParams();
  const [cuota, setCuota] = useState(null);
  const [quitas, setQuitas] = useState([]);
  const [quitaSeleccionada, setQuitaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);

  // Input que escribe el usuario (string para no romper mientras escribe)
  const [montoRecibido, setMontoRecibido] = useState("");

  // Monto calculado por la app (numero)
  const [montoCalculado, setMontoCalculado] = useState(0);
  const [montoEnLetras, setMontoEnLetras] = useState("");

  

  // helper seguro para parsear números (acepta "123,45" y "123.45")
  const val = (x) => {
    if (x === null || x === undefined || x === "") return 0;
    const n = Number(String(x).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/cuotas/${id}`)
      .then((res) => {
        setCuota(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    axios
      .get("http://localhost:3001/quitas")
      .then((res) => setQuitas(res.data))
      .catch((err) => console.error("Error fetch quitas:", err));
  }, [id]);

  const estaVencida = () => {
    if (!cuota) return false;
    const hoy = new Date();
    const venc = new Date(cuota.fechaVencimiento);
    // ignorar horas
    return new Date(hoy.toDateString()) > new Date(venc.toDateString());
  };

  // Recalcula monto mostrado (montoCalculado) cada vez que cambian datos
  useEffect(() => {
    if (!cuota) return;
    const prestamo = cuota.Prestamo || {};
    const cantidadCuotas = prestamo.cuotas?.length || 1;

    // 1) Determinar finalPorCuota (lo que conceptualmente vale la cuota sin mora)
    // preferimos usar prestamo.montoFinal / n, si no existe usar cuota.monto, si no usar prestamo.monto/n
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
        // Calculo simple de mora: interés diario sobre el valor final por cuota
        const hoy = new Date();
        const venc = new Date(cuota.fechaVencimiento);
        const diffMs = new Date(hoy.toDateString()) - new Date(venc.toDateString());
        const diasAtraso = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const tasaAnual = val(prestamo.tasaMoraAnual) / 100; // por ejemplo 50 => 0.5
        const tasaDiaria = tasaAnual / 365;
        // interés de mora simple sobre el finalPorCuota (puedes cambiar a compuesto si querés)
        const interesMora = finalPorCuota * tasaDiaria * diasAtraso;

        monto = finalPorCuota + interesMora;
      }
    } else {
      // No está vencida: monto base = finalPorCuota.
      monto = finalPorCuota;
      // aplicar quita (si hay) sobre la PORCIÓN INTERÉS de la cuota
      if (quitaSeleccionada) {
        const quita = quitas.find((q) => q.tipo === quitaSeleccionada);
        if (quita) {
          const porc = val(quita.porcentaje);
          const descuento = interesPorCuota * (porc / 100);
          monto = finalPorCuota - descuento;
        }
      }
    }

    // redondeo a 2 decimales
   const montoRounded = Math.round(monto * 100) / 100;
  setMontoCalculado(montoRounded);
   if (!montoRecibido || quitaSeleccionada) {
    setMontoRecibido(montoRounded.toFixed(2));
  }


 if (!montoRecibido || quitaSeleccionada) {
    setMontoRecibido(montoRounded.toFixed(2));
  }})
const cuotaPagada = cuota?.estado === "pagada";
  // Mostrar cantidad final que va a imprimirse / mostrarse: si el usuario ingresó valor lo usamos, si no usamos el calculado
 const displayAmount = cuotaPagada ? val(cuota.montoPagado) : (val(montoRecibido) > 0 ? val(montoRecibido) : montoCalculado);

  useEffect(() => {
    setMontoEnLetras(numeroALetras(displayAmount));
  }, [displayAmount]);
  useEffect(() => {
  if (!cuota) return;
  if (cuotaPagada) {
    setMontoRecibido(val(cuota.montoPagado).toFixed(2));
  } else {
    setMontoRecibido(montoCalculado.toFixed(2));
  }
}, [cuota, cuotaPagada, montoCalculado]);
  

  const handlePago = () => {
  if (!cuota) return;

  const pago = val(montoRecibido);
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let interes = 0;
  if (estaVencida()) {
    const prestamo = cuota.Prestamo || {};
    const cantidadCuotas = prestamo.cuotas?.length || 1;

    let finalPorCuota = val(prestamo.montoFinal) / cantidadCuotas || val(cuota.monto);
    const capitalPorCuota = val(prestamo.monto) / cantidadCuotas;

    if (val(cuota.montoConInteres) > 0) {
      interes = val(cuota.montoConInteres) - capitalPorCuota;
    } else {
      const hoyDate = new Date();
      const venc = new Date(cuota.fechaVencimiento);
      const diffMs = hoyDate - venc;
      const diasAtraso = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const tasaAnual = val(prestamo.tasaMoraAnual) / 100;
      const tasaDiaria = tasaAnual / 365;
      interes = finalPorCuota * tasaDiaria * diasAtraso;
    }
  }

  axios
    .post(`http://localhost:3001/cuotas/${id}/pago`, {
      montoPagado: pago,
      fechaPago: hoy,
      interesPagado: interes,
      quitaAplicada: !!quitaSeleccionada,   // 🔹 <-- nuevo
    })
    .then(() => {
      alert("✅ Pago registrado");
      setCuota((prev) => ({
        ...prev,
        estado: "pagada",
        fechaPago: hoy,
        interesPagado: interes,
        montoPagado: pago,
      }));
    })
    .catch((err) => {
      console.error(err);
      alert(err.response?.data?.error || "Error en pago");
    });
};

  if (loading) return <Spinner size="xl" />;

  const prestamo = cuota.Prestamo || {};
  const cliente = prestamo?.User || {};

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // fecha para imprimir en boleta
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  const fechaString = `${dia} ${mes} ${anio}`;

  const montoMenor = cuota.montoConInteres
  console.log(montoMenor);
  

  return (
    <Box >
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
      ml={2}
      mr={4}
    />
    {estaVencida() ? (
      <Text fontWeight="bold">Ingrese monto a pagar (mínimo intereses)</Text>
    ) : (
      <>
        <Text fontWeight="bold" mr={5}>
          Aplicar quita
        </Text>
        {quitas.length > 0 && (
          <Select
            value={quitaSeleccionada}
            onChange={(e) => setQuitaSeleccionada(e.target.value)}
            w="200px"
            bg="white"
            color="black"
          >
            <option value="">Sin descuento</option>
            {quitas.map((q) => (
              <option key={q.id} value={q.tipo}>
                {q.tipo === "tipo1" ? "Opción 1" : "Opción 2"} ({q.porcentaje}%)
              </option>
            ))}
          </Select>
        )}
      </>
    )}
  </Flex>
)}

      {/* Boletas duplicadas */}
      <Box w="100%" maxW="100%" className="screen-preview" >
        {[0, 1].map((i) => (
          <Box
            key={i}
            position="absolute"
            top={`${i * 51}%`}
            left="0"
            w="100%"
            height="47%"
          >
         {/*    <Image
              src={recibo}
              alt="Recibo"
              width="700px"
              height="350px"
              className="no-print"
              zIndex={0}
            /> */}

            <Box position="absolute" top="0" left="0" w="100%" h="100%" bgColor={"white"}>
              <Text position="absolute" top="19px" right="31px" fontWeight="bold">
                {fechaString}
              </Text>
              <Text position="absolute" top="44px" right="38px" fontWeight="bold">
                N° Control: {cuota.numeroControl}
              </Text>
              <Text position="absolute" top="70px" left="170px" fontWeight="bold">
                {cuota.numeroCuota}/{prestamo?.cuotas?.length ?? "-"}
              </Text>
              <Text position="absolute" top="105px" left="210px">
                {capitalize(cliente?.name)} {capitalize(cliente?.surname)}
              </Text>
              <Text position="absolute" top="136px" left="280px" w="50%">
                {montoEnLetras}
              </Text>
        <Text
  position="absolute"
  top="400px"
  left="150px"
  fontWeight="bold"
>
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
  <Button colorScheme="green" onClick={handlePago} >
    Registrar Pago
  </Button>
)}
          <Button colorScheme="blue" onClick={() => window.print() }>
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
