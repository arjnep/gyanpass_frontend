import { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "GyanPass",
  description: "A platform to pass knowledge with books exchange.",
};

interface RootServerLayoutProps {
  children: ReactNode;
  showHeader: boolean;
}

export default function RootServerLayout({
  children,
  showHeader,
}: RootServerLayoutProps) {
  return (
    <html className="scroll-smooth" lang="en">
      <body className={poppins.className}>
        <div className="flex flex-col min-h-[100dvh]">
          {showHeader && <Header />}
          {children}
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
