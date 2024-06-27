// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount } from '@mysten/dapp-kit';
import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui/utils';
import { ExclamationTriangleIcon, GlobeIcon, LockClosedIcon } from '@radix-ui/react-icons';
import {
	Box,
	Container,
	Flex,
	Heading,
	HoverCard,
	SegmentedControl,
	Separator,
	Text,
	TextField,
} from '@radix-ui/themes';
import { ReactElement, useState } from 'react';

import CreateGame from './CreateGame';

/**
 * Landing page for the root path. Displays a form for creating a new game.
 */
export default function Root(): ReactElement {
	const player = useCurrentAccount();

	const [opponent, setOpponent] = useState<string | null>(null);
	const [kind, setKind] = useState('owned');

	const hasPlayer = player != null;
	const hasOpponent = opponent != null;

	return (
		<Container m="2">
			<Heading size="5" mb="2">
				New game
			</Heading>
			<Separator orientation="horizontal" mb="4" style={{ width: '100%' }} />
			<TextField.Root
				id="opponent"
				size="2"
				mb="2"
				placeholder="Opponent address"
				style={{ width: '100%' }}
				color={hasOpponent ? undefined : 'red'}
				variant={hasOpponent ? 'surface' : 'soft'}
				onChange={(e) => setOpponent(normalizedAddress(e.target.value))}
			/>
			<SegmentedControl.Root
				id="kind"
				mb="2"
				defaultValue={kind}
				style={{ width: '100%' }}
				onValueChange={setKind}
			>
				<Kind value="owned" icon={<LockClosedIcon />} label="Multi-sig">
					Create a 1-of-2 multi-sig address to own the new game. Each move in the game requires two
					fast path (single-owner) transactions.
				</Kind>
				<Kind value="shared" icon={<GlobeIcon />} label="Shared">
					Create the game as a shared object that both players can access. Each move is a single
					transaction, but it requires going through consensus.
				</Kind>
			</SegmentedControl.Root>
			<Flex justify="between" mt="4">
				<Validation hasPlayer={hasPlayer} hasOpponent={hasOpponent} />
				<CreateGame
					kind={kind}
					player={player?.address}
					opponent={opponent || undefined}
					onCreateGame={(game) => {
						window.location.href = `/${game}`;
					}}
				>
					Play
				</CreateGame>
			</Flex>
		</Container>
	);
}

function Validation({
	hasPlayer,
	hasOpponent,
}: {
	hasPlayer: boolean;
	hasOpponent: boolean;
}): ReactElement {
	if (!hasPlayer) {
		return (
			<Flex align="center" gap="2">
				<ExclamationTriangleIcon color="red" />
				<Text color="red">Wallet not connected.</Text>
			</Flex>
		);
	} else if (!hasOpponent) {
		return (
			<Flex align="center" gap="2">
				<ExclamationTriangleIcon color="red" />
				<Text color="red">Invalid opponent address.</Text>
			</Flex>
		);
	} else {
		return <Box />;
	}
}

/**
 * Re-usable component for defining a single "kind" option.
 *
 * Each "kind" option is a segmented control item, with an icon,
 * label, and a tool-tip to explain how that kind of game works.
 */
function Kind({
	value,
	icon,
	label,
	children,
}: {
	value: string;
	icon: ReactElement;
	label: string;
	children: string;
}): ReactElement {
	return (
		<SegmentedControl.Item value={value}>
			<HoverCard.Root>
				<HoverCard.Trigger>
					<Flex direction="row" gap="2" align="center">
						{icon}
						<Text>{label}</Text>
					</Flex>
				</HoverCard.Trigger>
				<HoverCard.Content>
					<Text size="2">{children}</Text>
				</HoverCard.Content>
			</HoverCard.Root>
		</SegmentedControl.Item>
	);
}

/**
 * If `address` is a valid denormalized address, return it in its
 * normalized form, and otherwise return null.
 */
function normalizedAddress(address?: string): string | null {
	if (address == null) {
		return null;
	}

	address = address.trim();
	if (address == '') {
		return null;
	}

	address = normalizeSuiAddress(address);
	return isValidSuiAddress(address) ? address : null;
}
