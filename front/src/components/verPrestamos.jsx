// src/components/VerPrestamos.jsx
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Divider,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiPrinter, FiSearch } from "react-icons/fi";
import { IconButton } from "@chakra-ui/react";
import Contrato from "./contrato";
import logo from "../assets/cp.jpg";

import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

export default function VerPrestamos() {
  const { id } = useParams(); // id del usuario
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

  const formatMoney = (num) => {
    if (num === null || num === undefined) return "-";
    return Number(num).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (id) {
      fetchPrestamos();
      fetchCliente();
    }
  }, [id]);

  const fetchCliente = () => {
    setLoadingCliente(true);
    axios
      .get(`http://192.168.0.115:3001/usuario/${id}`)
      .then((res) => {
        setCliente(res.data);
        setLoadingCliente(false);
      })
      .catch((err) => {
        console.error("❌ Error al obtener cliente:", err);
        setLoadingCliente(false);
      });
  };

  useEffect(() => {
    fetchPrestamos();
  }, [id]);

  const fetchPrestamos = () => {
    axios
      .get(`http://192.168.0.115:3001/prestamos/usuario/${id}`)
      .then((res) => {
        setPrestamos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error al obtener préstamos:", err);
        setLoading(false);
      });
  };

  const calcularMontoPendiente = (cuotas = []) => {
    return cuotas
      .filter((c) => c.estado !== "pagada")
      .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto), 0);
  };

  const renderInfoCuotas = (cuotas = []) => {
    const total = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado === "pagada").length;
    const vencidas = cuotas.filter((c) => c.estado === "vencida").length;

    return (
      <Text>
        {pagadas}/{total}
        {vencidas > 0 && (
          <Text as="span" color="red.500">
            ({vencidas})
          </Text>
        )}
      </Text>
    );
  };
  <Box textAlign="center" mb={4}>
    {loadingCliente ? (
      <Spinner />
    ) : cliente ? (
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color="teal.600"
        cursor="pointer"
        _hover={{ textDecoration: "underline" }}
        onClick={onOpen}
      >
        {cliente.name} {cliente.surname}
      </Text>
    ) : (
      <Text color="red.500">Cliente no encontrado</Text>
    )}
  </Box>;

  const handleAccionPrestamo = (prestamoId, nuevoEstado) => {
    axios
      .put(`http://192.168.0.115:3001/actualizarprestamo/${prestamoId}/estado`, {
        estado: nuevoEstado,
      })
      .then(() => {
        setPrestamos((prev) =>
          prev.map((p) =>
            p.id === prestamoId ? { ...p, estado: nuevoEstado } : p
          )
        );
        Swal.fire("✅ Éxito", `Préstamo actualizado a "${nuevoEstado}"`, "success");
      })
      .catch((err) => {
        console.error(`❌ Error al actualizar préstamo:`, err);
        Swal.fire("❌ Error", "No se pudo actualizar el préstamo", "error");
      });
  };



  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      w="80%"
      maxW="1200px"
      mx="auto"
      bg="white"
      borderRadius="20px"
      borderTopRadius="0px"
      mt={0}
      p={6}
      pb="140px"
    >
      <Box display="flex" justifyContent="center">
        <Box
          bg="white"
          w={{ base: "100%", md: "80%", lg: "70%" }}
          borderRadius="lg"
          boxShadow="md"
          p={6}
        >
          <Text fontSize="3xl" fontWeight="bold" textAlign="center" mb={4}>
            Préstamos del Cliente
          </Text>
          <Divider mb={6} />

          {prestamos.length === 0 ? (
            <Text textAlign="center">Este cliente no tiene préstamos registrados.</Text>
          ) : (
            <Accordion allowMultiple>
              {prestamos
                .slice()
                .sort((a, b) => (b.numeroControl || 0) - (a.numeroControl || 0))
                .map((prestamo) => (
                  <AccordionItem
                    key={prestamo.id}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    mb={4}
                  >
                    <h2>
                      <AccordionButton _expanded={{ bg: "blue.50" }}>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="bold">
                            Préstamo #{prestamo.numeroControl || prestamo.id}
                          </Text>
                          <Text>Monto: ${formatMoney(prestamo.monto)}</Text>
                          <Text>Cuotas: {renderInfoCuotas(prestamo.cuotas)}</Text>
                          <Text>
                            Monto pendiente: $
                            {formatMoney(calcularMontoPendiente(prestamo.cuotas))}
                          </Text>
                          <Text>Estado: {prestamo.estado}</Text>
                          <Text>
                            Monto final: {formatMoney(prestamo.montoFinal ?? 0)}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                        {prestamo.estado === "pendiente" && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleAccionPrestamo(prestamo.id, "al dia")}
                          >
                            Aprobar
                          </Button>
                        )}
                        {prestamo.estado !== "cancelado" &&
                          prestamo.estado !== "finalizado" && (
                            <>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleAccionPrestamo(prestamo.id, "cancelado")}
                              >
                                Cancelar
                              </Button>

                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() =>
                                  handleAccionPrestamo(prestamo.id, "finalizado")
                                }
                              >
                                Finalizar
                              </Button>
                              
                            </>
                          )}
                        <Button
                          size="sm"
                          colorScheme="purple"
                          onClick={() => navigate(`/contrato/${prestamo.id}`)}
                        >
                          Ver Contrato
                        </Button>
                      </Box>

                      <Divider my={4} />

                      <Text fontWeight="bold" mb={2}>
                        Cuotas
                      </Text>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>N°</Th>
                            <Th>Vencimiento</Th>
                            <Th>Monto</Th>
                            <Th>Monto con Interés</Th>
                            <Th>Estado</Th>
                            <Th>Detalles</Th>
                            <Th>Imprimir</Th>
                          </Tr>
                        </Thead>

                        <Tbody>
                          {prestamo.cuotas
                            ?.slice()
                            .sort(
                              (a, b) =>
                                (a.numeroCuota ?? a.numero) -
                                (b.numeroCuota ?? b.numero)
                            )
                            .map((cuota, index, cuotasOrdenadas) => {
                              const num = cuota.numeroCuota ?? cuota.numero;

                              const isPaid = cuota.estado === "pagada";
                              const prevIsPaid =
                                index > 0
                                  ? cuotasOrdenadas[index - 1].estado === "pagada"
                                  : false;

                              const displayAmount = isPaid
                                ? cuota.montoPagado ??
                                  cuota.montoConInteres ??
                                  cuota.monto ??
                                  0
                                : cuota.montoConInteres ?? cuota.monto ?? 0;

                              const showLupa = isPaid;
                              const showPrinter =
                                index === 0 || isPaid || prevIsPaid;

                              return (
                                <Tr key={cuota.id}>
                                  <Td>{num}</Td>
                                  <Td>
                                    {new Date(
                                      cuota.fechaVencimiento
                                    ).toLocaleDateString()}
                                  </Td>
                                  <Td>${formatMoney(displayAmount)}</Td>
                                  <Td>
                                    $
                                    {formatMoney(
                                      cuota.montoConInteres ?? cuota.monto ?? 0
                                    )}
                                  </Td>
                                  <Td
                                    color={
                                      cuota.estado === "vencida"
                                        ? "red.500"
                                        : "inherit"
                                    }
                                  >
                                    {cuota.estado}
                                  </Td>

                                  <Td>
                                    {showLupa && (
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
                                              <p><b>Fecha de pago:</b> ${
                                                cuota.fechaPago
                                                  ? new Date(
                                                      cuota.fechaPago
                                                    ).toLocaleDateString()
                                                  : "-"
                                              }</p>
                                              <p><b>Monto pagado:</b> $${formatMoney(
                                                displayAmount
                                              )}</p>
                                              <p><b>Interés pagado:</b> $${formatMoney(
                                                cuota.interesPagado ?? 0
                                              )}</p>
                                            `,
                                            icon: "info",
                                          })
                                        }
                                      />
                                    )}
                                  </Td>

                                  <Td>
                                    {showPrinter && (
                                      <IconButton
                                        aria-label="Imprimir cuota"
                                        icon={<FiPrinter />}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={() =>
                                          navigate(`/cuota/${cuota.id}`)
                                        }
                                      />
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </Box>
      </Box>
    </Box>
  );
}
