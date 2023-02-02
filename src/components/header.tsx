import { SunIcon } from "@chakra-ui/icons";
import { Container, Text, Flex, Image } from "@chakra-ui/react";

const Header = () => {
  return (
    <>
      <Container p={0} borderBottom="1px" borderColor="gray.200" maxW="100%">
        <Container bg="blue.500" maxW="100%" p={1}>
          <Text color="white" fontSize="sm" align="center">
            天気予報を簡単にチェックできるアプリ
          </Text>
        </Container>
        <Container bg="white" py={2} px={4} maxW="100%" textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.400" my={2}>
            Weather&nbsp;
            <SunIcon />
            &nbsp;Checker
          </Text>
        </Container>
      </Container>
    </>
  );
};

export default Header;
