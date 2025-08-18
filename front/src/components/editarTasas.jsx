// components/EditarTasas.jsx
import { useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button, VStack } from '@chakra-ui/react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001'; // Base URL para el back

export default function EditarTasas() {
  const [tasas, setTasas] = useState({ normal: '', veraz1: '', veraz2: '' });
  const [originalTasas, setOriginalTasas] = useState({});
  const [editing, setEditing] = useState({ normal: false, veraz1: false, veraz2: false });

  useEffect(() => {
    axios.get(`${API_BASE}/tasa`).then(res => {
      const data = {};
      res.data.forEach(entry => {
        data[entry.tipo] = entry.tasaAnual;
      });
      setTasas(data);
      setOriginalTasas(data);
    });
  }, []);

  const handleFocus = (tipo) => {
    setEditing(prev => ({ ...prev, [tipo]: true }));
    setTasas(prev => ({ ...prev, [tipo]: '' }));
  };

  const handleBlur = (tipo) => {
    setEditing(prev => ({ ...prev, [tipo]: false }));
    if (!tasas[tipo]) {
      setTasas(prev => ({ ...prev, [tipo]: originalTasas[tipo] }));
    }
  };

  const handleChange = (tipo, value) => {
    setTasas(prev => ({ ...prev, [tipo]: value }));
  };

  //const handleSubmit = async () => {
    //await Promise.all(
      //Object.entries(tasas).map(([tipo, tasaAnual]) =>
        //axios.put(`${API_BASE}/tasas/${tipo}`, { tasaAnual })
      //)
    //);
    //alert('Tasas actualizadas');
 // };
 const handleSubmit = async () => {
  try {
    await Promise.all(
      Object.entries(tasas).map(([tipo, tasaAnual]) =>
        axios.put(`${API_BASE}/tasas/${tipo}`, { tasaAnual: parseFloat(tasaAnual) })
      )
    );
    alert('Tasas actualizadas');
    setOriginalTasas(tasas); // Actualiza los originales con lo nuevo
  } catch (error) {
    console.error('Error guardando tasas:', error.response?.data || error.message);
    alert('Error al guardar las tasas');
  }
};


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
      {/* Contenedor centrado */}
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
        minH="60vh"  // opcional: para que quede centrado también verticalmente
      >
        <Box p={6} backgroundColor="white" rounded="md" shadow="md" width="400px">
          <VStack spacing={4} align="stretch">
            {['normal', 'veraz1', 'veraz2'].map(tipo => (
              <FormControl key={tipo}>
                <FormLabel fontWeight="bold">Tasa anual {tipo}</FormLabel>
                <Input
                  value={editing[tipo] ? tasas[tipo] : originalTasas[tipo] || ''}
                  onFocus={() => handleFocus(tipo)}
                  onBlur={() => handleBlur(tipo)}
                  onChange={(e) => handleChange(tipo, e.target.value)}
                  type="number"
                  color={editing[tipo] ? 'black' : 'gray.500'}
                />
              </FormControl>
            ))}
            <Button colorScheme="teal" onClick={handleSubmit}>
              Guardar Tasas
            </Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  );

}
