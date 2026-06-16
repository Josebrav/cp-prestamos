// components/reportes/ReporteEnLegales.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPrinter } from "react-icons/fi";

const API_BASE = "http://192.168.1.48:3001";

export default function ReporteEnLegales() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Traemos todos los préstamos en estado "en legales"
        const res = await axios.get(`${API_BASE}/prestamoslegales`);
        setPrestamos(res.data || []);
      } catch (e) {
        console.error("Error al obtener préstamos en legales:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calcularResumenCuotas = (cuotas = []) => {
    const total = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado === "pagada").length;
    const vencidas = cuotas.filter((c) => c.estado === "vencida").length;
    const adeudado = cuotas
      .filter((c) => c.estado !== "pagada")
      .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto || 0), 0);

    return { total, pagadas, vencidas, adeudado };
  };
const handlePrint = () => {
  const contenido = document.getElementById("print-area").innerHTML;

  const ventana = window.open("", "", "width=900,height=700");

  ventana.document.write(`
    <html>
      <head>
        <title>Reporte</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            font-family: Arial;
            margin: 0;
            padding: 0;
          }

          .container {
            width: 100%;
            max-width: 100%;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* 🔥 CLAVE */
          }

          th, td {
            border: 1px solid black;
            padding: 5px;
            font-size: 11px; /* 🔥 achica un poco */
            word-wrap: break-word;
          }

          h1, h2 {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${contenido}
        </div>
      </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
  ventana.print();
};
  return (
     <Box
      w="80%"
      maxW="1200px"
      mx="auto"
    
      mb={6}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
       borderTopRadius={0}
      p={[4, 6, 8]}   // padding responsive
       id="print-area"
    >
      
      <VStack align="stretch" spacing={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Préstamos en legales
          </Text>
          <Button onClick={() => navigate(-1)}>Volver</Button>
            <Button
  mb={4}
  ml={2}
  colorScheme="blue"
  leftIcon={<FiPrinter />}
  onClick={handlePrint}
>
  Imprimir
</Button>
        </Box>

        {loading ? (
          <Box display="flex" alignItems="center" gap={3}>
            <Spinner /> <Text>Cargando...</Text>
          </Box>
        ) : prestamos.length > 0 ? (
          <Table variant="striped" bg="white" rounded="md" shadow="sm" size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>N° Control</Th>
                <Th>Cliente</Th>
                <Th>DNI</Th>
                <Th>Fecha Inicio</Th>
                <Th isNumeric>Monto</Th>
                <Th isNumeric>Adeudado</Th>
                <Th>Cuotas</Th>
                <Th>Vencidas</Th>
                <Th>Estado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {prestamos.map((p) => {
                const { total, pagadas, vencidas, adeudado } =
                  calcularResumenCuotas(p.cuotas);

                return (
                  <Tr key={p.id}>
                    <Td>{p.numeroControl}</Td>
                    <Td>
                      {p.User?.name} {p.User?.surname}
                    </Td>
                    <Td>{p.User?.dni ?? "—"}</Td>
                    <Td>{p.fechaInicio}</Td>
                    <Td isNumeric>{Number(p.monto).toFixed(2)}</Td>
                    <Td isNumeric>{adeudado.toFixed(2)}</Td>
                    <Td>
                      {pagadas}/{total}
                    </Td>
                    <Td color={vencidas > 0 ? "red.500" : "green.600"}>{vencidas}</Td>
                    <Td>{p.estado}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          <Text color="gray.600">
            No hay préstamos en legales.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
