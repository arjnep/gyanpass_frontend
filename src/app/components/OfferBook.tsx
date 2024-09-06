import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import Loading from "@/components/custom/Loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BookCard from "./BookCard";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import SuccessAnimation from "@/components/custom/Success";
import { useRouter } from "next/navigation";

interface BookDetailsProps {
  book: {
    id: number;
    title: string;
    author: string;
    genre: string;
    description: string;
    user_id: number;
    owner: {
      user_id: number;
      first_name: string;
      last_name: string;
      name: string;
      email: string;
      phone: string;
    };
    location: {
      address: number;
      latitude: number;
      longitude: number;
    };
    is_active: boolean;
  };
}

interface OfferBookDialogProps {
  requested_book: BookDetailsProps["book"];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const OfferBookDialog: React.FC<OfferBookDialogProps> = ({
  requested_book,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [books, setBooks] = useState<BookDetailsProps["book"][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const router = useRouter();

  const handleErrorResponse = (errorData: any) => {
    const err = errorData.error;
    if (err.type === "BAD_REQUEST") {
      setError("Bad Request!");
    } else if (err.type === "AUTHORIZATION") {
      setError("Authorization Error");
    } else if (err.type === "INTERNAL") {
      setError("Internal Server Error!");
    } else {
      setError("Something unknown went wrong!");
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch("https://golden-goblin-master.ngrok-free.app/api/books/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "1",
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

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    onClose();
    onUpdate();
  };

  const handleExchangeRequest = async (
    requested_book_id: number,
    offered_book_id: number
  ) => {
    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/exchange/requests/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "1",
          },
          body: JSON.stringify({
            requested_book_id,
            offered_book_id,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        handleErrorResponse(errorData);
        return;
      }
      setIsSuccessDialogOpen(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to accept exchange request:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [token]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose a Book to Offer</DialogTitle>
            <DialogDescription>
              Select a book from the list to offer for {`<b>${requested_book.title}</b>`}
            </DialogDescription>
          </DialogHeader>
          {loading && <Loading message="Loading..." />}
          {error && (
            <div className="text-red-500 my-10 text-lg text-center">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4 overflow-scroll max-h-96">
            {books.length === 0 ? (
              <p>No books available</p>
            ) : books.filter((book) => book.is_active).length === 0 ? (
              <p className="text-center">
                You donot have any active books to offer.
              </p>
            ) : (
              books
                .filter((book) => book.is_active)
                .map((book) => (
                  <div className="grid grid-cols-2 gap-4" key={book.id}>
                    <BookCard
                      key={book.id}
                      title={book.title}
                      author={book.author}
                      genre={book.genre} // Assuming you have genre here
                      coverUrl={"/placeholder.svg"} // Assuming coverUrl is part of the book object
                    >
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          handleExchangeRequest(requested_book.id, book.id)
                        }
                      >
                        Offer Book
                      </Button>
                    </BookCard>
                  </div>
                ))
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="m-auto w-full sm:w-[80%]">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSuccessDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleSuccessDialogClose();
          return;
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Request Sent Successfully!
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OfferBookDialog;
