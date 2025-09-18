// components/reportes/ReportePrestamosMes.jsx
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
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3001";

export default function ReportePrestamosMes() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const anio = Number(sp.get("anio"));
  const mes = Number(sp.get("mes"));

  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!anio || !mes) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/prestamos/mes`, {
          params: { year: anio, month: mes },
        });
        setPrestamos(res.data || []);
      } catch (e) {
        console.error("Error al obtener préstamos del mes:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [anio, mes]);

  // Helpers
  const calcularResumenCuotas = (cuotas = []) => {
    const total = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado === "pagada").length;
    const vencidas = cuotas.filter((c) => c.estado === "vencida").length;
    const adeudado = cuotas
      .filter((c) => c.estado !== "pagada")
      .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto || 0), 0);

    return { total, pagadas, vencidas, adeudado };
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
    >
      
      <VStack align="stretch" spacing={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="2xl" fontWeight="bold">
            Préstamos confirmados — {anio}/{mes}
          </Text>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </Box>

        {(!anio || !mes) && (
          <Text color="red.500">Faltan parámetros de búsqueda (año y mes).</Text>
        )}

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
                    <Td color={vencidas > 0 ? "red.500" : "green.600"}>
                      {vencidas}
                    </Td>
                    <Td>{p.estado}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          <Text color="gray.600">
            No hay préstamos para el período seleccionado.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
