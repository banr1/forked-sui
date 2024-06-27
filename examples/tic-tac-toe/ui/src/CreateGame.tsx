// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@radix-ui/themes';
import { ReactElement, ReactNode } from 'react';

import { useNetworkVariable } from './config';

type Props = {
	kind?: string;
	player?: string;
	opponent?: string;
	onCreateGame: (gameId: string) => void;
	children: ReactNode;
};

/**
 * TODO: Docs
 */
export default function CreateGame({
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
