import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom'; // 👈 importar

const PrestamoForm = () => {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const [cuotas, setCuotas] = useState('');
  const [tipoTasa, setTipoTasa] = useState('normal');
  const [dni, setDni] = useState('');
  const [userId, setUserId] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);

  const navigate = useNavigate(); // 👈 hook para redirigir

  const buscarUsuarioPorDni = async () => {
    try {
      const res = await axios.post('http://localhost:3001/buscar-dni', { dni });
      const user = res.data;

      setUserId(user.id);
      setNombreUsuario(
        user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'
      );
      setUsuarioEncontrado(true);

      Swal.fire({
        icon: 'success',
        title: 'Usuario encontrado',
        text: `Usuario: ${user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible'}`,
      });
    } catch (error) {
      setUsuarioEncontrado(false);
      setNombreUsuario('');
      setUserId('');
      Swal.fire({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: error.response?.data?.error || error.message,
      });
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

      await axios.post('http://localhost:3001/newprestamo', prestamoData);

      await Swal.fire({
        icon: 'success',
        title: 'Préstamo creado',
        text: `El préstamo fue creado correctamente para el usuario: ${nombreUsuario}`,
      });

      // 👇 Redirige a ver los préstamos del usuario
      navigate(`/verprestamos/${userId}`);
      // Si prefieres hardcodear el host (no necesario):
      // window.location.href = `http://localhost:5173/verprestamos/${userId}`;

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear préstamo',
        text: error.response?.data?.error || error.message,
      });
    }
  };

  // dentro de PrestamoForm
const simularPrestamo = () => {
  if (!monto || !fecha || !cuotas) {
    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Debe ingresar monto, fecha y cantidad de cuotas para simular."
    });
    return;
  }

  // 1) Calcular monto final con el 15% por cuota
  const porcentajeExtra = 0.15 * parseInt(cuotas);
  const montoFinal = parseFloat(monto) * (1 + porcentajeExtra);

  // 2) Calcular monto por cuota
  const montoPorCuota = montoFinal / parseInt(cuotas);

  // 3) Generar cuotas simuladas con fechas de vencimiento
  const cuotasSimuladas = [];
  for (let i = 0; i < parseInt(cuotas); i++) {
    const vencimiento = new Date(fecha);
    vencimiento.setMonth(vencimiento.getMonth() + i + 1);

    cuotasSimuladas.push({
      numeroCuota: i + 1,
      fechaVencimiento: vencimiento.toISOString().split("T")[0],
      monto: montoPorCuota.toFixed(2),
    });
  }

  // 4) Mostrar resultado en modal
  let detalleCuotas = cuotasSimuladas
    .map(
      (c) =>
        `Cuota ${c.numeroCuota}: $${c.monto} (Vence: ${c.fechaVencimiento})`
    )
    .join("<br/>");

  Swal.fire({
    icon: "info",
    title: "Simulación de Préstamo",
    html: `
      <b>Monto solicitado:</b> $${monto}<br/>
      <b>Monto final :</b> $${montoFinal.toFixed(2)}<br/>
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
          <FormControl isRequired>
            <FormLabel>DNI del usuario</FormLabel>
            <Input
              placeholder="Ingrese DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            <Button mt={2} colorScheme="blue" onClick={buscarUsuarioPorDni}>
              Buscar usuario
            </Button>
            {usuarioEncontrado && (
              <Text mt={2} color="green.500">
                Usuario encontrado: <strong>{nombreUsuario}</strong>
              </Text>
            )}
          </FormControl>

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
              onChange={(e) => setFecha(e.target.value)}
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
          <Button
  colorScheme="purple"
  w="full"
  onClick={simularPrestamo}
>
  Simular préstamo
</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PrestamoForm;
