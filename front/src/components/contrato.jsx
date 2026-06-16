import { Box, Text, Divider, Image, Button, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { numeroALetras } from "../utils/numerosALetras";
import logo from "../assets/cp.jpg";

export default function Contrato() {
  const { id } = useParams();
  const [prestamo, setPrestamo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaPrimeraCuota, setFechaPrimeraCuota] = useState("");

  const val = (x) => (x === null || x === undefined || x === "" ? 0 : Number(x));

  // 🔥 FORMATEADORES
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    return fecha.split("T")[0].split("-").reverse().join("/");
  };

  const capitalize = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatoARS = (num) => {
    return Number(num).toLocaleString("es-AR");
  };

  // 🔹 Fecha actual
  useEffect(() => {
    const hoy = new Date();
    setFechaHoy(
      `${hoy.getDate().toString().padStart(2, "0")}/${(hoy.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${hoy.getFullYear()}`
    );
  }, []);

  // 🔹 Fetch datos
  useEffect(() => {
    if (id) {
      axios
        .get(`http://192.168.1.48:3001/prestamo/${id}`)
        .then((res) => {
          const prestamoData = res.data;
          setPrestamo(prestamoData);

          // ✅ calcular primera cuota SIN timezone bug
          if (prestamoData.fechaInicio) {
            const [year, month, day] = prestamoData.fechaInicio
              .split("T")[0]
              .split("-");

            const primeraCuota = new Date(year, month - 1, day);
            primeraCuota.setMonth(primeraCuota.getMonth() + 1);

            setFechaPrimeraCuota(
              `${primeraCuota
                .getDate()
                .toString()
                .padStart(2, "0")}/${(primeraCuota.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${primeraCuota.getFullYear()}`
            );
          }

          return axios.get(
            `http://192.168.1.48:3001/usuario/${prestamoData.userId}`
          );
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
  }, [id]);

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

  // ✅ día de pago SIN bug
  const diaPago = prestamo.fechaInicio
    ? Number(prestamo.fechaInicio.split("T")[0].split("-")[2])
    : 28;

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
      p={5}
      
    >
      

      <Box border="2px solid black">
        <Box p={6} fontSize="11.5px" lineHeight="1.7" fontFamily="Arial">
          {/* HEADER */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Image src={logo} alt="Logo" boxSize="80px" />
            <Text fontWeight="bold" fontSize="22px" letterSpacing="1px">
              SOLICITUD DE CRÉDITO
            </Text>
          </Box>

          <Box mt={2} textAlign="right">
            <Text>Cipolletti</Text>
            <Text>{fechaHoy}</Text>
          </Box>

          {/* TEXTO */}
          <Box mt={4}>
            <Text>Sres:</Text>
            <Text mt={2} textAlign="justify">
              Por la presente solicito a Uds el otorgamiento de un crédito personal
              de ${formatoARS(prestamo.monto)} (
              {numeroALetras(prestamo.monto)}), más los importes que se devenguen
              en concepto de sellado (si correspondiere), que asciende al total de $
              {formatoARS(montoFinal)} ({numeroALetras(montoFinal)}), que me obligo
              a restituir en {cuotas} cuotas mensuales iguales y consecutivas, en
              adelante CUOTAS de ${formatoARS(montoCuota)} (
              {numeroALetras(montoCuota)}) cada una, calculada bajo el sistema de
              amortización francés, las que vencerán los días {diaPago} de cada
              mes, la primera de ellas pagadera {fechaPrimeraCuota}, las cuales
              abonaré <b>sin protesto</b>. Sobre el capital adeudado abonaré una
              tasa del {prestamo.tasaMoraAnual}% anual.
            </Text>
          </Box>

          <Divider my={4} />

          {/* DATOS */}
          <Text fontWeight="bold">DATOS DEL SOLICITANTE</Text>

          <Box mt={3}>
            <Text><b>Nombre:</b> {capitalize(cliente.name)}</Text>
            <Text><b>Apellido:</b> {capitalize(cliente.surname)}</Text>
            <Text><b>DNI:</b> {cliente.dni}</Text>
            <Text><b>Fecha de nacimiento:</b> {formatFecha(cliente.nacimiento)}</Text>
            <Text><b>CUIL:</b> {cliente.cuil}</Text>
            <Text><b>Dirección:</b> {capitalize(cliente.direccion)}</Text>
            <Text><b>Teléfono:</b> {cliente.phone}</Text>
            <Text><b>Email:</b> {cliente.email}</Text>
            <Text><b>Haber mensual:</b> ${formatoARS(cliente.sueldo)}</Text>
            <Text><b>Empleador:</b> {capitalize(cliente.lugarDeTrabajo)}</Text>
          </Box>

          <Divider my={4} />

          {/* TEXTO LEGAL */}
          <Box mt={2}>
            <Text textAlign="justify">
              A partir de la presentación al cobro, el importe adeudado devengará
              además un interés punitorio igual al 50% de la tasa indicada
              precedentemente y ambos serán capitalizados mensualmente. De
              conformidad con lo dispuesto en el artículo 36 del decreto Ley
              5965/63, se amplía el plazo de presentación a cinco años a contar
              de la fecha de libramiento del presente. El(los) librador(es) y
              avalista(s) se someten a la jurisdicción de los tribunales
              ordinarios de la provincia de Río Negro o a los correspondientes al
              domicilio del(los) librador(es) o al domicilio del(los) avalista(s),
              a opción de la prestadora.
            </Text>
          </Box>

          {/* FIRMA */}
          <Box mt={8} textAlign="center">
            <Text>Firma y aclaración del solicitante</Text>
            <Text mt="44px">_________________________</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}