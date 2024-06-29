// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

type Options = Omit<Parameters<SuiClient['getTransactionBlock']>[0], 'digest'> & {
	tx: Transaction;
};
type Callback = (tx: SuiTransactionBlockResponse) => void | Promise<void>;
type Executor = (options: Options, then: Callback) => void;

/**
 * Hook encapsulating running a transaction, waiting for its effects
 * and then doing something with them.
 */
export function useExecutor(): Executor {
	const client = useSuiClient();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	return ({ tx, ...options }, then) => {
		signAndExecute(
			{
				transaction: tx,
			},
			{
				onSuccess: ({ digest }) => {
					client.waitForTransaction({ digest, ...options }).then(then);
				},

				onError: (error) => {
					console.error('Failed to execute transaction', tx, error);
				},
			},
		);
	};
}
