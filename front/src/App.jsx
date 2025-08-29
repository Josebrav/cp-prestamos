import { Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Flex, Box } from '@chakra-ui/react';
import fondoRojo from '../src/assets/fondo13.jpg';

import Prestamos from './components/prestamos';
import Inicio from './components/inicio';
import Personas from './components/personas';
import MostrarPrestamos from './components/mostrarPrestamos';
import EditarTasas from './components/editarTasas';
import RegistroUsuario from './components/registroUsuario';
import RegistrarCuotas from './components/registrarCuotas';
import VerPrestamos from './components/verPrestamos';
import Header from './components/header';
import Reportes from './components/reportes';
import ReportePrestamosMes from './components/reportePrestamoMes';
import ReporteTotalCobrarMes from './components/totalACobrarMes';
import ReporteEnLegales from './components/enLegales';
import RestanteFuturo from './components/restanteFuturo';
import ReporteSGP from './components/resumen';
import TotalAcumulado from './components/totalAcumulado';
import VerCuota from './components/verCuota';
import Contrato from './components/contrato';

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/cuota/") || location.pathname.startsWith("/contrato/");

  return (
    <Flex
      direction="column"
      w="100vw"
      minH="100vh"
      backgroundImage={`url(${fondoRojo})`}
      bgSize="400px auto"
      bgRepeat="repeat"
      bgPosition="top left"
      overflow="auto"
    >
      {/* Header siempre visible */}
     {!hideHeader && <Header />}

      {/* Contenido principal pegado al header */}
      <Box flex="1" w="100%">
        <TransitionGroup>
          <CSSTransition key={location.key} classNames="slide" timeout={800}>
            <Routes location={location}>
              <Route path="/" element={<Inicio />} />
              <Route path="/nuevo-prestamo" element={<Prestamos />} />
              <Route path="/administracion" element={<EditarTasas />} />
               <Route path="/registrar-cuota" element={<RegistrarCuotas />} /> 
              <Route path="/verprestamos/:id" element={<VerPrestamos />} />
              <Route path="/registro-usuario" element={<RegistroUsuario />} />
              <Route path="/prestamos" element={<MostrarPrestamos />} />
              <Route path="/personas" element={<Personas />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/reportes/prestamos-mes" element={<ReportePrestamosMes />} />
              <Route path="/reportes/total-mes" element={<ReporteTotalCobrarMes />} />
              <Route path='/reportes/legales' element={<ReporteEnLegales />} />
              <Route path="/reportes/restante-futuro" element={<RestanteFuturo />} />
              <Route path="/reportes/resumen" element={<ReporteSGP />} />
              <Route path="/reportes/totalacumulado" element={<TotalAcumulado />} />
              <Route path="/cuota/:id" element={<VerCuota />} />
              <Route path="/contrato/:id" element={<Contrato />} />
              <Route
                path="*"
                element={<h1 style={{ padding: '2rem' }}>Ruta no encontrada</h1>}
              />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Box>
    </Flex>
  );
}

export default App;
