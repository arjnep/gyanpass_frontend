"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "../../../components/custom/Loading";
import { Link } from "lucide-react";
import { useAuth } from "@/app/context/auth";
import SuccessAnimation from "@/components/custom/Success";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
import NotFound from "@/app/not-found";
import dynamic from "next/dynamic";
import ArrowLeftIcon from "@/components/custom/ArrowLeft";
import Header from "@/app/components/Header";

const BookDetails = dynamic(() => import("@/app/components/BookDetails"), {
  ssr: false,
});

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
    address: string;
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
}

export default function BookDetailsPage() {
  const router = useRouter();
  const { token, logout, isAuthenticated } = useAuth();

  const { id } = useParams<{ id: string }>(); // Get the book ID from the URL
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditSuccessDialogOpen, setIsEditSuccessDialogOpen] = useState(false);
  const [isDeleteSuccessDialogOpen, setIsDeleteSuccessDialogOpen] =
    useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [bookNotFound, setBookNotFound] = useState(false);

  const handleErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "NOT_FOUND") {
      setBookNotFound(true);
    } else if (err.type == "INTERNAL") {
      setError("Internal Server Error!");
    } else {
      setError("Something unknown went wrong!");
    }
  };

  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use your token storage mechanism
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        handleErrorResponse(errorData);
        return;
      }

      const data = await response.json();
      setError(null);
      setBook(data.book);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;

    const loadBook = async () => {
      await fetchBookDetails();
    };
    loadBook();
  }, [id, token]);

  const handleEdit = async () => {
    await fetchBookDetails();
    setIsEditSuccessDialogOpen(true);
  };

  const handleUpdate = async () => {
    await fetchBookDetails();
  };

  const handleDelete = async () => {
    setIsDeleteSuccessDialogOpen(true);
  };

  const handleDeleteSuccessDialogClose = () => {
    setIsDeleteSuccessDialogOpen(false);
    router.back();
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <div className="py-6 sm:p-6 px-2 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon href="/dashboard" />
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Books</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {bookNotFound ? "..." : book?.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {loading ? (
          <Loading message="Loading book details..." className="mt-10" />
        ) : error ? (
          <div className="text-red-500 my-10 text-lg text-center">{error}</div>
        ) : bookNotFound ? (
          <NotFound
            title="Book Not Found"
            description="The book you are looking for does not exist."
          />
        ) : (
          <BookDetails
            book={book}
            onEdit={handleEdit}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
      <Dialog
        open={isEditSuccessDialogOpen}
        onOpenChange={setIsEditSuccessDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Book Successfully Edited!
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteSuccessDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDeleteSuccessDialogClose();
          return;
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Book Successfully Deleted
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
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
    </div>
  );
}
