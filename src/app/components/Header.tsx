"use client";

import { useAuth } from "../context/auth";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { SVGProps, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isLogoutDialogOpen, setisLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {isAuthenticated ? (
        <header className="bg-background px-4 lg:px-6 h-20 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center justify-center"
            prefetch={false}
          >
            <BookIcon className="h-12 w-12" />
            <span className="sr-only">Book Exchange</span>
          </Link>
          
          <AlertDialog
            open={isLogoutDialogOpen}
            onOpenChange={setisLogoutDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                <AvatarFallback>JP</AvatarFallback>
                <span className="sr-only">Toggle user menu</span>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/account">My Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setisLogoutDialogOpen(true)}>
                Logout
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

        </header>
      ) : (
        <header className="bg-background px-4 lg:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center"
            prefetch={false}
          >
            <BookIcon className="h-6 w-6" />
            <span className="sr-only">Book Exchange</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
              >
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="lg:hidden">
              <nav className="grid gap-4 sm:gap-6 py-6">
                <Link
                  href="#featured-books"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  Featured Books
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  How It Works
                </Link>
                <Link
                  href="#about"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  Contact
                </Link>
              </nav>
              <div className="flex gap-4 sm:gap-6 rounded-full border border-muted py-2 px-4">
                <Link
                  href="/auth"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="text-sm font-medium hover:underline underline-offset-4"
                  prefetch={false}
                >
                  Sign Up
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <nav className="hidden lg:flex gap-4 sm:gap-6 rounded-full border border-muted py-2 px-4">
            <Link
              href="#featured-books"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Featured Books
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Contact
            </Link>
          </nav>
          <div className="hidden lg:flex gap-4 sm:gap-6 rounded-full border border-muted py-2 px-4">
            <Link
              href="/auth"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Login
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Sign Up
            </Link>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CurrencyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <circle cx="12" cy="12" r="8" />
      <line x1="3" x2="6" y1="3" y2="6" />
      <line x1="21" x2="18" y1="3" y2="6" />
      <line x1="3" x2="6" y1="21" y2="18" />
      <line x1="21" x2="18" y1="21" y2="18" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function ReplyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
