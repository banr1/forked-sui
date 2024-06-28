// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import './Game.css';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { TrashIcon } from '@radix-ui/react-icons';
import { AlertDialog, Badge, Button, Flex } from '@radix-ui/themes';
import { ReactElement } from 'react';

import { Board } from './Board';
import { useNetworkVariable } from './config';
import Error from './Error';
import IDLink from './IDLink';
import { Loading } from './Loading';
import { Mark, useGameQuery } from './UseGameQuery';

type Props = {
	id: string;
};

enum Turn {
	Spectating,
	Yours,
	Theirs,
}

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
	const account = useCurrentAccount();
	const packageId = useNetworkVariable('packageId');

	const client = useSuiClient();
	const [game, invalidateGame] = useGameQuery(id);
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	if (game.status === 'pending') {
		return <Loading />;
	} else if (game.status == 'error') {
		return (
			<Error title={game.error.message}>
				Could not load game at <IDLink id={id} size="2" display="inline-flex" />.
			</Error>
		);
	}

	const { kind, board, turn, x, o } = game.data;
	const [mark, curr, next] = turn % 2 == 0 ? [Mark.X, x, o] : [Mark.O, o, x];

	// If its the current account's turn, then empty cells should show
	// the current player's mark on hover. Otherwise show nothing, and
	// disable interactivity.
	const who = turnIndicator({ curr, next, addr: account?.address });
	const empty = Turn.Yours == who ? mark : Mark._;

	const onMove = (row: number, col: number) => {
		const tx = new Transaction();

		if (kind === 'shared') {
			tx.moveCall({
				target: `${packageId}::${kind}::place_mark`,
				arguments: [tx.object(id), tx.pure.u8(row), tx.pure.u8(col)],
			});
		} else if (kind == 'owned') {
			console.log('Owned object variant not supported yet');
			return;
		}

		signAndExecute(
			{
				transaction: tx,
			},
			{
				onSuccess: ({ digest }) => {
					client.waitForTransaction({ digest }).then(invalidateGame);
				},

				onError: (error) => {
					console.error('Failed to execute transaction', error);
				},
			},
		);
	};

	return (
		<>
			<Board marks={board} empty={empty} onMove={onMove} />
			<Flex direction="row" gap="2" mx="2" my="6" justify="between">
				<MoveIndicator turn={who} />
				<DeleteButton id={id} />
				<IDLink id={id} />
			</Flex>
		</>
	);
}

/**
 * Figure out whose turn it should be based on who the `curr`ent
 * player is, who the `next` player is, and what the `addr`ess of the
 * current account is.
 */
function turnIndicator({ curr, next, addr }: { curr: string; next: string; addr?: string }): Turn {
	if (addr === curr) {
		return Turn.Yours;
	} else if (addr === next) {
		return Turn.Theirs;
	} else {
		return Turn.Spectating;
	}
}

function MoveIndicator({ turn }: { turn: Turn }): ReactElement {
	switch (turn) {
		case Turn.Yours:
			return <Badge color="green">Your turn</Badge>;
		case Turn.Theirs:
			return <Badge color="orange">Their turn</Badge>;
		case Turn.Spectating:
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
