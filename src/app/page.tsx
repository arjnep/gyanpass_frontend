'use client';

import { useAuth } from './context/auth'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
import { SVGProps, useEffect } from 'react';
import Link from 'next/link';


export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
        {/* <Header /> */}
        <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover New Books to Read
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join our book exchange platform and explore a world of literary adventures. Request a book and start
                    reading today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/auth"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Request a Book
                  </Link>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                width="550"
                height="550"
              />
            </div>
          </div>
        </section>
        <section id='featured-books' className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Books</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out our selection of featured books available for exchange.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-2">
                <img
                  src="/placeholder.svg"
                  alt="Book Cover"
                  className="aspect-[3/4] overflow-hidden rounded-lg object-cover"
                  width="150"
                  height="200"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold">The Great Gatsby</h3>
                  <p className="text-muted-foreground">F. Scott Fitzgerald</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <img
                  src="/placeholder.svg"
                  alt="Book Cover"
                  className="aspect-[3/4] overflow-hidden rounded-lg object-cover"
                  width="150"
                  height="200"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold">To Kill a Mockingbird</h3>
                  <p className="text-muted-foreground">Harper Lee</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <img
                  src="/placeholder.svg"
                  alt="Book Cover"
                  className="aspect-[3/4] overflow-hidden rounded-lg object-cover"
                  width="150"
                  height="200"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold">1984</h3>
                  <p className="text-muted-foreground">George Orwell</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <img
                  src="/placeholder.svg"
                  alt="Book Cover"
                  className="aspect-[3/4] overflow-hidden rounded-lg object-cover"
                  width="150"
                  height="200"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold">Pride and Prejudice</h3>
                  <p className="text-muted-foreground">Jane Austen</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id='how-it-works' className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the simple steps to start exchanging books with others.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-2">
                <SearchIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">1. Search for Books</h3>
                <p className="text-muted-foreground">
                  Browse our selection of available books and find the ones you're interested in.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <ReplyIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">2. Request a Book</h3>
                <p className="text-muted-foreground">
                  Submit a request to exchange a book you have for the one you'd like to read.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <CurrencyIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">3. Exchange Books</h3>
                <p className="text-muted-foreground">
                  Once your request is approved, we'll facilitate the book exchange process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
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
  )
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
  )
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
  )
}
