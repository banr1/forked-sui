// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useNetworkVariable } from 'config';
import { Kind } from 'hooks/useGameQuery';

export enum Trophy {
	None = 0,
	Draw,
	Win,
}

export type UseTrophyQueryResponse = UseQueryResult<Trophy, Error>;
export type InvalidateTrophy = () => void;

/**
 * Query the trophy state of the game (whether the game has a winner
 * or not).
 *
 * `id` is the Object ID of the game, and `kind` is what kind of game
 * it is (whether it is shared or owned). The query in this hook
 * depends on the value of `kind` (will not be enabled unless `kind`
 * is available).
 */
export function useTrophyQuery(
	id: string,
	kind?: Kind,
): [UseTrophyQueryResponse, InvalidateTrophy] {
	const client = useSuiClient();
	const queryClient = useQueryClient();
	const packageId = useNetworkVariable('packageId');

	const response = useQuery({
		enabled: !!kind,
		queryKey: ['game-end-state', id],
		queryFn: async () => {
			const tx = new Transaction();

			tx.moveCall({
				target: `${packageId}::${kind}::ended`,
				arguments: [tx.object(id)],
			});

			const { results } = await client.devInspectTransactionBlock({
				// It doesn't matter who's sending this query.
				sender: normalizeSuiAddress('0x0'),
				transactionBlock: tx,
			});

			const trophy = results?.[0]?.returnValues?.[0]?.[0]?.[0];
			if (trophy === undefined) {
				throw new Error('Failed to get game state');
			}

			return trophy as Trophy;
		},
	});

	const invalidate = async () => {
		await queryClient.invalidateQueries({ queryKey: ['game-end-state', id] });
	};

	return [response, invalidate];
}
