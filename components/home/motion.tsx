"use client";

import {
	motion,
	useReducedMotion,
	type HTMLMotionProps,
	type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 40 },
	visible: (i = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, delay: i * 0.08, ease: EASE },
	}),
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.92 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.55, ease: EASE },
	},
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -48 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: EASE },
	},
};

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 48 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: EASE },
	},
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1, delayChildren: 0.06 },
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: EASE },
	},
};

const defaultViewport = { once: true, margin: "-10% 0px -10% 0px" as const };

type MotionSectionProps = HTMLMotionProps<"section"> & {
	children: React.ReactNode;
	delay?: number;
};

export function MotionSection({
	children,
	className,
	delay = 0,
	...props
}: MotionSectionProps) {
	const reduce = useReducedMotion();
	return (
		<motion.section
			initial={reduce ? false : { opacity: 0, y: 56 }}
			whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
			viewport={defaultViewport}
			transition={{ duration: 0.75, delay, ease: EASE }}
			className={className}
			{...props}
		>
			{children}
		</motion.section>
	);
}

type MotionBlockProps = HTMLMotionProps<"div"> & {
	children: React.ReactNode;
	variant?: "fadeUp" | "scaleIn" | "slideLeft" | "slideRight";
};

export function MotionBlock({
	children,
	className,
	variant = "fadeUp",
	...props
}: MotionBlockProps) {
	const variants = {
		fadeUp,
		scaleIn,
		slideLeft: slideInLeft,
		slideRight: slideInRight,
	}[variant];

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={defaultViewport}
			variants={variants}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={defaultViewport}
			variants={staggerContainer}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerChild({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<motion.div variants={staggerItem} className={className}>
			{children}
		</motion.div>
	);
}

export function HoverLift({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const reduce = useReducedMotion();
	return (
		<motion.div
			whileHover={reduce ? undefined : { y: -6, scale: 1.02 }}
			whileTap={reduce ? undefined : { scale: 0.98 }}
			transition={{ type: "spring", stiffness: 400, damping: 22 }}
			className={cn(className)}
		>
			{children}
		</motion.div>
	);
}
