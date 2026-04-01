import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  VStack,
  Text,
  Button
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";



const API_BASE = "http://192.168.0.147:3001";

export default function TotalAcumulado() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/reportes/total-acumulado`);
        setData(res.data);
      } catch (error) {
        console.error("Error cargando reporte total a cobrar acumulado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // Calcular total
  const totalMonto = data.reduce((acc, item) => acc + Number(item.montoRestante), 0);

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
    <Button
  mb={4}
  colorScheme="gray"
  onClick={() => navigate(-1)}
>
  ← Volver
</Button>
  <Button
  mb={4}
  ml={2}
  colorScheme="blue"
  leftIcon={<FiPrinter />}
  onClick={handlePrint}
>
  Imprimir
</Button>
      <VStack align="stretch" spacing={4}>
        {/* Título del reporte */}
        <Heading size="lg" mb={4} textAlign="center">
          TOTAL A COBRAR ACUMULADO
        </Heading>

        {/* Tabla de datos */}
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>N° Control</Th>
              <Th>Estado</Th>
              <Th>Cuotas Vencidas</Th>
              <Th>Monto Adeudado</Th>
              <Th>Cliente</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, idx) => (
              <Tr key={idx}>
                <Td>{item.numeroControl}</Td>
                <Td>{item.estado}</Td>
                <Td>{item.cuotasRestantes}</Td>
                <Td>${Number(item.montoRestante).toLocaleString()}</Td>
                <Td>{item.cliente}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Total de montos */}
        <Box textAlign="right" mt={2} pr={4}>
          <Text fontWeight="bold" fontSize="lg" mr={"10%"}>
            TOTAL = ${totalMonto.toLocaleString()}
          </Text>
          
        </Box>
      </VStack>
    </Box>
  );
}
