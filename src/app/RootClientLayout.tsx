"use client";

import { usePathname } from "next/navigation";
import RootServerLayout from "./RootServerLayout";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader = pathname !== "/auth";

  return <RootServerLayout showHeader={showHeader}>{children}</RootServerLayout>;
}
