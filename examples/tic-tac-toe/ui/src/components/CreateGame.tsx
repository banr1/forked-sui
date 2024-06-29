// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@radix-ui/themes';
import { useExecutor } from 'hooks/useExecutor';
import { Kind } from 'hooks/useGameQuery';
import { useTransactions } from 'hooks/useTransactions';
import { ReactElement, ReactNode } from 'react';

type Props = {
	kind?: Kind;
	player?: string;
	opponent?: string;
	onCreateGame: (gameId: string) => void;
	children: ReactNode;
};

/**
 * Button to create a new game. `kind` controls whether it's a
 * `shared` or an `owned` game and `player` and `opponent` are the two
 * players for the game.
 *
 * `onCreateGame` is a callback that will be called with the ID of the
 * game that was just created, (if/when that happens).
 *
 * The body of the button is customisable (exposed via nesting).
 */
export function CreateGame({
	kind,
	player,
	opponent,
	onCreateGame,
	children,
}: Props): ReactElement {
	// SAFETY: <App /> tests that a package exists, so Transactions
	// builder should be available.
	const tx = useTransactions()!!;
	const signAndExecute = useExecutor();

	function onClick() {
		signAndExecute(
			{
				tx: tx.newGame(kind!!, player!!, opponent!!),
				options: { showEffects: true },
			},
			({ effects }) => {
				// TODO: In the owned case, we should find the game object,
				// because the turn cap is also created.
				const gameId = effects?.created?.[0].reference?.objectId;
				if (gameId) {
					onCreateGame(gameId);
				}
			},
		);
	}

	return (
		<Button variant="outline" disabled={!(kind && player && opponent)} onClick={onClick}>
			{children}
		</Button>
	);
}
