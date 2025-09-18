import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://192.168.0.115:3001";

export default function ReporteCuotasVencidasMes() {
  const [sp] = useSearchParams();
  const anio = Number(sp.get("anio"));
  const mes = Number(sp.get("mes"));

  const [loading, setLoading] = useState(true);
  const [cuotas, setCuotas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!anio || !mes) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/prestamos/acobrar/mes`, {
          params: { year: anio, month: mes },
        });
        setCuotas(res.data || []);
      } catch (err) {
        console.error("Error al obtener cuotas vencidas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anio, mes]);

  // Total de montos
  const total = cuotas.reduce((acc, c) => acc + Number(c.monto), 0);

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
        <Heading size="lg" mb={4} textAlign="center">
          CUOTAS A COBRAR — {anio}/{mes}
        </Heading>

        {loading ? (
          <Box textAlign="center" mt={10}>
            <Spinner size="xl" />
          </Box>
        ) : cuotas.length > 0 ? (
          <>
            <Table variant="striped" colorScheme="teal">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Cliente</Th>
                  <Th isNumeric>Monto</Th>
                  <Th>Fecha de Vencimiento</Th>
                  <Th>Numero de prestamo</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cuotas.map((c) => (
                  <Tr key={c.id}>
                    <Td>{c.cliente}</Td>
                    <Td isNumeric>${Number(c.monto).toFixed(2)}</Td>
                    <Td>{new Date(c.fechaVencimiento).toLocaleDateString()}</Td>
                    <Td>{c.numeroControl}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Box textAlign="right" mt={2} pr={4}>
              <Text fontWeight="bold" fontSize="lg">
                TOTAL = ${total.toLocaleString()}
              </Text>
            </Box>
          </>
        ) : (
          <Text color="gray.600" textAlign="center">
            No hay cuotas vencidas para el período seleccionado.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
