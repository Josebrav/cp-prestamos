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
  Text
} from "@chakra-ui/react";

const API_BASE = "http://localhost:3001";

export default function TotalAcumulado() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box minH="60vh" bg="gray.50" ml="10%" mr="10%" py={8}>
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
