// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Argument, Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';

export interface ZkBagContractOptions {
	packageId: string;
	bagStoreId: string;
	bagStoreTableId: string;
}

export const MAINNET_CONTRACT_IDS: ZkBagContractOptions = {
	packageId: '0x5bb7d0bb3240011336ca9015f553b2646302a4f05f821160344e9ec5a988f740',
	bagStoreId: '0x65b215a3f2a951c94313a89c43f0adbd2fd9ea78a0badf81e27d1c9868a8b6fe',
	bagStoreTableId: '0x616db54ca564660cd58e36a4548be68b289371ef2611485c62c374a60960084e',
};

export const TESTNET_CONTRACT_IDS: ZkBagContractOptions = {
	packageId: '0x036fee67274d0d85c3532f58296abe0dee86b93864f1b2b9074be6adb388f138',
	bagStoreId: '0x5c63e71734c82c48a3cb9124c54001d1a09736cfb1668b3b30cd92a96dd4d0ce',
	bagStoreTableId: '0x4e1bc4085d64005e03eb4eab2510d527aeba9548cda431cb8f149ff37451f870',
};

export class ZkBag<IDs> {
	#package: string;
	#module = 'zk_bag' as const;
	ids: IDs;

	constructor(packageAddress: string, ids: IDs) {
		this.#package = packageAddress;
		this.ids = ids;
	}

	new(
		tx: Transaction,
		{
			arguments: [store, receiver],
		}: {
			arguments: [store: TransactionObjectArgument | string, receiver: Argument | string];
		},
	) {
		tx.moveCall({
			target: `${this.#package}::${this.#module}::new`,
			arguments: [
				tx.object(store),
				typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
			],
		});
	}

	add(
		tx: Transaction,
		{
			arguments: [store, receiver, item],
			typeArguments,
		}: {
			arguments: [
				store: TransactionObjectArgument | string,
				receiver: Argument | string,
				item: TransactionObjectArgument | string,
			];
			typeArguments: [string];
		},
	): Extract<Argument, { $kind: 'Result' }> {
		return tx.moveCall({
			target: `${this.#package}::${this.#module}::add`,
			arguments: [
				tx.object(store),
				typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
				tx.object(item),
			],
			typeArguments: typeArguments,
		});
	}

	init_claim(
		tx: Transaction,
		{
			arguments: [store],
		}: {
			arguments: [store: TransactionObjectArgument | string];
		},
	) {
		const [bag, claimProof] = tx.moveCall({
			target: `${this.#package}::${this.#module}::init_claim`,
			arguments: [tx.object(store)],
		});

		return [bag, claimProof] as const;
	}

	reclaim(
		tx: Transaction,
		{
			arguments: [store, receiver],
		}: {
			arguments: [store: TransactionObjectArgument | string, receiver: Argument | string];
		},
	) {
		const [bag, claimProof] = tx.moveCall({
			target: `${this.#package}::${this.#module}::reclaim`,
			arguments: [
				tx.object(store),
				typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
			],
		});

		return [bag, claimProof] as const;
	}

	claim(
		tx: Transaction,
		{
			arguments: [bag, claim, id],
			typeArguments,
		}: {
			arguments: [
				bag: TransactionObjectArgument | string,
				claim: Extract<Argument, { $kind: 'NestedResult' }>,
				id: TransactionObjectArgument | string,
			];
			typeArguments: [string];
		},
	): Extract<Argument, { $kind: 'Result' }> {
		return tx.moveCall({
			target: `${this.#package}::${this.#module}::claim`,
			arguments: [tx.object(bag), tx.object(claim), typeof id === 'string' ? tx.object(id) : id],
			typeArguments,
		});
	}

	finalize(
		tx: Transaction,
		{
			arguments: [bag, claim],
		}: {
			arguments: [
				bag: TransactionObjectArgument | string,
				claim: Extract<Argument, { $kind: 'NestedResult' }>,
			];
		},
	) {
		tx.moveCall({
			target: `${this.#package}::${this.#module}::finalize`,
			arguments: [tx.object(bag), tx.object(claim)],
		});
	}

	update_receiver(
		tx: Transaction,
		{
			arguments: [bag, from, to],
		}: {
			arguments: [
				bag: TransactionObjectArgument | string,
				from: Argument | string,
				to: Argument | string,
			];
		},
	) {
		tx.moveCall({
			target: `${this.#package}::${this.#module}::update_receiver`,
			arguments: [
				tx.object(bag),
				typeof from === 'string' ? tx.pure.address(from) : from,
				typeof to === 'string' ? tx.pure.address(to) : to,
			],
		});
	}
}
