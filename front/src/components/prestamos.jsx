import React from "react";
import { Box, Heading, Container, VStack } from "@chakra-ui/react";
import PrestamoForm from "./forms/prestamoForm"; // Ajustá el path según tu estructura

const Prestamos = () => {
  return (
      <Box
  w="80%"           // igual que el header
  maxW="1200px"
  mx="auto"
  bg="white"
  borderRadius="20px"
  borderTopRadius="0px"
  mt={0}
  p={6}
  pb="140px"
>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" color="teal.600">
            Nuevo Prestamo
          </Heading>
        </Box>

        <Box>
          <PrestamoForm />
        </Box>
      </VStack>
      </Box>
  );
};

export default Prestamos;
