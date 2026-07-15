"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Joyride,
	STATUS,
	type EventData,
	type Options,
	type PartialDeep,
	type Step,
	type Styles,
} from "react-joyride";
import { useTheme } from "next-themes";

const STORAGE_PREFIX = "mak-advert-tour:";

/** Fire this event (optionally scoped by key) to (re)start a tour. */
export const TOUR_START_EVENT = "product-tour:start";

export function startProductTour(key?: string) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(TOUR_START_EVENT, { detail: { key } }));
}

interface ProductTourProps {
	/** Unique key so each area (dashboard, admin) tracks its own completion. */
	tourKey: string;
	steps: Step[];
}

export function ProductTour({ tourKey, steps }: ProductTourProps) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [run, setRun] = useState(false);

	const storageKey = `${STORAGE_PREFIX}${tourKey}`;

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		let seen = false;
		try {
			seen = window.localStorage.getItem(storageKey) === "done";
		} catch {
			seen = false;
		}
		if (!seen) {
			const t = window.setTimeout(() => setRun(true), 600);
			return () => window.clearTimeout(t);
		}
	}, [mounted, storageKey]);

	useEffect(() => {
		if (!mounted) return;
		const onStart = (e: Event) => {
			const detail = (e as CustomEvent<{ key?: string }>).detail;
			if (detail?.key && detail.key !== tourKey) return;
			setRun(false);
			window.setTimeout(() => setRun(true), 50);
		};
		window.addEventListener(TOUR_START_EVENT, onStart);
		return () => window.removeEventListener(TOUR_START_EVENT, onStart);
	}, [mounted, tourKey]);

	const handleEvent = useCallback(
		(data: EventData) => {
			if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
				setRun(false);
				try {
					window.localStorage.setItem(storageKey, "done");
				} catch {
					/* ignore */
				}
			}
		},
		[storageKey],
	);

	if (!mounted) return null;

	const isDark = resolvedTheme === "dark";

	const options: Partial<Options> = {
		primaryColor: "#e6c84a",
		textColor: isDark ? "#f7f1d8" : "#1c1917",
		backgroundColor: isDark ? "#1a1508" : "#ffffff",
		arrowColor: isDark ? "#1a1508" : "#ffffff",
		overlayColor: "rgba(26, 21, 8, 0.6)",
		zIndex: 10000,
		showProgress: true,
		skipBeacon: true,
		buttons: ["back", "skip", "primary"],
	};

	const styles: PartialDeep<Styles> = {
		tooltip: {
			borderRadius: 16,
			fontSize: 14,
		},
		tooltipContainer: {
			textAlign: "left",
		},
		buttonPrimary: {
			borderRadius: 10,
			fontSize: 13,
			padding: "8px 14px",
		},
		buttonBack: {
			borderRadius: 10,
			fontSize: 13,
			color: isDark ? "#a8a29e" : "#78716c",
		},
		buttonSkip: {
			fontSize: 13,
			color: isDark ? "#a8a29e" : "#78716c",
		},
	};

	return (
		<Joyride
			steps={steps}
			run={run}
			continuous
			scrollToFirstStep
			onEvent={handleEvent}
			options={options}
			styles={styles}
			locale={{
				back: "Back",
				close: "Close",
				last: "Finish",
				next: "Next",
				skip: "Skip tour",
			}}
		/>
	);
}
