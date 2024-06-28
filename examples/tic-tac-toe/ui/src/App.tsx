// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import './App.css';

import { ConnectButton, useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { isValidSuiObjectId, normalizeSuiObjectId } from '@mysten/sui/utils';
import { FrameIcon } from '@radix-ui/react-icons';
import { Box, Container, Flex, Heading, Link, Text } from '@radix-ui/themes';

import { networkConfig, useNetworkVariable } from './config.ts';
import Error from './Error.tsx';
import Game from './Game.tsx';
import Root from './Root.tsx';

function App() {
	// Ensure the app's network config matches the wallet's available networks, if the wallet is connected.
	const account = useCurrentAccount();
	const ctx = useSuiClientContext();

	const chain = account?.chains?.find((c) => c.startsWith('sui:'))?.replace(/^sui:/, '');
	if (chain) {
		console.debug('Configuring app for', chain);
		ctx.selectNetwork(chain);
	}

	return (
		<>
			<Flex position="sticky" px="4" py="2" align="center" justify="between">
				<Flex align="center" gap="1">
					<FrameIcon width={20} height={20} />
					<Heading>
						<Link href="/" className="home">
							Tic Tac Toe
						</Link>
					</Heading>
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
	const packageId = useNetworkVariable('packageId');

	const path = location.pathname.slice(1);
	const addr = normalizeSuiObjectId(path);

	if (packageId === null) {
		const availableNetworks = Object.keys(networkConfig).filter(
			(n) => (networkConfig as any)[n]?.variables?.packageId,
		);

		return (
			<Error title="App not available">
				This app is only available on {availableNetworks.join(', ')}. Please switch your wallet to a
				supported network.
			</Error>
		);
	} else if (path === '') {
		return <Root />;
	} else if (isValidSuiObjectId(addr)) {
		return <Game id={addr} />;
	} else {
		return (
			<Error title="Invalid Game ID">
				<Text>
					<code>"{path}"</code> is not a valid SUI object ID.
				</Text>
			</Error>
		);
	}
}

export default App;