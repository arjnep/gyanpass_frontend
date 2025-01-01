"use client";

import { useAuth } from "./context/auth"; // Adjust the import path as needed
import { useRouter } from "next/navigation";
import { SVGProps, useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import BookCard from "./components/BookCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { BookIcon, MenuIcon } from "lucide-react";
import Loading from "@/components/custom/Loading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: {
    message: string;
    condition: string;
    preferred_exchange: string;
  };
  image_url: string;
  owner: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch books whenever the filter, searchTerm, or page changes
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = `page=1&size=4`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/search?${query}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();

      if (data && data.books) {
        setFeaturedBooks(data.books);
      } else {
        setFeaturedBooks([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* <Header /> */}
      <header className="bg-background px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <BookIcon className="h-6 w-6" />
          <span className="sr-only">GyanPass</span>
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
            </nav>
            <div className="flex gap-x-2">
              <div className="flex items-center gap-4 sm:gap-6 rounded-full border border-muted py-2 px-4">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:underline underline-offset-4"
                    prefetch={false}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              <ThemeToggle />
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
        </nav>
        <div className="hidden lg:flex gap-x-2">
          <div className="hidden items-center lg:flex gap-4 sm:gap-6 rounded-full border border-muted py-2 px-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    GyanPass
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join our book exchange platform and explore a world of
                    sharing and passing knowledge. Request a book, exchange and start reading today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Request a Book
                    </Link>
                  )}
                </div>
              </div>
              <img
                src="/hero.svg"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                width="550"
                height="550"
              />
            </div>
          </div>
        </section>
        <section
          id="featured-books"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Featured Books
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out our selection of featured books available for
                  exchange.
                </p>
              </div>
            </div>
            {loading && (
              <Loading className="bg-transparent" message="Loading..." />
            )}
            {error && (
              <div className="text-red-500 my-10 text-lg text-center">
                {error}
              </div>
            )}
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-12">
              {featuredBooks && featuredBooks.length > 0
                ? featuredBooks.map((book: Book) => (
                    <BookCard
                      key={book.id}
                      title={book.title}
                      author={book.author}
                      genre={book.genre}
                      coverUrl={book.image_url}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          isAuthenticated
                            ? router.push(`/book/${book.id}`)
                            : setIsAuthDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </BookCard>
                  ))
                : !loading && (
                    <div className="my-10 text-center text-2xl">
                      No books found!
                    </div>
                  )}
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-[url('/hero2.svg')]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the simple steps to start exchanging books with
                  others.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-2">
                <SearchIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">1. Search for Books</h3>
                <p className="text-muted-foreground">
                  Browse our selection of available books and find the ones you
                  are interested in.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <ReplyIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">2. Request a Book</h3>
                <p className="text-muted-foreground">
                  Submit a request to exchange a book you have for the one you
                  would like to read.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <CurrencyIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">3. Exchange Books</h3>
                <p className="text-muted-foreground">
                  Once your request is approved, we will facilitate the book
                  exchange process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unauthenticated</DialogTitle>
            <DialogDescription>You have to sign in.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  setIsAuthDialogOpen(false);
                  router.push("/auth");
                }}
              >
                Sign in
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
