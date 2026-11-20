import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface BrandLogoProps {
  isHeroTransparent?: boolean;
  onClick?: () => void;
  className?: string;
}
export default function BrandLogo({
  isHeroTransparent = false,
  onClick,
  className = "",
}: BrandLogoProps) {
  const textColor = isHeroTransparent ? "text-white" : "text-ink";
  const iconBg = isHeroTransparent ? "bg-white dark:bg-black" : "";
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 cursor-pointer transition-opacity duration-200 ease-out hover:opacity-80 ${className}`}
    >
      <span
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md transition-transform duration-200 ease-out group-hover:scale-102 ${iconBg}`}
      >
        <Image
          src="/icons/icon.svg"
          alt={`${siteConfig.name} logo`}
          aria-hidden="true"
          width={28}
          height={28}
          loading="eager"
          unoptimized
          className="h-full w-full object-contain"
        />
      </span>
      <span
        className={`font-serif text-[1.375rem] leading-none tracking-tight transition-colors duration-200 ${textColor}`}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
