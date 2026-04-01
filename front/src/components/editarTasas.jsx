import { useEffect, useState } from 'react';
import { 
  Box, FormControl, FormLabel, Input, Button, VStack, Text, HStack 
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://192.168.0.147:3001';

export default function EditarTasas() {
  // Estado de tasas
  const [tasas, setTasas] = useState({ normal: '', veraz1: '', veraz2: '' });
  const [originalTasas, setOriginalTasas] = useState({});
  const [editing, setEditing] = useState({ normal: false, veraz1: false, veraz2: false });

  // Estado de quitas
  const [quitas, setQuitas] = useState({ tipo1: '', tipo2: '' });
  const [originalQuitas, setOriginalQuitas] = useState({});
  const [editingQuitas, setEditingQuitas] = useState({ tipo1: false, tipo2: false });

  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Pasar a legales
  const [numeroControl, setNumeroControl] = useState('');

  // --- BORRAR PRÉSTAMO (ADMIN) ---
const [numeroControlBorrar, setNumeroControlBorrar] = useState('');

// Acción directa (como pasar a legales)
const borrarPrestamoPorNumeroControl = async () => {
  if (!numeroControlBorrar) return alert("Ingrese un número de control");
  try {
    await axios.delete(`${API_BASE}/prestamos/numero-control/${numeroControlBorrar}`);
    alert(`Préstamo ${numeroControlBorrar} borrado correctamente`);
    setNumeroControlBorrar('');
  } catch (error) {
    console.error(error);
    alert("No se pudo borrar el préstamo");
  }
};



  // Login simple
  const handleLogin = () => {
    if (username === 'anibal' && password === 'norma01') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  // Obtener tasas + quitas al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      axios.get(`${API_BASE}/tasa`).then(res => {
        const data = {};
        res.data.forEach(entry => data[entry.tipo] = entry.tasaAnual);
        setTasas(data);
        setOriginalTasas(data);
      });

      axios.get(`${API_BASE}/quitas`).then(res => {
        const data = {};
        res.data.forEach(entry => data[entry.tipo] = entry.porcentaje);
        setQuitas(data);
        setOriginalQuitas(data);
      });
    }
  }, [isAuthenticated]);

  // Funciones de input tasas
  const handleFocusTasas = (tipo) => {
    setEditing(prev => ({ ...prev, [tipo]: true }));
    setTasas(prev => ({ ...prev, [tipo]: '' }));
  };

  const handleBlurTasas = (tipo) => {
    setEditing(prev => ({ ...prev, [tipo]: false }));
    if (!tasas[tipo]) {
      setTasas(prev => ({ ...prev, [tipo]: originalTasas[tipo] }));
    }
  };

  const handleChangeTasas = (tipo, value) => {
    setTasas(prev => ({ ...prev, [tipo]: value }));
  };

  const handleSubmitTasas = async () => {
    try {
      await Promise.all(
        Object.entries(tasas).map(([tipo, tasaAnual]) =>
          axios.put(`${API_BASE}/tasas/${tipo}`, { tasaAnual: parseFloat(tasaAnual) })
        )
      );
      alert('Tasas actualizadas');
      setOriginalTasas(tasas);
    } catch (error) {
      console.error('Error guardando tasas:', error.response?.data || error.message);
      alert('Error al guardar las tasas');
    }
  };

  // Funciones de input quitas
  const handleFocusQuitas = (tipo) => {
    setEditingQuitas(prev => ({ ...prev, [tipo]: true }));
    setQuitas(prev => ({ ...prev, [tipo]: '' }));
  };

  const handleBlurQuitas = (tipo) => {
    setEditingQuitas(prev => ({ ...prev, [tipo]: false }));
    if (!quitas[tipo]) {
      setQuitas(prev => ({ ...prev, [tipo]: originalQuitas[tipo] }));
    }
  };

  const handleChangeQuitas = (tipo, value) => {
    setQuitas(prev => ({ ...prev, [tipo]: value }));
  };

  const handleSubmitQuitas = async () => {
    try {
      await Promise.all(
        Object.entries(quitas).map(([tipo, porcentaje]) =>
          axios.put(`${API_BASE}/quitas/${tipo}`, { porcentaje: parseFloat(porcentaje) })
        )
      );
      alert('Quitas actualizadas');
      setOriginalQuitas(quitas);
    } catch (error) {
      console.error('Error guardando quitas:', error.response?.data || error.message);
      alert('Error al guardar las quitas');
    }
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return (
         <Box
        w="80%"
        maxW="1200px"
        mx="auto"
        
        mb={6}
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
            <Button
  mb={4}
  colorScheme="gray"
  onClick={() => navigate(-1)}
>
  ← Volver
</Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Pasar a legales
  const pasarALegales = async () => {
    if (!numeroControl) return alert("Ingrese un número de control");
    try {
      await axios.put(`${API_BASE}/prestamoenlegales`, { numeroControl });
      alert(`Préstamo ${numeroControl} pasado a legales`);
      setNumeroControl('');
    } catch (error) {
      console.error(error);
      alert("Error al pasar préstamo a legales");
    }
  };

  // Componente principal autenticado
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
      
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Box p={6} bg="white" rounded="md" shadow="md" width="700px">
          <VStack spacing={6} align="stretch">

            {/* Formulario de tasas */}
            {['normal', 'veraz1', 'veraz2'].map(tipo => (
              <FormControl key={tipo}>
                <FormLabel fontWeight="bold">Tasa anual {tipo}</FormLabel>
                <Input
                  value={editing[tipo] ? tasas[tipo] : originalTasas[tipo] || ''}
                  onFocus={() => handleFocusTasas(tipo)}
                  onBlur={() => handleBlurTasas(tipo)}
                  onChange={(e) => handleChangeTasas(tipo, e.target.value)}
                  type="number"
                  color={editing[tipo] ? 'black' : 'gray.500'}
                />
              </FormControl>
            ))}
            <Button colorScheme="teal" onClick={handleSubmitTasas}>Guardar Tasas</Button>

            {/* Sección Quitas */}
            <Box p={4} bg="gray.50" rounded="md" shadow="sm">
              <Text fontWeight="bold" mb={2}>Quita porcentaje de intereses</Text>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Tipo 1</FormLabel>
                  <Input
                    w={"100px"}
                    type="number"
                    value={editingQuitas.tipo1 ? quitas.tipo1 : originalQuitas.tipo1 || ''}
                    onFocus={() => handleFocusQuitas('tipo1')}
                    onBlur={() => handleBlurQuitas('tipo1')}
                    onChange={(e) => handleChangeQuitas('tipo1', e.target.value)}
                    color={editingQuitas.tipo1 ? 'black' : 'gray.500'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo 2</FormLabel>
                  <Input
                    w={"100px"}
                    type="number"
                    value={editingQuitas.tipo2 ? quitas.tipo2 : originalQuitas.tipo2 || ''}
                    onFocus={() => handleFocusQuitas('tipo2')}
                    onBlur={() => handleBlurQuitas('tipo2')}
                    onChange={(e) => handleChangeQuitas('tipo2', e.target.value)}
                    color={editingQuitas.tipo2 ? 'black' : 'gray.500'}
                  />
                </FormControl>
              </HStack>
              <Button mt={4} colorScheme="orange" onClick={handleSubmitQuitas}>
                Guardar Quitas
              </Button>
            </Box>

            {/* Pasar a legales */}
            <Box p={4} bg="gray.50" rounded="md" shadow="sm">
              <Text fontWeight="bold" mb={2}>Pasar préstamo a legales</Text>
              <FormControl>
                <FormLabel>Número de control</FormLabel>
                <Input type="text" placeholder="Número de control" value={numeroControl} onChange={(e) => setNumeroControl(e.target.value)} />
              </FormControl>
              <Button mt={2} colorScheme="red" onClick={pasarALegales}>Pasar a legales</Button>
            </Box>

{/* Borrar préstamo (Administración) */}
<Box p={4} bg="red.50" rounded="md" shadow="sm" borderWidth="1px" borderColor="red.200">
  <Text fontWeight="bold" mb={2} color="red.700">
    Borrar préstamo (acción irreversible)
  </Text>

  <FormControl>
    <FormLabel>Número de control</FormLabel>
    <Input
      type="text"
      placeholder="Número de control"
      value={numeroControlBorrar}
      onChange={(e) => setNumeroControlBorrar(e.target.value)}
    />
  </FormControl>

  <Button mt={3} colorScheme="red" onClick={borrarPrestamoPorNumeroControl}>
    Borrar préstamo
  </Button>
</Box>

          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
