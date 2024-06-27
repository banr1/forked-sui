// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import './Game.css';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CircleIcon, Cross1Icon, TrashIcon } from '@radix-ui/react-icons';
import { AlertDialog, Badge, Box, Button, Flex } from '@radix-ui/themes';
import { ReactElement } from 'react';

import { useNetworkVariable } from './config';
import Error from './Error';
import IDLink from './IDLink';

type Game = {
	board: number[];
	turn: number;
	x: string;
	o: string;
};

type Props = {
	id: string;
};

enum Player {
	_,
	X,
	O,
}

type Cell = Player;
type Marks = Cell[][];

/**
 * Render the game at the given ID.
 *
 * Displays the noughts and crosses board, as well as a toolbar with:
 *
 * - An indicator of whose turn it is.
 * - A button to delete the game.
 * - The ID of the game being played.
 */
export default function Game({ id }: Props): ReactElement {
	const response = useSuiClientQuery('getObject', {
		id,
		options: {
			showType: true,
			showContent: true,
		},
	});

	const data = response.data?.data;
	if (!data) {
		return (
			<Error title="Failed to fetch game">
				Could not load game at <IDLink id={id} size="2" display="inline-flex" />.
			</Error>
		);
	}

	const packageId = useNetworkVariable('packageId');
	const reType = new RegExp(`^${packageId}::(shared|owned)::Game`);
	const { type, content } = data;

	let mType;
	if (!type || !(mType = type.match(reType)) || !content || content.dataType != 'moveObject') {
		return (
			<Error title="Object is not a Game">
				<IDLink id={id} size="2" display="inline-flex" /> is not a game.
			</Error>
		);
	}

	const kind = mType[1];
	const { board, turn, x, o } = content.fields as Game;
	const [curr, next] = turn % 2 == 0 ? [x, o] : [o, x];

	const marks = Array.from({ length: 3 }, (_, i) => {
		return board.slice(i * 3, (i + 1) * 3) as Player[];
	});

	return (
		<>
			<Board marks={marks} />
			<Flex direction="row" gap="2" mx="2" my="6" justify="between">
				<MoveIndicator currPlayer={curr} nextPlayer={next} />
				<DeleteButton id={id} />
				<IDLink id={id} />
			</Flex>
		</>
	);
}

function Board({ marks }: { marks: Marks }): ReactElement {
	return (
		<Flex direction="column" gap="2" className="board" mb="2">
			{marks.map((row, i) => (
				<Flex direction="row" gap="2" key={i}>
					{row.map((cell, j) => (
						<Cell key={j} cell={cell} />
					))}
				</Flex>
			))}
		</Flex>
	);
}

function Cell({ cell }: { cell: Cell }): ReactElement {
	// TODO: Empty boxes should display a ghost image of an X or O if
	// the viewer is the current player, and should be clickable to
	// issue that transaction.
	switch (cell) {
		case Player.X:
			return <Cross1Icon className="cell" width="100%" height="100%" />;
		case Player.O:
			return <CircleIcon className="cell" width="100%" height="100%" />;
		case Player._:
			return <Box className="cell" />;
	}
}

function MoveIndicator({
	currPlayer,
	nextPlayer,
}: {
	currPlayer: String;
	nextPlayer: string;
}): ReactElement {
	const account = useCurrentAccount();
	if (account?.address === currPlayer) {
		return <Badge color="green">Your turn</Badge>;
	} else if (account?.address === nextPlayer) {
		return <Badge color="orange">Their turn</Badge>;
	} else {
		return <Badge color="blue">Spectating</Badge>;
	}
}

function DeleteButton({ id: _ }: { id: string }): ReactElement {
	// TODO: This should only be enabled if the current account is able
	// to delete the game (has permissions and the game is finished).
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<Button color="red" size="1" variant="outline">
					<TrashIcon /> Delete Game
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Title>Delete Game</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to delete this game? This will delete the object from the blockchain
					and cannot be undone.
				</AlertDialog.Description>
				<Flex gap="3" mt="3" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button variant="solid" color="red">
							Delete
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
