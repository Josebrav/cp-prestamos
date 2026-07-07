import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  Stack,
  Box,
  Heading,
  Select,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const PrestamoForm = () => {
  const [monto, setMonto] = useState('');
 const [fecha, setFecha] = useState(() => {
  return new Date().toISOString().split("T")[0];
});
  const [cuotas, setCuotas] = useState('');
  const [tipoTasa, setTipoTasa] = useState('normal');
  const [dni, setDni] = useState('');
  const [apellido, setApellido] = useState('');
  const [userId, setUserId] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);
  const [usuariosMultiples, setUsuariosMultiples] = useState([]);
  const [mostrarSelect, setMostrarSelect] = useState(false);

  const [tasas, setTasas] = useState({}); // 👈 guardamos tasas desde backend
  const navigate = useNavigate();
console.log("HOY raw:", new Date());
console.log("HOY ISO:", new Date().toISOString());
console.log("HOY sv-SE:", new Date().toLocaleDateString("sv-SE"));
  // 🔹 Obtener tasas al cargar
  useEffect(() => {
    const fetchTasas = async () => {
      try {
        const res = await axios.get("http://192.168.1.48:3001/tasa"); // 👈 endpoint para traer todas las tasas
        const tasasObj = {};
        res.data.forEach(t => {
          tasasObj[t.tipo] = parseFloat(t.tasaAnual);
        });
        setTasas(tasasObj);
      } catch (error) {
        console.error("Error cargando tasas:", error);
      }
    };
    fetchTasas();
  }, []);

  const buscarUsuarioPorDni = async () => {
    try {
      const res = await axios.post('http://192.168.1.48:3001/buscar-dni', { dni });
      const user = res.data;

      setUserId(user.id);
      setNombreUsuario(
        user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'
      );
      setUsuarioEncontrado(true);
      setMostrarSelect(false);
      setUsuariosMultiples([]);

      Swal.fire({
        icon: 'success',
        title: 'Usuario encontrado',
        text: `Usuario: ${user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'}`,
      });
    } catch (error) {
      setUsuarioEncontrado(false);
      setNombreUsuario('');
      setUserId('');
      setMostrarSelect(false);
      setUsuariosMultiples([]);
      Swal.fire({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const buscarUsuariosPorApellido = async () => {
    try {
      const res = await axios.post('http://192.168.1.48:3001/buscar-apellido', { surname: apellido });
      const users = res.data;

      if (users.length === 1) {
        // Si solo hay un usuario, seleccionarlo automáticamente
        const user = users[0];
        setUserId(user.id);
        setNombreUsuario(
          user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'
        );
        setUsuarioEncontrado(true);
        setMostrarSelect(false);
        setUsuariosMultiples([]);

        Swal.fire({
          icon: 'success',
          title: 'Usuario encontrado',
          text: `Usuario: ${user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'}`,
        });
      } else if (users.length > 1) {
        // Si hay múltiples usuarios, mostrar select
        setUsuariosMultiples(users);
        setMostrarSelect(true);
        setUsuarioEncontrado(false);
        setUserId('');
        setNombreUsuario('');
      }
    } catch (error) {
      setUsuarioEncontrado(false);
      setNombreUsuario('');
      setUserId('');
      setMostrarSelect(false);
      setUsuariosMultiples([]);
      Swal.fire({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const handleSeleccionarUsuario = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      const selectedUser = usuariosMultiples.find(u => u.id === selectedId);
      setUserId(selectedUser.id);
      setNombreUsuario(
        selectedUser.name && selectedUser.surname ? `${selectedUser.name} ${selectedUser.surname}` : 'Nombre no disponible'
      );
      setUsuarioEncontrado(true);
      setMostrarSelect(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const prestamoData = {
        userId,
        monto: parseFloat(monto),
        fechaInicio: fecha,
        cuotas: parseInt(cuotas),
        tipoTasa,
      };

      await axios.post('http://192.168.1.48:3001/newprestamo', prestamoData);

      await Swal.fire({
        icon: 'success',
        title: 'Préstamo creado',
        text: `El préstamo fue creado correctamente para el usuario: ${nombreUsuario}`,
      });

      navigate(`/verprestamos/${userId}`);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear préstamo',
        text: error.response?.data?.error || error.message,
      });
    }
  };

  // 🔹 Simulación con la nueva fórmula
  const simularPrestamo = () => {
    if (!monto || !fecha || !cuotas || !tasas[tipoTasa]) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Debe ingresar monto, fecha, cuotas y tener las tasas cargadas."
      });
      return;
    }



    const tasaAnual = tasas[tipoTasa];
    console.log(tasaAnual);
    
    const montoNum = parseFloat(monto);
const cuotasNum = parseInt(cuotas);
const tasaMes = (tasaAnual / 100) / 12;

const aux = Math.pow((1 + tasaMes), -cuotasNum);
const ani = (1 - aux) / tasaMes;

const valorCuota = montoNum / ani;
const montoFinal = valorCuota * cuotasNum;
const montoPorCuota = valorCuota;


    

    const cuotasSimuladas = [];
    for (let i = 0; i < parseInt(cuotas); i++) {
  const [year, month, day] = fecha.split("-");
  const vencimiento = new Date(year, month - 1, day);

  vencimiento.setMonth(vencimiento.getMonth() + i + 1);

      cuotasSimuladas.push({
        numeroCuota: i + 1,
        fechaVencimiento: vencimiento.toLocaleDateString("sv-SE"),
        monto: montoPorCuota.toFixed(2),
      });
    }

    const formatearNumero = (valor) => {
  if (!valor) return "0";
  return Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatearFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}-${mes}-${anio}`;
};
    let detalleCuotas = cuotasSimuladas
    
      .map(
        (c) =>
          `Cuota ${c.numeroCuota}: $${formatearNumero(c.monto)} (Vence: ${formatearFecha(c.fechaVencimiento)})`
      )
      .join("<br/>");

    Swal.fire({
      icon: "info",
      title: "Simulación de Préstamo",
      html: `
        <b>Monto solicitado:</b> $${formatearNumero(monto)}<br/>
        <b>Tasa anual:</b> ${tasaAnual}%<br/>
        <b>Monto final :</b> $${formatearNumero(montoFinal.toFixed(2))}<br/>
        <b>Cantidad de cuotas:</b> ${cuotas}<br/><br/>
        ${detalleCuotas}
      `,
      width: 600
    });
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="xl" boxShadow="lg">
      <Heading size="md" mb={6} textAlign="center">Formulario de Préstamo</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {!usuarioEncontrado ? (
            <>
              <FormControl isRequired>
                <FormLabel>DNI del usuario</FormLabel>
                <Input
                  placeholder="Ingrese DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
                <Button mt={2} colorScheme="blue" onClick={buscarUsuarioPorDni}>
                  Buscar por DNI
                </Button>
              </FormControl>

              <Box borderY="2px solid #e2e8f0" py={4}>
                <Text textAlign="center" fontSize="sm" color="gray.600">O</Text>
              </Box>

              <FormControl isRequired>
                <FormLabel>Apellido del usuario</FormLabel>
                <Input
                  placeholder="Ingrese apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
                <Button mt={2} colorScheme="blue" onClick={buscarUsuariosPorApellido}>
                  Buscar por Apellido
                </Button>
                
                {mostrarSelect && usuariosMultiples.length > 1 && (
                  <Box mt={3}>
                    <FormLabel fontSize="sm">Seleccione el cliente:</FormLabel>
                    <Select placeholder="Elige un cliente" onChange={handleSeleccionarUsuario}>
                      {usuariosMultiples.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.surname} - DNI: {user.dni}
                        </option>
                      ))}
                    </Select>
                  </Box>
                )}
              </FormControl>
            </>
          ) : (
            <>
              <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px solid green.500">
                <Text color="green.700">
                  ✅ Cliente: <strong>{nombreUsuario}</strong>
                </Text>
                <Button mt={2} size="sm" colorScheme="gray" onClick={() => {
                  setUsuarioEncontrado(false);
                  setDni('');
                  setApellido('');
                  setUserId('');
                  setNombreUsuario('');
                  setUsuariosMultiples([]);
                  setMostrarSelect(false);
                }}>
                  Buscar otro cliente
                </Button>
              </Box>
            </>
          )}

          <FormControl isRequired>
            <FormLabel>Monto</FormLabel>
            <NumberInput min={0} value={monto} onChange={(value) => setMonto(value)}>
              <NumberInputField placeholder="Ingrese el monto" />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fecha de inicio</FormLabel>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => {
  console.log("Fecha seleccionada:", e.target.value);
  setFecha(e.target.value);
}}
              
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Cuotas</FormLabel>
            <NumberInput min={1} value={cuotas} onChange={(value) => setCuotas(value)}>
              <NumberInputField placeholder="Cantidad de cuotas" />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Tipo de Tasa</FormLabel>
            <Select value={tipoTasa} onChange={(e) => setTipoTasa(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="veraz1">Veraz 1</option>
              <option value="veraz2">Veraz 2</option>
            </Select>
          </FormControl>

          <Button type="submit" colorScheme="teal" w="full" isDisabled={!usuarioEncontrado}>
            Enviar solicitud
          </Button>
          <Button colorScheme="purple" w="full" onClick={simularPrestamo} isDisabled={!usuarioEncontrado}>
            Simular préstamo
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PrestamoForm;