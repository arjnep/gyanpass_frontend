import React, { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "./BookCard"; // Import your BookCard component
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "../context/auth";
import Loading from "../../components/custom/Loading";
import Link from "next/link";

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
  user_id: string;
  owner: {
    uid: string;
    first_name: string;
    last_name: string;
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
}

const MyBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { token, logout } = useAuth();

  const handleErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setError("Internal Server Error!");
    } else {
      setError("Something unknown went wrong!");
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/books/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use your token storage mechanism
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        handleErrorResponse(errorData);
        return;
      }

      const data = await response.json();
      setBooks(data.books);
    } catch (err: any) {
      setError(err.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [token, fetchBooks()]);

  //   if (loading) return <p>Loading...</p>;

  return (
    // <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-4">
        {loading && (
          <Loading message="Loading..." />
        )}
        {error && (
          <div className="text-red-500 my-10 text-lg text-center">{error}</div>
        )}

        {books && books.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {books.map((book: Book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                coverUrl={book.image_url}
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
          !loading && (
            <div className="my-10 text-center text-2xl">No books found!</div>
          )
        )}

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
      </CardContent>
    </Card>
  );
};

export default MyBooks;
