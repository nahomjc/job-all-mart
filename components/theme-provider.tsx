"use client";

import type * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	// Next.js 16 / React 19: client re-renders reject executable <script> tags.
	// Keep a normal script on the server (prevents theme flash); use a non-JS
	// type on the client so React stops warning after hydration.
	const scriptProps =
		typeof window === "undefined"
			? undefined
			: ({ type: "application/json" } as const);

	return (
		<NextThemesProvider {...props} scriptProps={scriptProps}>
			{children}
		</NextThemesProvider>
	);
}
