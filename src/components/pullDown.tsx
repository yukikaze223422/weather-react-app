import { Badge, FormControl, FormErrorMessage, FormLabel, HStack, Select } from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = {
  messageName: any;
  pullDownTitle: string;
  children: ReactNode;
};

const PullDown = (Props: Props) => {
  const { messageName, pullDownTitle, children } = Props;
  return (
    <FormControl mb={4} isInvalid={messageName ? true : false}>
      <HStack mb={3}>
        <Badge variant="solid" colorScheme="red">
          必須
        </Badge>
        <FormLabel fontWeight="bold" color="blue.400">
          {pullDownTitle}
        </FormLabel>
      </HStack>
      {children}
      <FormErrorMessage>{messageName?.message?.toString()}</FormErrorMessage>
    </FormControl>
  );
};

export default PullDown;
