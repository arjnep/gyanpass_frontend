import { Input } from "@/components/ui/input";
import { SVGProps, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookCard from "./BookCard";
import { Button } from "@/components/ui/button";
import PaginationComponent from "../../components/custom/Pagination";
import Loading from "../../components/custom/Loading";
import Link from "next/link";
import { useAuth } from "../context/auth";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  owner: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

export default function Search() {
  const { validateToken, logout } = useAuth();
  const [filter, setFilter] = useState<string>("title");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {

    const checkToken = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          setIsSessionDialogOpen(true)
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    };

    checkToken();
  }, [validateToken]);

  useEffect(() => {
    // Fetch books whenever the filter, searchTerm, or page changes
    fetchBooks();
  }, [filter, searchTerm, page]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = `page=${page}&size=${size}`;
      if (searchTerm) {
        query += `&${filter}=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/search?${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "1",
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();

      if (data && data.books) {
        setBooks(data.books);
        setTotalPages(data.total_pages || 0);
      } else {
        setBooks([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setSearchTerm(""); // Reset search term when filter changes
    setPage(1); // Reset to the first page
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Select defaultValue="title" onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="address">Address</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search by ${filter}`}
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && (
            <Loading message="Loading..." />
        )}
        {error && <div className="text-red-500 my-10 text-lg text-center">{error}</div>}

        {books && books.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {books.map((book: Book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                coverUrl="/placeholder.svg"
              >
                <Link href={`/book/${book.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
                </Link>
              </BookCard>
            ))}
          </div>
        ) : (
          !loading && <div className="my-10 text-center text-2xl">No books found!</div>
        )}

        {totalPages > 1 && (
        <PaginationComponent page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </CardContent>
    </Card>
    <Dialog
          open={isSessionDialogOpen}
          onOpenChange={setIsSessionDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session Expired</DialogTitle>
              <DialogDescription>
                Your session has expired. Please log in again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setIsSessionDialogOpen(false);
                    logout();
                  }}
                >
                  Login
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
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
