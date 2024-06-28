// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSuiClientContext, useSuiClientQuery } from '@mysten/dapp-kit';
import { GetObjectParams, SuiObjectResponse } from '@mysten/sui/client';
import { useQueryClient, UseQueryResult } from '@tanstack/react-query';

type Response = UseQueryResult<SuiObjectResponse, Error>;
type Invalidate = () => void;

/**
 * Fetches an object, returning the response from RPC and a callback
 * to invalidate it.
 */
export function useObject(params: GetObjectParams): [Response, Invalidate] {
	const ctx = useSuiClientContext();
	const client = useQueryClient();
	const response = useSuiClientQuery('getObject', params);

	const forceUpdate = async () => {
		await client.invalidateQueries({ queryKey: [ctx.network, 'getObject', params] });
	};

	return [response, forceUpdate];
}
