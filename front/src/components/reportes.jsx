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
  Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


export default function Reportes() {
  const navigate = useNavigate();

  // 🔐 Autenticación persistente
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === "anibal" && password === "norma01") {
      setIsAuthenticated(true);
      localStorage.setItem("auth", "true"); // 🔥 guarda sesión
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
  };

  // 📊 Estado para reportes
  const [reporte, setReporte] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const irAlReporte = () => {
    if (reporte === "prestamosMes") {
      navigate(`/reportes/prestamos-mes?anio=${anio}&mes=${mes}`);
      return;
    }
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

  // ===== LOGIN =====
  if (!isAuthenticated) {
    return (
      <Box
        w="80%"
        maxW="1200px"
        mx="auto"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgColor={"white"}
      >
        <Box
          w={["100%", "420px"]}
          bg="white"
          rounded="lg"
          shadow="md"
          p={6}
          borderWidth="1px"
        >
          <VStack spacing={4} align="stretch">
            <Text fontSize="xl" fontWeight="bold" textAlign="center">
              Autenticación requerida
            </Text>

            <FormControl>
              <FormLabel>Usuario</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </FormControl>

            {error && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {error}
              </Text>
            )}

            <Button colorScheme="teal" onClick={handleLogin} w="full">
              Ingresar
            </Button>

            {/* 🔙 Volver */}
            <Button onClick={() => navigate(-1)} variant="ghost">
              ← Volver
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // ===== PANTALLA PRINCIPAL =====
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
    >
      <VStack spacing={6} align="stretch">
        {/* 🔙 Volver + Logout */}
        <Stack direction="row" justify="space-between">
          <Button onClick={() => navigate(-1)} colorScheme="gray">
            ← Volver
          </Button>

          <Button onClick={handleLogout} colorScheme="red" size="sm">
            Cerrar sesión
          </Button>
        </Stack>

        <Text fontSize={["xl", "2xl"]} fontWeight="bold">
          Reportes
        </Text>

        <FormControl>
          <FormLabel>Seleccionar reporte</FormLabel>
          <Select
            value={reporte}
            onChange={(e) => setReporte(e.target.value)}
            placeholder="Elige un reporte"
          >
            <option value="prestamosMes">Préstamos confirmados en el mes</option>
            <option value="totalCobrarMes">Total a cobrar del mes</option>
            <option value="totalCobrarAcumulado">
              Total a cobrar acumulado
            </option>
            <option value="restanteFuturo">
              Restante a cobrar a futuro
            </option>
            <option value="legales">En legales</option>
            <option value="resumen">Resumen</option>
          </Select>
        </FormControl>

        {(reporte === "prestamosMes" ||
          reporte === "totalCobrarMes") && (
          <Stack direction={["column", "row"]} spacing={4}>
            <FormControl>
              <FormLabel>Año</FormLabel>
              <Input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mes</FormLabel>
              <Select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        <Button
          colorScheme="teal"
          onClick={irAlReporte}
          alignSelf={["stretch", "flex-start"]}
        >
          Generar Reporte
        </Button>
      </VStack>
    </Box>
  );
}