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
  Button,
} from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPrinter } from "react-icons/fi";

const API_BASE = "http://192.168.1.48:3001";

export default function ReporteCuotasVencidasMes() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

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

        setCuotas(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al obtener cuotas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anio, mes]);

  // 🔹 FILTRO CORRECTO
 const cuotasFiltradas = cuotas
  .filter((c) => c.estadoPrestamo === "al dia")
  .sort((a, b) => a.numeroControl - b.numeroControl);

  // 🔹 TOTAL SOLO DE FILTRADAS
  const total = cuotasFiltradas.reduce(
    (acc, c) => acc + Number(c.monto || 0),
    0
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
      p={[4, 6, 8]}
      id="print-area"
    >
      <Button mb={4} colorScheme="gray" onClick={() => navigate(-1)}>
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
        <Heading size="lg" mb={4} textAlign="center">
          CUOTAS A COBRAR — {anio}/{mes}
        </Heading>

        {loading ? (
          <Box textAlign="center" mt={10}>
            <Spinner size="xl" />
          </Box>
        ) : cuotasFiltradas.length > 0 ? (
          <>
            <Table variant="striped" colorScheme="teal">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Cliente</Th>
                  <Th isNumeric>Monto</Th>
                  <Th>Fecha de Vencimiento</Th>
                  <Th>N° Préstamo</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cuotasFiltradas.map((c) => (
                  <Tr key={c.id}>
                    <Td>{c.cliente}</Td>
                    <Td isNumeric>
                      ${Number(c.monto).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Td>
                    <Td>
                      {new Date(c.fechaVencimiento).toLocaleDateString("es-AR", {
  timeZone: "UTC",
})}
                    </Td>
                    <Td>{c.numeroControl}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Box textAlign="right" mt={2} pr={4}>
              <Text fontWeight="bold" fontSize="lg">
                TOTAL = ${total.toLocaleString("es-AR")}
              </Text>
            </Box>
          </>
        ) : (
          <Text color="gray.600" textAlign="center">
            No hay cuotas de préstamos al día para el período seleccionado.
          </Text>
        )}
      </VStack>
    </Box>
  );
}