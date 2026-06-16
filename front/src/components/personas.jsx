import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Divider,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Personas() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate(); // 👈 agrega esto

  useEffect(() => {
    axios.get('http://192.168.1.48:3001/usuarios')
      .then(res => {
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sorted);
        setAllUsers(sorted); // 👈 guardamos copia
      })
      .catch(err => console.error("❌ Error al obtener usuarios:", err));
  }, []);

  const tieneLegales =
  selectedUser?.Prestamos
    ? selectedUser.Prestamos.some(p => p.estado === "en legales")
    : selectedUser?.estado === "en legales";

    console.log("USER COMPLETO:", selectedUser);  

  const mostrarModal = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setFormData(user); // inicializa formData con los datos actuales
      setEditMode(false);
      onOpen();
    }
  };
  const irAPrestamos = (id) => {
    navigate(`/verprestamos/${id}`); // 👈 redirige al detalle de préstamos
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const esNumero = (valor) => {
    return /^\d+$/.test(valor);
  };

  useEffect(() => {
    const buscarPorDni = async () => {
      try {
        const res = await axios.post('http://192.168.1.48:3001/buscar-dni', {
          dni: search
        });

        setUsers([res.data]);
      } catch (err) {
        setUsers([]);
      }
    };

    const delay = setTimeout(() => {
      if (search && esNumero(search)) {
        // ✅ ahora SI busca cualquier número (ej: 1)
        buscarPorDni();
      } else {
        // 🔹 volvemos a lista original
        setUsers(allUsers);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search, allUsers]);

  const handleUpdateUser = async () => {
    try {
      const res = await axios.put(`http://192.168.1.48:3001/usuario/${selectedUser.id}`, formData);
      setSelectedUser(res.data.user); // actualiza modal
      // actualiza listado de usuarios
      setUsers(users.map(u => u.id === selectedUser.id ? res.data.user : u));
      setEditMode(false);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      console.error("❌ Error al actualizar usuario:", err);
      alert("No se pudo actualizar el usuario");
    }
  };

  const filteredUsers = esNumero(search)
    ? users // 👈 si es número, no filtramos nada
    : users.filter(user =>
      user.name?.toLowerCase().startsWith(search.toLowerCase()) ||
      user.surname?.toLowerCase().startsWith(search.toLowerCase())
    );

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
      <Button
        mb={4}
        colorScheme="gray"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </Button>
      <Text fontSize="3xl" fontWeight="bold" textAlign="center" mb={2}>
        Clientes
      </Text>
      <Divider mb={4} />

      <Input
        placeholder="Buscar por nombre o dni"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={6}
      />

      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>DNI</Th>
            <Th>Préstamos</Th>
            <Th textAlign="right">En legales</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredUsers.map(user => (
            <Tr key={user.id}>
              <Td>
                <Text
                  cursor="pointer"
                  color="teal.600"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => mostrarModal(user.id)}
                >
                  {user.name} {user.surname}
                </Text>
              </Td>
              <Td>{user.dni}</Td>
              <Td
                cursor={user.Prestamos?.length > 0 ? "pointer" : "default"}
                color={user.Prestamos?.length > 0 ? "blue.500" : "black"}
                onClick={() => user.Prestamos?.length > 0 && irAPrestamos(user.id)} // 👈 vuelve el click
              >
                {user.Prestamos?.length > 0
                  ? `Ver préstamos (${user.Prestamos.length})`
                  : "0"}
              </Td>
              <Td textAlign="right">
                {user.Prestamos?.some(p => p.estado === 'en legales') ? (
                  <Text color="red.500">En legales</Text>
                ) : (
                  null
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" >
        
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Datos del Cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser ? (
              <VStack spacing={3} align="stretch">
                {/* Nombre */}
                <Box>
                  <Text fontWeight="bold">Nombre:</Text>
                  <Input
                    name="name"
                    value={formData.name || ""}
                    placeholder="Nombre"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Apellido */}
                <Box>
                  <Text fontWeight="bold">Apellido:</Text>
                  <Input
                    name="surname"
                    value={formData.surname || ""}
                    placeholder="Apellido"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* DNI */}
                <Box>
                  <Text fontWeight="bold">DNI:</Text>
                  <Input
                    name="dni"
                    value={formData.dni || ""}
                    placeholder="DNI"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <Text fontWeight="bold">Email:</Text>
                  <Input
                    name="email"
                    value={formData.email || ""}
                    placeholder="Email"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Teléfono */}
                <Box>
                  <Text fontWeight="bold">Teléfono:</Text>
                  <Input
                    name="phone"
                    value={formData.phone || ""}
                    placeholder="Teléfono"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Sueldo */}
                <Box>
                  <Text fontWeight="bold">Sueldo:</Text>
                  <Input
                    name="sueldo"
                    value={formData.sueldo || ""}
                    placeholder="Sueldo"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Lugar de trabajo */}
                <Box>
                  <Text fontWeight="bold">Lugar de trabajo:</Text>
                  <Input
                    name="lugarDeTrabajo"
                    value={formData.lugarDeTrabajo || ""}
                    placeholder="Lugar de trabajo"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Veraz */}
                <Box>
                  <Text fontWeight="bold">Veraz:</Text>
                  <Input
                    name="veraz"
                    value={formData.veraz || ""}
                    placeholder="Veraz"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Situación */}
                <Box>
                  <Text fontWeight="bold">Situación:</Text>
                  <Input
                    name="situacion"
                    value={formData.situacion || ""}
                    placeholder="Situación"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Nacimiento */}
                <Box>
                  <Text fontWeight="bold">Nacimiento:</Text>
                  <Input
                    name="nacimiento"
                    type="date"
                    value={formData.nacimiento ? new Date(formData.nacimiento).toISOString().split('T')[0] : ""}
                    placeholder="Nacimiento"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>
                {/* CUIL */}
                <Box>
                  <Text fontWeight="bold">CUIL:</Text>
                  <Input
                    name="cuil"
                    value={formData.cuil || ""}
                    placeholder="CUIL"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Dirección */}
                <Box>
                  <Text fontWeight="bold">Dirección:</Text>
                  <Input
                    name="direccion"
                    value={formData.direccion || ""}
                    placeholder="Dirección"
                    isReadOnly={!editMode}
                    onChange={handleChange}
                  />
                </Box>

                {/* Préstamos */}
                <Box>
                  <Text fontWeight="bold">Cantidad de préstamos:</Text>
                  <Text>{selectedUser.Prestamos?.length || 0}</Text>
                </Box>
                {/* En legales */}
                <Box>
                  <Text fontWeight="bold">En legales:</Text>
                  <Text color={tieneLegales ? "red.500" : "green.500"}>
                    {tieneLegales ? "Sí" : "No"}
                  </Text>
                </Box>
                {/* Botón Modificar / Guardar */}
                <Box pt={2}>
                  {!editMode ? (
                    <Button colorScheme="blue" onClick={() => setEditMode(true)}>
                      Modificar
                    </Button>
                  ) : (
                    <Button colorScheme="green" onClick={handleUpdateUser}>
                      Guardar Cambios
                    </Button>
                  )}
                </Box>
              </VStack>
            ) : (
              <Text color="red.500">No se pudo cargar el cliente.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
}
