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
import { Trophy, useTrophyQuery } from './UseTrophyQuery';

type Props = {
	id: string;
};

enum Turn {
	Spectating,
	Yours,
	Theirs,
}

enum Winner {
	/** Nobody has won yet */
	None,

	/** X has won, and you are not a player */
	X,

	/** O has won, and you are not a player */
	O,

	/** You won */
	You,

	/** The other player won */
	Them,

	/** Game ended in a draw */
	Draw,
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
	const [trophy, invalidateTrophy] = useTrophyQuery(id, game?.data?.kind);
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	if (game.status === 'pending') {
		return <Loading />;
	} else if (game.status === 'error') {
		return (
			<Error title="Error loading game">
				<p>
					Could not load game at <IDLink id={id} size="2" display="inline-flex" />.
				</p>
				<p>{game.error.message}</p>
			</Error>
		);
	}

	if (trophy.status === 'pending') {
		return <Loading />;
	} else if (trophy.status === 'error') {
		return (
			<Error title="Error loading game">
				<p>
					Could not check win for <IDLink id={id} size="2" display="inline-flex" />:
				</p>
				<p>{trophy.error.message}.</p>
			</Error>
		);
	}

	const { data: endState } = trophy;
	const { kind, board, turn, x, o } = game.data;
	const [mark, curr, next] = turn % 2 == 0 ? [Mark.X, x, o] : [Mark.O, o, x];

	// If its the current account's turn, then empty cells should show
	// the current player's mark on hover. Otherwise show nothing, and
	// disable interactivity.
	const player = whoseTurn({ curr, next, addr: account?.address });
	const winner = whoWon({ curr, next, addr: account?.address, turn, trophy: endState });
	const empty = Turn.Yours == player && endState === Trophy.None ? mark : Mark._;

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
					client.waitForTransaction({ digest }).then(invalidateGame).then(invalidateTrophy);
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
				{endState !== Trophy.None ? (
					<WinIndicator winner={winner} />
				) : (
					<MoveIndicator turn={player} />
				)}
				{endState !== Trophy.None ? <DeleteButton id={id} kind={kind} /> : null}
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
function whoseTurn({ curr, next, addr }: { curr: string; next: string; addr?: string }): Turn {
	if (addr === curr) {
		return Turn.Yours;
	} else if (addr === next) {
		return Turn.Theirs;
	} else {
		return Turn.Spectating;
	}
}

/**
 * Figure out who won the game, out of the `curr`ent, and `next`
 * players, relative to whose asking (`addr`). `turns` indicates the
 * number of turns we've seen so far, which is used to determine which
 * address corresponds to player X and player O.
 */
function whoWon({
	curr,
	next,
	addr,
	turn: turn,
	trophy,
}: {
	curr: string;
	next: string;
	addr?: string;
	turn: number;
	trophy: Trophy;
}): Winner {
	switch (trophy) {
		case Trophy.None:
			return Winner.None;
		case Trophy.Draw:
			return Winner.Draw;
		case Trophy.Win:
			// These tests are "backwards" because the game advances to the
			// next turn after the win has happened. Nevertheless, make sure
			// to test for the "you" case before the "them" case to handle a
			// situation where a player is playing themselves.
			if (addr === next) {
				return Winner.You;
			} else if (addr === curr) {
				return Winner.Them;
			} else if (turn % 2 == 0) {
				return Winner.O;
			} else {
				return Winner.X;
			}
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

function WinIndicator({ winner }: { winner: Winner }): ReactElement | null {
	switch (winner) {
		case Winner.None:
			return null;
		case Winner.Draw:
			return <Badge color="orange">Draw!</Badge>;
		case Winner.You:
			return <Badge color="green">You Win!</Badge>;
		case Winner.Them:
			return <Badge color="red">You Lose!</Badge>;
		case Winner.X:
			return <Badge color="blue">X Wins!</Badge>;
		case Winner.O:
			return <Badge color="blue">O Wins!</Badge>;
	}
}

function DeleteButton({ id, kind }: { id: string; kind: string }): ReactElement {
	const client = useSuiClient();
	const packageId = useNetworkVariable('packageId');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	const onDelete = () => {
		const tx = new Transaction();

		tx.moveCall({
			target: `${packageId}::${kind}::burn`,
			arguments: [tx.object(id)],
		});

		signAndExecute(
			{
				transaction: tx,
			},
			{
				onSuccess: ({ digest }) => {
					client.waitForTransaction({ digest }).then(() => {
						// Navigate back to homepage, because the game is gone now.
						window.location.href = '/';
					});
				},

				onError: (error) => {
					console.error('Failed to execute transaction', error);
				},
			},
		);
	};

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
					<AlertDialog.Action onClick={onDelete}>
						<Button variant="solid" color="red">
							Delete
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
