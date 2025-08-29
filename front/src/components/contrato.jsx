import { Box, Text, Divider, Image, Button, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { numeroALetras } from "../utils/numerosALetras";
import logo from "../assets/cp.jpg"; // ✅ logo fijo aquí

export default function Contrato() {
  const  prestamoId  = useParams();
  const [prestamo, setPrestamo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaPrimeraCuota, setFechaPrimeraCuota] = useState("");

  const val = (x) => (x === null || x === undefined || x === "" ? 0 : Number(x));

  useEffect(() => {
    const hoy = new Date();
    setFechaHoy(
      `${hoy.getDate().toString().padStart(2, "0")}/${(hoy.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${hoy.getFullYear()}`
    );

    const primeraCuota = new Date();
    primeraCuota.setMonth(primeraCuota.getMonth() + 1);
    setFechaPrimeraCuota(
      `${primeraCuota.getDate().toString().padStart(2, "0")}/${(
        primeraCuota.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${primeraCuota.getFullYear()}`
    );
  }, []);
console.log(prestamoId);

  useEffect(() => {
  if (prestamoId) {
    axios
      .get(`http://localhost:3001/prestamo/${prestamoId.id}`)
      .then((res) => {
        const prestamoData = res.data;
        setPrestamo(prestamoData);

        // 🔹 Calcular fecha de la primera cuota desde la fecha de inicio
        if (prestamoData.fechaInicio) {
          const inicio = new Date(prestamoData.fechaInicio);
          const primeraCuota = new Date(inicio);
          primeraCuota.setMonth(primeraCuota.getMonth() + 1);

          setFechaPrimeraCuota(
            `${primeraCuota.getDate().toString().padStart(2, "0")}/${(
              primeraCuota.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${primeraCuota.getFullYear()}`
          );
        }

        return axios.get(`http://localhost:3001/usuario/${prestamoData.userId}`);
      })
      .then((res) => {
        setCliente(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando contrato:", err);
        setLoading(false);
      });
  }
}, [prestamoId]);


  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!prestamo || !cliente) {
    return <Text p={6}>❌ No se encontró información del contrato</Text>;
  }

  const montoFinal = val(prestamo.montoFinal || prestamo.monto);
  const cuotas = prestamo.cuotas?.length || 1;
  const montoCuota = (montoFinal / cuotas).toFixed(2);

  const handlePrint = () => window.print();

  return (
      <Box
      w="80%"
      maxW="1200px"
      mx="auto"
      bg="white"
      borderRadius="20px"
      borderTopRadius="0px"
      mt={0}
      p={6}
      pb="140px"
      
    >
        <Box border={"2px"} borderColor={"black"} >
    <Box p={6} fontSize="10.5px" lineHeight="1.6">
      

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Image src={logo} alt="Logo" boxSize="80px" className="no-print" />
        <Text fontWeight="bold" fontSize="2xl">
          SOLICITUD DE CRÉDITO
        </Text>
      </Box>

      <Box mt={2} textAlign="right">
        <Text>Cipolletti</Text>
        <Text>{fechaHoy}</Text>
      </Box>

      {/* Texto contrato */}
      <Box mt={4}>
        <Text>Sres:</Text>
        <Text mt={2}>
          Por la presente solicito a uds el otorgamiento de un crédito personal
          de ${prestamo.monto} ({numeroALetras(prestamo.monto)}), más los
          importes que se devenguen en concepto de sellado (si correspondiere),
          que asciende al total de ${montoFinal} ({numeroALetras(montoFinal)}),
          que me obligo a restituir en {cuotas} cuotas mensuales iguales y
          consecutivas, en adelante CUOTAS de ${montoCuota} (
          {numeroALetras(montoCuota)}) cada una, calculada bajo el sistema de
          amortización francés, las que vencerán los días 28 de cada mes, la
          primera de ellas pagadera {fechaPrimeraCuota}, las cuales abonare{" "}
          <b>sin protesto</b>. Sobre el capital adeudado abonare una tasa del{" "}
          {prestamo.tasaMoraAnual}% anual.
        </Text>
      </Box>

      <Divider my={4} />

      {/* Datos solicitante */}
      <Text fontWeight="bold">DATOS DEL SOLICITANTE</Text>
      <Box mt={2}>
        <Text>Nombre: {cliente.name}</Text>
        <Text>Apellido: {cliente.surname}</Text>
        <Text>DNI: {cliente.dni}</Text>
        <Text>
          Fecha de nacimiento:{" "}
          {cliente.nacimiento
            ? new Date(cliente.nacimiento).toISOString().split("T")[0]
            : ""}
        </Text>
        <Text>Cuil: {cliente.cuil}</Text>
        <Text>Dirección: {cliente.direccion}</Text>
        <Text>Teléfono: {cliente.phone}</Text>
        <Text>Email: {cliente.email}</Text>
        <Text>Haber Mensual: {cliente.sueldo}</Text>
        <Text>Empleador: {cliente.lugarDeTrabajo}</Text>
      </Box>

      <Divider my={4} />

      <Box mt={2}>
         <Text>
          A partir de la presentación al cobro, el importe adeudado devengará
          además un interés punitorio igual al 50% de la tasa indicada
          precedentemente y ambos serán capitalizados mensualmente. De
          conformidad con lo dispuesto en el artículo 36 del decreto Ley 5965/63,
          se amplía el plazo de presentación a cinco años a contar de la fecha
          de libramiento del presente. El(los) librador(es) y avalista(s) se
          somete(n) a la jurisdicción de los tribunales ordinarios de la
          provincia de Río Negro o a los correspondientes al domicilio del(los)
          librador(es) o al domicilio del(los) avalista(s), a opción de la
          prestadora.
        </Text>
      </Box>

      <Box mt={6} textAlign="center" >
        <Text>Firma y aclaración del solicitante</Text>
        <Text mt={4}>_________________________</Text>
      </Box>
    </Box>
    </Box>
    </Box>
  );
}
