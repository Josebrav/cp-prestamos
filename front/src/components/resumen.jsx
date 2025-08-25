import { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, Heading, Text, VStack } from "@chakra-ui/react";
import axios from "axios";

const API_BASE = "http://localhost:3001";

export default function ReporteSGP() {
    const [loading, setLoading] = useState(true);
    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE}/resumen`);
                setResumen(res.data);
            } catch (err) {
                console.error("Error al cargar resumen SGP:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <Box textAlign="center" mt={10}><Spinner size="xl" /></Box>;
    }

    if (!resumen) {
        return <Text textAlign="center">No hay datos disponibles</Text>;
    }

    return (
        <Box minH="60vh" bg="gray.50" ml="10%" mr="10%" py={8}>
            <VStack align="stretch" spacing={4}>
                <Heading size="lg" mb={4} textAlign="center">REPORTE SGP</Heading>

                <Box bg="white" p={4} rounded="md" shadow="sm">
                    <Table variant="simple" border={"1px"} borderColor={"black"} >
                        <Tbody >
                            <Tr>
                                <Td fontWeight="bold">Préstamos entregados este mes</Td>
                                <Td>
                                     {resumen.prestamosMes.cantidad} préstamos <br />
                                    Dinero entregado: ${resumen.prestamosMes.dineroEntregado.toLocaleString()} <br />
                                    Dinero a cobrar: ${resumen.prestamosMes.dineroACobrar.toLocaleString()}
                                </Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold">Total a cobrar del mes actual</Td>
                                <Td>
                                   ${resumen.totalCobrarMes.monto.toLocaleString()} en {resumen.totalCobrarMes.prestamos} prestamos
                                </Td>
                            </Tr>

                           <Tr>
  <Td fontWeight="bold">Total a cobrar acumulado</Td>
  <Td>${resumen.totalAcumulado.monto.toLocaleString()} en {resumen.totalAcumulado.prestamos} prestamos</Td>
</Tr>

<Tr>
  <Td fontWeight="bold" borderBottom="1px solid black">Restante a cobrar a futuro</Td>
  <Td borderBottom="1px solid black">${resumen.restanteFuturo.monto.toLocaleString()} en {resumen.restanteFuturo.prestamos} prestamos</Td>
</Tr>
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </Box>
    );
}
