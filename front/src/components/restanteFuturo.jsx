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

export default function RestanteFuturo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.0.115:3001/reportes/restante-futuro");
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
  const totalMonto = data.reduce((acc, item) => acc + Number(item.montoRestante), 0);

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
    >
      
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
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, idx) => (
              <Tr key={idx}>
                <Td>{item.numeroControl}</Td>
                <Td>{item.estado}</Td>
                <Td>{item.cuotasRestantes}</Td>
                <Td>${item.montoRestante}</Td>
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
