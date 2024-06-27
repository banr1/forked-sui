// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { Button, Flex, Link, Tooltip } from '@radix-ui/themes';
import { ReactElement, useState } from 'react';
import toast from 'react-hot-toast';

import { useNetworkVariable } from './config';

type Props = {
	id: string;
	size?: '1' | '2' | '3' | '4';
	display?: 'none' | 'flex' | 'inline-flex';
};

/**
 * Renders an Object ID.
 *
 * The ID is represented in a contracted form and acts as a link to
 * view the object in an explorer. It also has a tooltip to show its
 * full value and a button to copy that value to the clipboard.
 *
 * The optional `size` parameter controls how big the ID is, in
 * Radix's size units.
 */
export default function IDLink({ id, size, display }: Props): ReactElement {
	const explorer = useNetworkVariable('explorer');
	size = size ?? '1';

	const [copied, setCopied] = useState(false);
	const onClick = async () => {
		await navigator.clipboard.writeText(id);
		setCopied(true);
		setTimeout(() => setCopied(false), 1000);
		toast.success('Copied ID to clipboard!');
	};

	return (
		<Flex align="center" display={display}>
			<Tooltip content={id}>
				<Link href={explorer(id)} target="_blank" size={size}>
					{truncateId(id)}
				</Link>
			</Tooltip>
			<Tooltip content="Copy Object ID">
				<Button size={size} ml="2" onClick={onClick} variant={copied ? 'outline' : 'soft'}>
					{copied ? <CheckIcon /> : <CopyIcon />}
				</Button>
			</Tooltip>
		</Flex>
	);
}

function truncateId(id: string) {
	return id.length <= 9 ? id : id.slice(0, 3) + '...' + id.slice(-3);
}
