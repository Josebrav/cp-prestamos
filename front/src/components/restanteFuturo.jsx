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

export default function RestanteFuturo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.1.48:3001/reportes/restante-futuro");
        setData(res.data);
      } catch (error) {
        console.error("Error cargando reporte restante a futuro:", error);
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
  //const totalMonto = data.reduce((acc, item) => acc + Number(item.montoRestante), 0);
  const dataFiltrada = data.filter(
  (item) => item.estado === "vencido" || item.estado === "al dia"
);
const totalMonto = dataFiltrada.reduce(
  (acc, item) => acc + Number(item.montoRestante),
  0
);

const dataOrdenada = dataFiltrada.sort(
  (a, b) => Number(a.numeroControl) - Number(b.numeroControl)
);
  

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
           RESTANTE A COBRAR A FUTURO
        </Heading>

        {/* Tabla de datos */}
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>N° Control</Th>
              <Th>Estado</Th>
              <Th>Cuotas Restantes</Th>
              <Th>Monto Restante</Th>
              <Th>Cliente</Th>
              <Th>DNI</Th>
            </Tr>
          </Thead>
          <Tbody>
           {dataOrdenada.map((item, idx) => (
              <Tr key={idx}>
                <Td>{item.numeroControl}</Td>
                <Td>{item.estado}</Td>
                <Td>{item.cuotasRestantes}</Td>
                <Td>${item.montoRestante}</Td>
                <Td>{item.cliente}</Td>
                <Td>{item.dni}</Td>
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
