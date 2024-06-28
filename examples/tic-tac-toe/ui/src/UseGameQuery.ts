// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { UseQueryResult } from '@tanstack/react-query';

import { useNetworkVariable } from './config';
import { useObjectQuery, UseObjectQueryResponse } from './UseObjectQuery';

/** Variants of the tic-tac-toe protocol */
export type Kind = 'shared' | 'owned';

/** Marks on the game baord */
export enum Mark {
	/** No mark */
	_ = 0,
	/** Marked by player X */
	X,
	/** Marked by player O */
	O,
}

/** State of the game, deserialized from its Move Object */
export type Game = {
	/** Whether it's a 'shared' or an 'owned' game */
	kind: Kind;

	/** Current state of the game board, 9 marks in row-major order. */
	board: Mark[];

	/** Number of turns played so far. */
	turn: number;

	/** Address of the player controlling X */
	x: string;

	/** Address of the player controlling O */
	o: string;
};

export type UseGameQueryResult = UseQueryResult<Game, Error>;
export type InvalidateGameQuery = () => void;

/**
 * Hook to fetch a Game object from RPC by its ID.
 *
 * Will return an error if the object cannot be fetched, or is the
 * incorrect type. Returns a query result and a function to invalidate
 * the query.
 */
export function useGameQuery(id: string): [UseGameQueryResult, InvalidateGameQuery] {
	const packageId = useNetworkVariable('packageId');
	const [response, invalidate] = useObjectQuery({
		id,
		options: { showType: true, showContent: true },
	});

	// Wait for the query to succeed before doing any further work.
	if (response.status != 'success') {
		return [response as UseGameQueryResult, invalidate];
	}

	const data = response.data.data;
	if (!data) {
		return [toError(response, 'Failed to fetch game'), invalidate];
	}

	const reType = new RegExp(`^${packageId}::(shared|owned)::Game`);
	const { type, content } = data;

	let mType;
	if (!type || !(mType = type.match(reType)) || !content || content.dataType != 'moveObject') {
		return [toError(response, 'Object is not a Game'), invalidate];
	}

	const kind = mType[1] as Kind;
	const { board, turn, x, o } = content.fields as Game;

	const success = {
		...response,
		data: { kind, board, turn, x, o },
	};

	return [success as UseGameQueryResult, invalidate];
}

function toError(response: UseObjectQueryResponse, message: string): UseGameQueryResult {
	return {
		...response,
		data: undefined,
		error: Error(message),
		isError: true,
		isLoadingError: true,
		isSuccess: false,
		status: 'error',
	} as UseGameQueryResult;
}