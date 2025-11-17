import Image from "next/image";

export default function Logo() {
	return (
		<Image
			src="/logo-png.png"
			alt="Traff 29 logo"
			width={40}
			height={40}
			priority
			className="h-10 w-10"
		/>
	);
}
