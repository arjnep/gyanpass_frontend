"use client";

// pages/request/made/[id].tsx
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RequestDetails from "@/app/components/RequestDetails";
import Loading from "@/components/custom/Loading";
import NotFound from "@/app/not-found";
import { useAuth } from "@/app/context/auth";
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
import { Button } from "@/components/ui/button";
import SuccessAnimation from "@/components/custom/Success";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  image_url: string;
  user_id: string;
  owner: {
    uid: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  location?: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  is_active: boolean;
}

interface ExchangeRequest {
  id: string;
  requested_by_id: string;
  requested_to_id: string;
  requested_book_id: number;
  RequestedBook: Book;
  offered_book_id: number;
  OfferedBook: Book;
  status: string;
  requested_by_confirmed: boolean;
  requested_to_confirmed: boolean;
}

export default function RequestDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>(); // Get the book ID from the URL
  const { token, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [exchangeRequest, setExchangeRequest] =
    useState<ExchangeRequest | null>(null);
  const [
    isDeclineRequestSuccessDialogOpen,
    setIsDeclineRequestSuccessDialogOpen,
  ] = useState(false);
  const [
    isAcceptRequestSuccessDialogOpen,
    setIsAcceptRequestSuccessDialogOpen,
  ] = useState(false);
  const [
    isConfirmRequestSuccessDialogOpen,
    setIsConfirmRequestSuccessDialogOpen,
  ] = useState(false);
  const [
    isCancelRequestSuccessDialogOpen,
    setIsCancelRequestSuccessDialogOpen,
  ] = useState(false);

  const handleErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
        setIsSessionDialogOpen(true);
    } else if (err.type == "NOT_FOUND") {
      return <NotFound />;
    } else if (err.type == "INTERNAL") {
      setError("Internal Server Error!");
    } else {
      setError("Something unknown went wrong!");
    }
  };

  // Fetch the exchange request details
  const fetchExchangeRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/exchange/requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use your token storage mechanism
            "ngrok-skip-browser-warning": "1",
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
      setExchangeRequest(data.request);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch exchange request:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;

    const loadBook = async () => {
      await fetchExchangeRequest();
    };
    loadBook();
  }, [id, token]);

  const handleAccept = async () => {
    await fetchExchangeRequest();
    setIsAcceptRequestSuccessDialogOpen(true);
  };

  const handleDecline = async () => {
    await fetchExchangeRequest();
    setIsDeclineRequestSuccessDialogOpen(true);
  };

  const handleConfirm = async () => {
    await fetchExchangeRequest();
    setIsConfirmRequestSuccessDialogOpen(true);
  };
 
  const handleCancel = async () => {
    setIsCancelRequestSuccessDialogOpen(true);
  };

  const handleUpdate = async () => {
    await fetchExchangeRequest();
  }

  const handleCancelRequestSuccessDialogClose = () => {
    setIsCancelRequestSuccessDialogOpen(false);
    router.back();
  };
 
  
  if (loading) {
    return <Loading message="Loading Request details..." className="mt-10" />;
  }

  if (error) {
    return (
      <div className="text-red-500 my-10 text-lg text-center">{error}</div>
    );
  }

  if (!exchangeRequest) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <RequestDetails
        request={exchangeRequest}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        onUpdate={handleUpdate}
      />

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

      <Dialog
        open={isAcceptRequestSuccessDialogOpen}
        onOpenChange={setIsAcceptRequestSuccessDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accepted</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Exchange Request Accepted Successfully! <br />
                Now You can see the Owner Details and the Pickup Location.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeclineRequestSuccessDialogOpen}
        onOpenChange={setIsDeclineRequestSuccessDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Declined</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Exchange Request Declined Successfully! <br />
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConfirmRequestSuccessDialogOpen}
        onOpenChange={setIsConfirmRequestSuccessDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmed</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Your Confirmation of this request is success! <br /> See the Updated Status.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCancelRequestSuccessDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelRequestSuccessDialogClose();
          return;
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelled</DialogTitle>
            <DialogDescription>
              <SuccessAnimation />
              <p className="text-xl text-center text-gray-950">
                Request Cancelled Successsfully!
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
