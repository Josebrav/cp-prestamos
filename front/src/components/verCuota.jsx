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
  Tr,
  Td,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import recibo from "../assets/recibo2.jpg";
import { numeroALetras } from "../utils/numerosALetras";

export default function VerCuota() {

  const calcularInteres = (c) => {
  if (!c || !c.Prestamo) return 0;
  const prestamo = c.Prestamo;
  const cantidadCuotas = prestamo.cuotas?.length || 1;

  // Monto base por cuota
  const montoBase = prestamo.monto / cantidadCuotas;
  // Interés por cuota
  let interes = (prestamo.montoFinal / cantidadCuotas) - montoBase;

  // Aplicar quita solo si la cuota no está vencida y hay quita seleccionada
  if (!estaVencida() && quitaSeleccionada) {
    const quita = quitas.find(q => q.tipo === quitaSeleccionada);
    if (quita) {
      const descuento = (interes * quita.porcentaje) / 100;
      interes -= descuento;
    }
  }
  return interes;
};
  const { id } = useParams();
  const [cuota, setCuota] = useState(null);
  const [quitas, setQuitas] = useState([]);
  const [quitaSeleccionada, setQuitaSeleccionada] = useState(""); // ✅ faltaba
  const [loading, setLoading] = useState(true);
  const [montoPagado, setMontoPagado] = useState("");
  const [montoEnLetras, setMontoEnLetras] = useState("");

   let montoAPagar = parseFloat(cuota?.monto || 0) + calcularInteres(cuota) ;
  useEffect(() => {
    // Traer cuota
    axios.get(`http://localhost:3001/cuotas/${id}`).then((res) => {
      setCuota(res.data);
      setLoading(false);
    });

    // Traer posibles quitas
    
  }, [id]);

 useEffect(() => {
  axios.get("http://localhost:3001/quitas")
    .then(res => {
      console.log("QUITAS:", res.data); // <- esto te muestra si llegan
      setQuitas(res.data);
    })
    .catch(err => console.error("Error fetch quitas:", err));
}, []);


  const estaVencida = () => {
    if (!cuota) return false;
    const hoy = new Date();
    const venc = new Date(cuota.fechaVencimiento);
    return hoy > venc;
  };

  const handlePago = () => {
    if (!cuota) return;
    const intereses = parseFloat(cuota.intereses || 0);

    if (estaVencida() && parseFloat(montoPagado) < intereses) {
      return alert("❌ El pago no puede ser menor a los intereses.");
    }

    axios
      .post(`http://localhost:3001/cuotas/${id}/pago`, { montoPagado })
      .then((res) => {
        alert("✅ Pago registrado");
        setCuota(res.data.cuota);
      })
      .catch((err) => alert(err.response?.data?.error || "Error en pago"));
  };

  // 🔹 calcular monto a pagar
 

if (montoPagado) {
  montoAPagar = parseFloat(montoPagado);
}


  useEffect(() => {
    setMontoEnLetras(numeroALetras(montoAPagar));
  }, [montoAPagar]);

  if (loading) return <Spinner size="xl" />;

  const prestamo = cuota.Prestamo;
  const cliente = prestamo?.User;

  // helpers
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // Fecha
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  const fechaString = `${dia} ${mes} ${anio}`;
  // Calcula interés por cuota según monto inicial, final y quita seleccionada



  return (
    <Box>
      <Flex
        className="no-print"
        bg="gray.800"
        color="white"
        p={3}
        
        align="center"
      >
         <Input
            type="number"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
            placeholder="Monto recibido"
            w="200px"
            ml={2}
            mr={4}
          />
        {estaVencida() ? (
          <Text fontWeight="bold">
            Ingrese monto a pagar (mínimo intereses)
          </Text>
          
        ) : (
          <>
            <Text fontWeight="bold" mr={5}>Aplicar quita</Text>
            {quitas.length > 0 && (
        <Select
  value={quitaSeleccionada}
  onChange={(e) => setQuitaSeleccionada(e.target.value)}
  w="200px"
  bg="white"
  color="black"
>
  <option value="">Sin descuento</option>
  {quitas.map(q => (
    <option key={q.id} value={q.tipo}>
      {q.tipo === "tipo1" ? "Opción 1" : "Opción 2"} ({q.porcentaje}%)
    </option>
  ))}
</Select>
)}


          </>
        )}
      </Flex>
   
    <Box w="100%" maxW="100%" position="relative" className="screen-preview">
      {/* NAVBAR (no imprimible) */}
      

      {/* Imagen de fondo */}
      <Box position="relative" top="0" left="0" zIndex={0}>
        <Image
          src={recibo}
          alt="Recibo"
          width="700px"
          height="350px"
          className="no-print"
        />
      </Box>

      {/* Contenido encima */}
      <Box position="absolute" top="0" left="0" w="100%" h="100%" zIndex={1}>
        <Text
          position="absolute"
          top="19px"
          right="31px"
          fontWeight="bold"
          whiteSpace="nowrap"
        >
          {fechaString}
        </Text>
        <Text
          position="absolute"
          top="44px"
          right="38px"
          fontWeight="bold"
          whiteSpace="nowrap"
        >
          N° Control: {prestamo.numeroControl}
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
        <Text position="absolute" top="170px" left="280px" fontWeight="bold">
          $ {montoAPagar.toLocaleString("es-AR")}
        </Text>

        <Box
          position="absolute"
          bottom="40px"
          left="150px"
          display="flex"
          gap={3}
        >
         
          <Button colorScheme="green" onClick={handlePago}>
            Registrar Pago
          </Button>
          <Button colorScheme="blue" onClick={() => window.print()}>
            Imprimir
          </Button>
        </Box>
      </Box>

      <style>
        {`
        .screen-preview {
          transform: scale(0.9);
          transform-origin: top left;
        }
        @media print {
          .screen-preview { transform: none !important; }
          .no-print { display: none !important; }
          button, select, input { display: none !important; }
          @page { margin: 0; size: auto; }
          body { margin: 0; padding: 0; }
        }
      `}
      </style>  
    </Box>
     </Box>
  );
}
