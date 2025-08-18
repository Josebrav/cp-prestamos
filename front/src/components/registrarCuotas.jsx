import { useState } from "react";
import {
  Box,
  Input,
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Heading,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import axios from "axios";

export default function RegistrarCuotas() {
  const [dni, setDni] = useState("");
  const [prestamos, setPrestamos] = useState([]);

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const montoAPagar = (cuota) => {
    const base = parseFloat(cuota.monto) || 0;
    const conInteres = cuota.montoConInteres != null ? parseFloat(cuota.montoConInteres) : base;
    return Math.max(base, conInteres);
  };

  const buscarUsuario = async () => {
    try {
      const { data } = await axios.post("http://localhost:3001/buscar-dni", { dni });

      const prestamosActivos =
        data.Prestamos?.filter((p) =>
          ["al dia", "vencido", "en legales"].includes(p.estado)
        ) || [];

      if (prestamosActivos.length === 0) {
        alert("No tiene préstamos activos");
        setPrestamos([]);
        return;
      }

      // Ordenar cuotas por numeroCuota ascendente
      const prestamosOrdenados = prestamosActivos.map((prestamo) => ({
        ...prestamo,
        cuotas: prestamo.cuotas
          ? [...prestamo.cuotas].sort((a, b) => a.numeroCuota - b.numeroCuota)
          : [],
      }));

      setPrestamos(prestamosOrdenados);
    } catch (error) {
      console.error(error);
      alert("No se encontró el usuario o no tiene préstamos activos");
    }
  };

  const cambiarEstadoCuota = async (cuotaId, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:3001/cuotas/${cuotaId}/estado`, { estado: nuevoEstado });
      setPrestamos((prev) =>
        prev.map((prestamo) => ({
          ...prestamo,
          cuotas: prestamo.cuotas.map((c) =>
            c.id === cuotaId ? { ...c, estado: nuevoEstado } : c
          ),
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado de la cuota");
    }
  };

  return (
    <Box
      // Igual que el header
      w="80%"           // o el mismo valor que uses en el Header
      maxW="1200px"     // igual que Header
      mx="auto"         // centrado
      bg="white"
      borderRadius="20px"
      borderTopRadius={"0px"}
      mt={0}            // pegado al header
      p={6}
      pb={"140px"}
    >
      <Heading mb={4}>Registrar pago de cuotas</Heading>

      <Stack direction="row" mb={4}>
        <Input
          placeholder="Ingresar DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        <Button onClick={buscarUsuario} colorScheme="blue">
          Buscar
        </Button>
      </Stack>

      <Accordion allowMultiple>
        {prestamos.map((prestamo) => (
          <AccordionItem
            key={prestamo.id}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            mb={4}
          >
            <h2>
              <AccordionButton _expanded={{ bg: "blue.100" }}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  Monto: ${formatMoney(prestamo.monto)} - Fecha Inicio:{" "}
                  {new Date(prestamo.fechaInicio).toLocaleDateString()} - Estado: {prestamo.estado}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Cuota</Th>
                    <Th>Vencimiento</Th>
                    <Th>Monto</Th>
                    <Th>Estado</Th>
                    <Th>Acción</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {prestamo.cuotas.map((cuota) => (
                    <Tr key={cuota.id}>
                      <Td>{cuota.numeroCuota}</Td>
                      <Td>{new Date(cuota.fechaVencimiento).toLocaleDateString()}</Td>
                      <Td>${formatMoney(montoAPagar(cuota))}</Td>
                      <Td>{cuota.estado}</Td>
                      <Td>
                        {cuota.estado !== "pagada" && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => cambiarEstadoCuota(cuota.id, "pagada")}
                          >
                            Marcar como pagada
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}
