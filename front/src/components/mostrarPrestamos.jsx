import {
  Box,
  Text,
  Heading,
  Spinner,
  Center,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Select,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FiPrinter, FiSearch } from 'react-icons/fi';


export default function MostrarPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [cuotas, setCuotas] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');

  const formatMoney = (num) => {
    if (num === null || num === undefined) return "-";
    return Number(num).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchPrestamos = async () => {
    try {
      const { data } = await axios.get('http://192.168.1.48:3001/prestamos/todos');
      setPrestamos(data);
    } catch (error) {
      console.error('Error al obtener préstamos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const handleEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`http://192.168.1.48:3001/actualizarprestamo/${id}/estado`, {
        estado: nuevoEstado,
      });
      Swal.fire('Actualizado', `Préstamo marcado como "${nuevoEstado}"`, 'success');
      fetchPrestamos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el préstamo', 'error');
    }
  };

 
  const handleVerCuotas = (id) => {
    const prestamo = prestamos.find((p) => p.id === id);
    setCuotas(prestamo.cuotas || []);
    setPrestamoSeleccionado(prestamo);
    onOpen();
  };

  // 🔹 Calcula el monto pendiente (suma de cuotas no pagadas)
 const calcularMontoPendiente = (cuotas = []) => {
  const total = cuotas
    .filter((c) => c.estado !== 'pagada')
    .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto), 0);

  return total.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

  // 🔹 Calcula cuotas pagadas/total y vencidas
  const calcularInfoCuotas = (cuotas = []) => {
    const total = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado === 'pagada').length;
    const vencidas = cuotas.filter((c) => c.estado === 'vencida').length;

    return `${pagadas}/${total}${vencidas > 0 ? ` (${vencidas} vencidas)` : ''}`;
  };

  const prestamosFiltrados =
    estadoFiltro === 'todos'
      ? prestamos
      : prestamos.filter((p) => p.estado === estadoFiltro);

  // Mapa de usuarios que tienen al menos un préstamo 'en legales'
  const usuariosEnLegales = prestamos.reduce((acc, p) => {
    const uid = p.User?.id;
    if (!uid) return acc;
    if (!acc[uid] && p.estado === 'en legales') acc[uid] = true;
    return acc;
  }, {});

  // Mover préstamos 'cancelado' al final sin alterar el orden relativo de los demás
  const prestamosMostrados = prestamosFiltrados.slice().sort((a, b) => {
    if (a.estado === 'cancelado' && b.estado !== 'cancelado') return 1;
    if (b.estado === 'cancelado' && a.estado !== 'cancelado') return -1;
    return 0;
  });

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
 

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
      <Button
        mb={4}
        colorScheme="gray"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </Button>
      <Heading mb={4} fontSize="2xl" textAlign="center">
        Lista de Préstamos
      </Heading>

      <Select
        maxW="300px"
        mb={6}
        onChange={(e) => setEstadoFiltro(e.target.value)}
        value={estadoFiltro}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
      >
        <option value="todos">Todos</option>
        <option value="al dia">Al día</option>
        <option value="vencido">Vencido</option>
        <option value="cancelado">Cancelado</option>
        <option value="pendiente">Pendiente</option>
        <option value="en legales">En legales</option>
      </Select>

      <Accordion allowMultiple>
        {prestamosMostrados.map((prestamo) => (
          <AccordionItem
            key={prestamo.id}
            bg={bgColor}
            borderRadius="xl"
            mb={4}
            boxShadow="md"
            _hover={{ boxShadow: 'xl', transform: 'scale(1.02)' }}
            transition="0.2s"
          >
            <h2>
              <AccordionButton>
                <Box display="flex" alignItems="center" flex="1">
                  <Box mr={4} w="90px" fontWeight="semibold" color="gray.600">
                    N° {prestamo.numeroControl ?? '-'}
                  </Box>
                  <Box textAlign="left" fontWeight="bold" fontSize="lg">
                    {prestamo.User?.name} {prestamo.User?.surname}
                    {usuariosEnLegales[prestamo.User?.id] && (
                      <Text as="span" ml={3} fontSize="sm" color="red.500" fontWeight="semibold">
                        Tiene préstamos en legales
                      </Text>
                    )} - ${parseFloat(prestamo.monto).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Box>
                </Box>
                <Box
                  fontWeight="semibold"
                  color={
                    prestamo.estado === 'vencido'
                      ? 'red.500'
                      : prestamo.estado === 'pendiente'
                        ? 'orange.500'
                        : prestamo.estado === 'cancelado'
                          ? 'gray.500'
                          : prestamo.estado === 'en legales'
                            ? 'black'
                            : 'green.500'
                  }
                  mr={4}
                  textTransform="capitalize"
                >
                  {prestamo.estado}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={2}>
                <Text><b>Fecha Inicio:</b> {prestamo.fechaInicio}</Text>
                <Text><b>Monto Final:</b> ${parseFloat(prestamo.montoFinal).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
               
                <Text><b>Tipo de Tasa:</b> {prestamo.tipoTasa}</Text>
                <Text><b>Tasa Mora Anual:</b> {prestamo.tasaMoraAnual}%</Text>
                <Text><b>Monto Pendiente:</b> ${calcularMontoPendiente(prestamo.cuotas)}</Text>
                <Text><b>Cuotas:</b> {calcularInfoCuotas(prestamo.cuotas)}</Text>
                <Text><b>Estado:</b>
                  <Text
                    as="span"
                    color={
                      prestamo.estado === 'vencido'
                        ? 'red.500'
                        : prestamo.estado === 'pendiente'
                          ? 'orange.500'
                          : prestamo.estado === 'cancelado'
                            ? 'gray.500'
                            : prestamo.estado === 'en legales'
                              ? 'black'
                              : 'green.500'
                    }
                    fontWeight="semibold"
                    textTransform="capitalize"
                  >
                    {prestamo.estado}
                  </Text>
                </Text>

                <HStack mt={4} spacing={3}>
                  {prestamo.estado !== 'cancelado' && (
                    (() => {
                      const tienePagos = (prestamo.cuotas || []).some(c => (c.PagoCuota && c.PagoCuota.length > 0) || Number(c.montoPagado || 0) > 0);
                      return (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleEstado(prestamo.id, 'cancelado')}
                          isDisabled={tienePagos}
                          title={tienePagos ? 'No se puede cancelar: existen pagos en este préstamo' : 'Finalizar préstamo'}
                        >
                          Cancelar
                        </Button>
                      );
                    })()
                  )}
                  {prestamo.estado === 'pendiente' && (
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleEstado(prestamo.id, 'al dia')}
                    >
                      Aprobar
                    </Button>
                  )}
                 
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleVerCuotas(prestamo.id)}
                  >
                    Ver cuotas
                  </Button>
                 
                </HStack>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Modal para cuotas */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cuotas del préstamo</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {cuotas.length > 0 && prestamoSeleccionado ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>N°</Th>
                      <Th>Vencimiento</Th>
                      <Th>Monto</Th>
                      <Th>Monto con Interés o Restante</Th>
                      <Th>Estado</Th>
                      <Th>Pagos parciales</Th>
                      <Th>Pago total</Th>
                      <Th>Pagar e Imprimir</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cuotas
                      .slice()
                      .sort((a, b) => (a.numeroCuota ?? a.numero) - (b.numeroCuota ?? b.numero))
                      .map((cuota, index, cuotasOrdenadas) => {
                        const num = cuota.numeroCuota ?? cuota.numero;
                        const prestamoCancelado = prestamoSeleccionado.estado === "cancelado";
                        const isPaid = cuota.estado === "pagada";
                        const prevIsPaid = index > 0 ? cuotasOrdenadas[index - 1].estado === "pagada" : false;

                        const displayAmount = isPaid
                          ? cuota.montoPagado ?? cuota.montoConInteres ?? cuota.monto ?? 0
                          : cuota.estado === "vencida"
                            ? cuota.monto ?? 0
                            : cuota.monto ?? 0;

                        const showLupa = isPaid;
                        const showPrinter = (index === 0 || isPaid || prevIsPaid) && prestamoSeleccionado.estado !== "pendiente";
                        const tienePagos = cuota.PagoCuota?.length > 0;

                        return (
                          <Tr key={cuota.id}>
                            <Td>{num}</Td>
                            <Td>{cuota.fechaVencimiento}</Td>
                            <Td>${formatMoney(displayAmount)}</Td>
                            <Td>${formatMoney(cuota.montoConInteres ?? cuota.monto ?? 0)}</Td>
                            <Td color={cuota.estado === "vencida" ? "red.500" : "inherit"}>
                              {cuota.estado}
                            </Td>
                            <Td>
                              {tienePagos && !prestamoCancelado ? (
                                <Button
                                  size="xs"
                                  colorScheme="orange"
                                  onClick={() => {
                                    const detalle = cuota.PagoCuota.map(
                                      (p) => `
                                        <p><b>Fecha:</b> ${new Date(p.fechaPago).toLocaleDateString("es-AR", { timeZone: "UTC" })}</p>
                                        <p><b>Monto:</b> $${formatMoney(p.monto)}</p>
                                        <hr/>
                                      `
                                    ).join("");

                                    Swal.fire({
                                      title: `Pagos - Cuota ${num}`,
                                      html: detalle,
                                      width: 500,
                                    });
                                  }}
                                >
                                  Ver
                                </Button>
                              ) : (
                                "-"
                              )}
                            </Td>
                            <Td>
                              {showLupa && !prestamoCancelado && (
                                <IconButton
                                  aria-label="Ver detalles de pago"
                                  icon={<FiSearch />}
                                  size="sm"
                                  colorScheme="teal"
                                  variant="outline"
                                  onClick={() =>
                                    Swal.fire({
                                      title: `Cuota #${num}`,
                                      html: `
                                        <p><b>Fecha de pago:</b> ${cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}</p>
                                        <p><b>Monto pagado:</b> $${formatMoney(displayAmount)}</p>
                                        <p><b>Interés pagado:</b> $${formatMoney(cuota.interesPagado ?? 0)}</p>
                                      `,
                                      icon: "info",
                                    })
                                  }
                                />
                              )}
                            </Td>
                            <Td>
                              {showPrinter && !prestamoCancelado && (
                                <IconButton
                                  aria-label="Imprimir cuota"
                                  icon={<FiPrinter />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => navigate(`/cuota/${cuota.id}`)}
                                />
                              )}
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text>No hay cuotas disponibles.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
