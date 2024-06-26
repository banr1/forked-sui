// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui/utils';
import { ExclamationTriangleIcon, GlobeIcon, LockClosedIcon } from '@radix-ui/react-icons';
import {
	Box,
	Button,
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

/**
 * Landing page for the root path. Displays a form for creating a new game.
 */
export default function Root(): ReactElement {
	const [isValid, setValid] = useState(false);

	const onChange = (event: any) => {
		let value = event?.nativeEvent?.target?.value?.trim();
		setValid(value != null && isValidSuiAddress(normalizeSuiAddress(value)));
	};

	const validationError = !isValid ? (
		<Flex align="center" gap="2">
			<ExclamationTriangleIcon color="red" />
			<Text color="red">Invalid opponent address.</Text>
		</Flex>
	) : (
		<Box />
	);

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
				color={isValid ? undefined : 'red'}
				variant={isValid ? 'surface' : 'soft'}
				onChange={onChange}
			/>
			<SegmentedControl.Root id="kind" defaultValue="multisig" mb="2" style={{ width: '100%' }}>
				<Kind value="multisig" icon={<LockClosedIcon />} label="Multi-sig">
					Create a 1-of-2 multi-sig address to own the new game. Each move in the game requires two
					fast path (single-owner) transactions.
				</Kind>
				<Kind value="shared" icon={<GlobeIcon />} label="Shared">
					Create the game as a shared object that both players can access. Each move is a single
					transaction, but it requires going through consensus.
				</Kind>
			</SegmentedControl.Root>
			<Flex justify="between" mt="4">
				{validationError}
				<Button variant="outline" disabled={!isValid}>
					Play
				</Button>
			</Flex>
		</Container>
	);
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
