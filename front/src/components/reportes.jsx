// components/Reportes.jsx
import { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Reportes() {
  const navigate = useNavigate();

  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === "anibal" && password === "norma01") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  // Estado para reportes
  const [reporte, setReporte] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1); // 1-12

  const irAlReporte = () => {
    if (reporte === "prestamosMes") {
      navigate(`/reportes/prestamos-mes?anio=${anio}&mes=${mes}`);
      return;
    }
    // rutas futuras
    if (reporte === "totalCobrarMes") {
      navigate(`/reportes/total-mes?anio=${anio}&mes=${mes}`);
      return;
    }
       if (reporte === "totalCobrarAcumulado") {
      navigate(`/reportes/totalacumulado`);
      return;
    }
    if (reporte === "restanteFuturo") {
      navigate(`/reportes/restante-futuro`);
      return;
    }
    if (reporte === "legales") {
      navigate(`/reportes/legales`);
      return;
    }
    if (reporte === "resumen") {
      navigate(`/reportes/resumen`);
      return;
    }
  };

  // Login
  if (!isAuthenticated) {
    return (
      <Box
        h="50vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.50"
        ml="10%"
        mr="10%"
      >
        <Box p={6} backgroundColor="white" rounded="md" shadow="md" width="300px">
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">Autenticación requerida</Text>
            <FormControl>
              <FormLabel>Usuario</FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Contraseña</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            {error && <Text color="red.500">{error}</Text>}
            <Button colorScheme="teal" onClick={handleLogin}>Ingresar</Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Pantalla principal
  return (
    <Box
      h="50vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      ml="10%"
      mr="10%"
    >
      <VStack spacing={6} align="stretch" w="100%" p={"30%"}>
        <Text fontSize="2xl" fontWeight="bold">Reportes</Text>

        <FormControl>
          <FormLabel>Seleccionar reporte</FormLabel>
          <Select
            value={reporte}
            onChange={(e) => setReporte(e.target.value)}
            placeholder="Elige un reporte"
          >
            <option value="prestamosMes">Préstamos confirmados en el mes</option>
            <option value="totalCobrarMes">Total a cobrar del mes</option>
            <option value="totalCobrarAcumulado">Total a cobrar acumulado</option>
            <option value="restanteFuturo">Restante a cobrar a futuro</option>
            <option value="legales">En legales</option>
            <option value="resumen">Resumen</option>
          </Select>
        </FormControl>

        {(reporte === "prestamosMes" || reporte === "totalCobrarMes") && (
          <Box display="flex" gap={4}>
            <FormControl>
              <FormLabel>Año</FormLabel>
              <Input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Mes</FormLabel>
              <Select value={mes} onChange={(e) => setMes(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Button colorScheme="teal" onClick={irAlReporte}>
          Generar Reporte
        </Button>
      </VStack>
    </Box>
  );
}
