import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RegistroUsuario = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    dni: "",
    cuil: "",
    direccion: "",
    sueldo: "",
    lugarDeTrabajo: "",
    veraz: "",
    situacion: "",
    nacimiento: "",
  });

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al registrar usuario");

      toast({
        title: "Usuario registrado",
        description: "El usuario fue creado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        dni: "",
        cuil: "",
        direccion: "",
        sueldo: "",
        lugarDeTrabajo: "",
        veraz: "",
        situacion: "",
        nacimiento: "",
      });

      setTimeout(() => {
        navigate("/"); // Cambiar a la ruta de inicio deseada
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
   <Flex justify="center" align="center" minH="100vh"  >
  <Box
    bg="white"
    p={8}
    borderRadius="lg"
    borderTopRadius={0}
    shadow="md"
    border="1px"
    borderColor="gray.300"
    w="80%"        // mismo ancho que header e inicio
    maxW="1200px"
    mx="auto"      // centra horizontalmente
  >
        <Heading mb={6} textAlign="center" color="teal.500">
          Registro de Usuario
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Apellido</FormLabel>
              <Input name="surname" value={formData.surname} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input name="phone" value={formData.phone} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>DNI</FormLabel>
              <Input name="dni" value={formData.dni} onChange={handleChange} />
            </FormControl>

            {/* NUEVOS CAMPOS */}
            <FormControl>
              <FormLabel>CUIL</FormLabel>
              <Input name="cuil" value={formData.cuil} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Dirección</FormLabel>
              <Input name="direccion" value={formData.direccion} onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Sueldo</FormLabel>
              <Input name="sueldo" value={formData.sueldo} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Lugar de Trabajo</FormLabel>
              <Input name="lugarDeTrabajo" value={formData.lugarDeTrabajo} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Veraz</FormLabel>
              <Select name="veraz" value={formData.veraz} onChange={handleChange}>
                <option value="">Seleccionar</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Situación</FormLabel>
              <Input name="situacion" value={formData.situacion} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <Input type="date" name="nacimiento" value={formData.nacimiento} onChange={handleChange} />
            </FormControl>

            <Button type="submit" colorScheme="teal" w="full">
              Registrar
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default RegistroUsuario;
