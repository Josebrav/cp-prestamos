import { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, Heading, Text, VStack, Button } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";

const API_BASE = "http://192.168.0.147:3001";

export default function ReporteSGP() {
    const [loading, setLoading] = useState(true);
    const [resumen, setResumen] = useState(null);
     const navigate = useNavigate();

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
      p={[4, 6, 8]}   // padding responsive
       id="print-area"
    >
       <Button onClick={() => navigate(-1)} colorScheme="gray">
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
