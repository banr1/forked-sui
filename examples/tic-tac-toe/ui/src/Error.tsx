// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout, Container, Heading } from "@radix-ui/themes";
import { ReactElement, ReactNode } from "react";

interface Props {
	title: string;
	children: ReactNode;
};

export default function Error({ title, children }: Props): ReactElement {
	return (
		<Container size="1" px="2">
			<Callout.Root color="red" role="alert" size="3" variant="surface">
				<Callout.Icon>
					<ExclamationTriangleIcon />
				</Callout.Icon>
				<Callout.Text>
					<Heading size="3">{title}</Heading>
					{children}
				</Callout.Text>
			</Callout.Root>
		</Container>
	);
}
