// src/components/Header.jsx
import { Box, Flex, Heading, Image } from '@chakra-ui/react';
import logo from '../assets/cp.jpg';

export default function Header() {
  return (
    <Box bg="black" py={6} px={4} borderRadius="20px" borderBottomRadius="0%" mt={"2%"} ml="10%" mr="10%" >
      <Flex align="center" justify="center" gap={4}>
        <Image src={logo} alt="Logo" boxSize="100px" w="160px" />
        <Heading color="white" size="lg">
          Consultora Patagónica
        </Heading>
      </Flex>
    </Box>
  );
}
