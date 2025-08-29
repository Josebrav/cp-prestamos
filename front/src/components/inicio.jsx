import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Flex,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Inicio() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [logueado, setLogueado] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('logueado');
    if (isLoggedIn === 'true') setLogueado(true);
  }, []);

  const handleLogin = () => {
    if (usuario === 'anibal' && clave === 'norma01') {
      setLogueado(true);
      localStorage.setItem('logueado', 'true');
      setError('');
    } else {
      setError('Usuario o clave incorrectos');
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
      {!logueado ? (
        <Flex justify="center" align="center">
          <Box bg="white" p={6} borderRadius="md" boxShadow="lg" w="full" maxW="400px">
            <Stack spacing={4}>
              <Heading size="md" textAlign="center" color="gray.700">
                Iniciar Sesión
              </Heading>

              <FormControl isRequired>
                <FormLabel>Usuario</FormLabel>
                <Input
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Clave</FormLabel>
                <Input
                  type="password"
                  placeholder="Ingrese su clave"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                />
              </FormControl>

              {error && <Text color="red.500">{error}</Text>}

              <Button colorScheme="teal" mt={4} w="full" onClick={handleLogin}>
                Ingresar
              </Button>
            </Stack>
          </Box>
        </Flex>
      ) : (
        <Stack spacing={4} mt={4} align="center">
          <Button colorScheme="blue" w="60%" onClick={() => navigate('/personas')}>
            Personas
          </Button>
          <Button colorScheme="blue" w="60%" onClick={() => navigate('/prestamos')}>
            Préstamos
          </Button>
          <Button colorScheme="blue" w="60%" onClick={() => navigate('/registro-usuario')}>
            Registrar Persona
          </Button>
          <Button colorScheme="green" w="60%" onClick={() => navigate('/nuevo-prestamo')}>
            Nuevo Préstamo
          </Button>
          {/* <Button colorScheme="green" w="60%" onClick={() => navigate('/registrar-cuota')}>
            Registrar Cuota
          </Button> */}
          <Button colorScheme="green" w="60%" onClick={() => navigate('/administracion')}>
            Administración
          </Button>
          <Button colorScheme="green" w="60%" onClick={() => navigate('/reportes')}>
            Reportes
          </Button>
        </Stack>
      )}
    </Box>
  );
}
