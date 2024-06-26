// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ConnectButton } from "@mysten/dapp-kit";
import { FrameIcon } from "@radix-ui/react-icons";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { isValidSuiObjectId, normalizeSuiObjectId } from "@mysten/sui/utils";
import Error from "./Error.tsx";
import Game from "./Game.tsx";
import Root from "./Root.tsx";

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
      <Container size="1" mt="8">
        <Content />
      </Container>
    </>
  );
}

function Content() {
  const path = location.pathname.slice(1);
  const addr = normalizeSuiObjectId(path);

  if (path === "") {
    return <Root />;
  } else if (isValidSuiObjectId(addr)) {
    return <Game id={addr} />;
  } else {
    return (
      <Error title="Invalid address">
        <Text>
          The address <code>"{path}"</code> is not a valid SUI object ID.
        </Text>
      </Error>
    );
  }
}

export default App;
