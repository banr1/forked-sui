import { ConnectButton } from "@mysten/dapp-kit";
import { FrameIcon } from "@radix-ui/react-icons";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { isValidSuiAddress, normalizeSuiObjectId } from "@mysten/sui/utils";

function App() {
  const path = location.pathname.slice(1);
  const addr = normalizeSuiObjectId(path);
  const content = path === ""
    ? <Text>New game dialog</Text>
    : isValidSuiAddress(addr)
      ? <Text>Game board for {addr} / {path}</Text>
      : <Text>Invalid address</Text>;

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        align="center"
        justify="between"
      >
        <Flex align="center" gap="1">
          <FrameIcon width={20} height={20} />
          <Heading>Tic Tac Toe</Heading>
        </Flex>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        {content}
      </Container>
    </>
  );
}

export default App;
