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

const DIAS_PROM_MES = 30.49; // ← clave para emular el sistema viejo

// ===== Helpers de tasa y PMT (sistema francés) =====
function getMonthlyRateFromAnnual_TNA_legacy(tnaPercent, diasPromMes = DIAS_PROM_MES) {
  const tna = Number(tnaPercent) / 100;
  if (!isFinite(tna)) throw new Error('tnaPercent inválido');
  return tna * (Number(diasPromMes) / 365);
}
function pmt(P, r, n) {
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}
function addOneMonth(isoDateString) {
  const d = new Date(isoDateString);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);
  if (d.getDate() < day) d.setDate(0);
  return d.toISOString().split('T')[0];
}

const PrestamoForm = () => {
  const [monto, setMonto] = useState('');
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoy);
  const [cuotas, setCuotas] = useState('');
  const [tipoTasa, setTipoTasa] = useState('normal');
  const [dni, setDni] = useState('');
  const [userId, setUserId] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);

  // tasas = { normal: 249, veraz1: 220, ... }
  const [tasas, setTasas] = useState({});
  const navigate = useNavigate();

  // Cargar tasas desde backend
  useEffect(() => {
    const fetchTasas = async () => {
      try {
        const res = await axios.get('http://localhost:3001/tasa');
        const tasasObj = {};
        (res.data || []).forEach((t) => {
          if (t?.tipo != null && t?.tasaAnual != null) {
            tasasObj[t.tipo] = parseFloat(t.tasaAnual);
          }
        });
        setTasas(tasasObj);
      } catch (error) {
        console.error('Error cargando tasas:', error);
      }
    };
    fetchTasas();
  }, []);

  const buscarUsuarioPorDni = async () => {
    try {
      const res = await axios.post('http://localhost:3001/buscar-dni', { dni });
      const user = res.data;

      setUserId(user.id);
      const nombre = user.name && user.surname ? `${user.name} ${user.surname}` : 'Nombre no disponible';
      setNombreUsuario(nombre);
      setUsuarioEncontrado(true);

      Swal.fire({
        icon: 'success',
        title: 'Usuario encontrado',
        text: `Usuario: ${nombre}`,
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

    if (!usuarioEncontrado || !userId) {
      Swal.fire({ icon: 'warning', title: 'Falta usuario', text: 'Buscá y seleccioná un usuario por DNI.' });
      return;
    }
    if (!monto || !cuotas || !fecha || !tipoTasa) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Completa monto, cuotas, fecha y tipo de tasa.' });
      return;
    }
    if (!tasas[tipoTasa]) {
      Swal.fire({ icon: 'warning', title: 'Tasa no encontrada', text: 'No se encontró la tasa seleccionada.' });
      return;
    }

    try {
      const prestamoData = {
        userId,
        monto: parseFloat(monto),
        fechaInicio: fecha,
        cuotas: parseInt(cuotas, 10),
        tipoTasa, // el backend buscará TasaConfig por este tipo
      };

      await axios.post('http://localhost:3001/newprestamo', prestamoData);

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

  // Simulación con sistema francés + conversión legacy
  const simularPrestamo = () => {
    const n = parseInt(cuotas, 10);
    const P = parseFloat(monto);
    const tna = tasas[tipoTasa];

    if (!P || !fecha || !n || !tna) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debe ingresar monto, fecha, cuotas y tener las tasas cargadas.',
      });
      return;
    }

    try {
      const r = getMonthlyRateFromAnnual_TNA_legacy(tna); // r mensual (proporción)
      const cuotaFija = pmt(P, r, n);

      // Armar plan francés
      let saldo = P;
      let vto = addOneMonth(fecha);
      const cuotasSimuladas = [];

      for (let k = 1; k <= n; k++) {
        const interes = saldo * r;
        const amort = cuotaFija - interes;
        const nuevoSaldo = Math.max(0, saldo - amort);

        cuotasSimuladas.push({
          numero: k,
          fechaVencimiento: vto,
          cuota: Number(cuotaFija.toFixed(2)),
          interes: Number(interes.toFixed(2)),
          amortizacion: Number(amort.toFixed(2)),
          saldo: Number(nuevoSaldo.toFixed(2)),
        });

        saldo = nuevoSaldo;
        vto = addOneMonth(vto);
      }

      const total = cuotasSimuladas.reduce((acc, c) => acc + c.cuota, 0);
      const detalleCuotas = cuotasSimuladas
        .map(
          (c) =>
            `Cuota ${c.numero}: <b>$${c.cuota.toFixed(2)}</b>  (Vence: ${c.fechaVencimiento})`
        )
        .join('<br/>');

      Swal.fire({
        icon: 'info',
        title: 'Simulación de Préstamo',
        html: `
          <b>Monto solicitado:</b> $${P.toFixed(2)}<br/>
          <b>TNA:</b> ${tna}%<br/>
          
          <b>Cuota fija (PMT):</b> $${cuotaFija.toFixed(2)}<br/>
          <b>Total a pagar:</b> $${total.toFixed(2)}<br/>
          <b>Cantidad de cuotas:</b> ${n}<br/><br/>
          ${detalleCuotas}
        `,
        width: 700,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error en simulación',
        text: err.message || 'No se pudo simular el préstamo.',
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="xl" boxShadow="lg">
      <Heading size="md" mb={6} textAlign="center">
        Formulario de Préstamo
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>DNI del usuario</FormLabel>
            <Input placeholder="Ingrese DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
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
            <NumberInput
              min={0}
              value={monto}
              onChange={(_valueString, valueNumber) => setMonto(Number.isFinite(valueNumber) ? valueNumber : '')}
            >
              <NumberInputField placeholder="Ingrese el monto" />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fecha de inicio</FormLabel>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Cuotas</FormLabel>
            <NumberInput
              min={1}
              value={cuotas}
              onChange={(_valueString, valueNumber) => setCuotas(Number.isFinite(valueNumber) ? valueNumber : '')}
            >
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
          <Button colorScheme="purple" w="full" onClick={simularPrestamo}>
            Simular préstamo
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PrestamoForm;
