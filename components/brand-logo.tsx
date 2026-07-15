import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/photo_2026-07-12_22-27-04.jpg";

interface BrandLogoProps {
	size?: number;
	className?: string;
	priority?: boolean;
}

export function BrandLogo({
	size = 32,
	className,
	priority = false,
}: BrandLogoProps) {
	return (
		<span
			className={cn(
				"relative shrink-0 overflow-hidden rounded-full shadow-sm",
				className,
			)}
			style={{ width: size, height: size }}
		>
			<Image
				src={BRAND_LOGO_SRC}
				alt="MAK Adverts"
				fill
				sizes={`${size}px`}
				className="object-cover"
				priority={priority}
			/>
		</span>
	);
}
