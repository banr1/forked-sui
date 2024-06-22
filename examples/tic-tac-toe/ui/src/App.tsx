import { ConnectButton } from "@mysten/dapp-kit";
import { FrameIcon } from "@radix-ui/react-icons";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";

function App() {
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
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <WalletStatus />
        </Container>
      </Container>
    </>
  );
}

export default App;
