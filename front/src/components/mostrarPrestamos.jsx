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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';


export default function MostrarPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [cuotas, setCuotas] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');

  const fetchPrestamos = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/prestamos/todos');
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
      await axios.put(`http://localhost:3001/actualizarprestamo/${id}/estado`, {
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
    setPrestamoSeleccionado(id);
    onOpen();
  };

  // 🔹 Calcula el monto pendiente (suma de cuotas no pagadas)
  const calcularMontoPendiente = (cuotas = []) => {
    return cuotas
      .filter((c) => c.estado !== 'pagada')
      .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto), 0)
      .toFixed(2);
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
        {prestamosFiltrados.map((prestamo) => (
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
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  {prestamo.User?.name} {prestamo.User?.surname} - ${parseFloat(prestamo.monto).toLocaleString()}
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
                <Text><b>Monto Final:</b> ${parseFloat(prestamo.montoFinal).toLocaleString()}</Text>
               
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
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleEstado(prestamo.id, 'cancelado')}
                    >
                      Cancelar
                    </Button>
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
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cuotas del préstamo </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {cuotas.length > 0 ? (
              cuotas
                .slice()
                .sort((a, b) => a.numeroCuota - b.numeroCuota)
                .map((cuota, idx) => (
                  <Box key={idx} p={3} borderWidth="1px" borderRadius="md" mb={2}>
                    <Text><b>Fecha de vencimiento:</b> {cuota.fechaVencimiento}</Text>
                    <Text>
                      <b>Monto:</b> $
                      {Math.max(
                        parseFloat(cuota.monto) || 0,
                        parseFloat(cuota.montoConInteres) || 0
                      ).toLocaleString()}
                    </Text>
                    <Text><b>Estado:</b> {cuota.estado}</Text>
                    <Text><b>Cuota N°: {cuota.numeroCuota}</b></Text>
                  </Box>
                ))
            ) : (
              <Text>No hay cuotas disponibles.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
