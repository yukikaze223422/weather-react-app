import { ButtonGroup, Container, IconButton, Stack, Text, Image, Link } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
const Footer = () => {
  return (
    <Container
      as="footer"
      role="contentinfo"
      py={6}
      m={0}
      minW={"100%"}
      borderTop={1}
      borderStyle={"solid"}
      borderColor={"gray.200"}
    >
      <Stack spacing={{ base: "4", md: "5" }}>
        <Stack justify="start" direction="row" align="center">
          <ButtonGroup variant="ghost">
            <Link href="https://github.com/yukikaze223422/weather-react-app.git" isExternal>
              <IconButton aria-label="GitHub" icon={<FaGithub fontSize="1.25rem" />} />
            </Link>
          </ButtonGroup>
          <Text fontSize={"12px"} color="gray.400" fontWeight={"bold"}>
            天気予報を簡単にチェックできる
            <br />
            オリジナルアプリ
          </Text>
        </Stack>
        <Text fontSize="12px" color="subtle">
          &copy; {new Date().getFullYear()} WeatherChecker All rights reserved.
        </Text>
      </Stack>
    </Container>
  );
};

export default Footer;
