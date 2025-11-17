import Image from "next/image";

type LogoProps = {
	size?: number;
	className?: string;
};

export default function Logo({ size = 40, className }: LogoProps) {
	return (
		<Image
			src="/logo-png.png"
			alt="Traff 29 logo"
			width={size}
			height={size}
			priority
			className={className ?? "h-10 w-10"}
		/>
	);
}
