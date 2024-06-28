// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSuiClientContext, useSuiClientQuery } from '@mysten/dapp-kit';
import { GetObjectParams, SuiObjectResponse } from '@mysten/sui/client';
import { useQueryClient, UseQueryResult } from '@tanstack/react-query';

export type UseObjectQueryResponse = UseQueryResult<SuiObjectResponse, Error>;
export type InvalidateUseObjectQuery = () => void;

/**
 * Fetches an object, returning the response from RPC and a callback
 * to invalidate it.
 */
export function useObjectQuery(
	params: GetObjectParams,
): [UseObjectQueryResponse, InvalidateUseObjectQuery] {
	const ctx = useSuiClientContext();
	const client = useQueryClient();
	const response = useSuiClientQuery('getObject', params);

	const invalidate = async () => {
		await client.invalidateQueries({ queryKey: [ctx.network, 'getObject', params] });
	};

	return [response, invalidate];
}
