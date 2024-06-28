// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@radix-ui/themes';
import { useNetworkVariable } from 'config';
import { ReactElement, ReactNode } from 'react';

type Props = {
	kind?: string;
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
	const client = useSuiClient();
	// SAFETY: <App /> tests that the packageId is available.
	const packageId = useNetworkVariable('packageId')!!;
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	function onClick() {
		const tx = new Transaction();

		// SAFETY: The button is disabled unless player and opponent are
		// available, so we should not receive a click for it.
		const game = tx.moveCall({
			target: `${packageId}::${kind}::new`,
			arguments: [tx.pure.address(player!!), tx.pure.address(opponent!!)],
		});

		if (kind == 'owned') {
			// TODO: Transfer to multi-sig in "owned" case.
			tx.transferObjects([game], player!!);
		}

		signAndExecute(
			{
				transaction: tx,
			},
			{
				onSuccess: ({ digest }) => {
					client
						.waitForTransaction({
							digest,
							options: { showEffects: true },
						})
						.then((tx) => {
							// TODO: In the owned case, we should find the game
							// object, because the turn cap is also created.
							const gameId = tx.effects?.created?.[0].reference?.objectId;
							if (gameId) {
								onCreateGame(gameId);
							}
						});
				},

				onError: (error) => {
					console.error('Failed to execute transaction', error);
				},
			},
		);
	}

	return (
		<Button variant="outline" disabled={!(kind && player && opponent)} onClick={onClick}>
			{children}
		</Button>
	);
}
