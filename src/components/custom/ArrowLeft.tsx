"use client"

import { cn } from "@/lib/utils"
import Link from "next/link";

interface ArrowLeftProps {
  href?: string;
  className?: string;
}

const ArrowLeftIcon: React.FC<ArrowLeftProps> = ({ href = "#", className }) => {
  return (
      <Link
        href={href}
        className={cn("inline-flex items-center justify-center rounded-full bg-muted p-2 hover:bg-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}
        prefetch={false}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </Link>
  );
}

export default ArrowLeftIcon;