import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ArrowLeftIcon from "@/components/custom/ArrowLeft";
import { useAuth } from "../context/auth";
import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import SuccessAnimation from "@/components/custom/Success";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { customIcon } from "./Map";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
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

interface RequestDetailsProps {
  request: {
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
  };
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onUpdate: () => void;
}

export default function RequestDetails({
  request,
  onAccept,
  onDecline,
  onCancel,
  onConfirm,
  onUpdate,
}: RequestDetailsProps) {
  const { user, token, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<
    RequestDetailsProps["request"] | null
  >(request); // Initialize with the provided request

  const [isOwnerDetailsDialogOpen, setIsOwnerDetailsDialogOpen] =
    useState(false);
  const [isDeclineRequestDialogOpen, setIsDeclineRequestDialogOpen] =
    useState(false);

  const [isAcceptRequestDialogOpen, setIsAcceptRequestDialogOpen] =
    useState(false);
  const [isCancelRequestDialogOpen, setIsCancelRequestDialogOpen] =
    useState(false);
  const [isConfirmRequestDialogOpen, setIsConfirmRequestDialogOpen] =
    useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  const handleAcceptClick = (request: RequestDetailsProps["request"]) => {
    setSelectedRequest(request);
    setIsAcceptRequestDialogOpen(true);
  };

  const handleDeclineClick = (request: RequestDetailsProps["request"]) => {
    setSelectedRequest(request);
    setIsDeclineRequestDialogOpen(true);
  };

  const handleCancelClick = (request: RequestDetailsProps["request"]) => {
    setSelectedRequest(request);
    setIsCancelRequestDialogOpen(true);
  };

  const handleConfirmClick = (request: RequestDetailsProps["request"]) => {
    setSelectedRequest(request);
    setIsConfirmRequestDialogOpen(true);
  };

  const isRequester = user?.uid === selectedRequest?.requested_by_id;
  const hasConfirmed =
    (user?.uid === selectedRequest?.requested_by_id &&
      selectedRequest?.requested_by_confirmed) ||
    (user?.uid === selectedRequest?.requested_to_id &&
      selectedRequest?.requested_to_confirmed);

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

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/exchange/requests/${request.id}/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
      setIsAcceptRequestDialogOpen(false);
      setError(null);
      setSelectedRequest((prev) =>
        isRequester
          ? prev
            ? { ...prev, requested_by_confirmed: true }
            : null
          : prev
          ? { ...prev, requested_to_confirmed: true }
          : null
      );
      onConfirm();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to confirm exchange request:", err);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/exchange/requests/${request.id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
      setIsAcceptRequestDialogOpen(false);
      setError(null);
      setSelectedRequest((prev) =>
        prev ? { ...prev, status: "accepted" } : null
      );
      onAccept();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to accept exchange request:", err);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/exchange/requests/${request.id}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
      setIsDeclineRequestDialogOpen(false);
      setError(null);
      onCancel();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to cancel exchange request:", err);
    }
  };

  const handleDecline = async () => {
    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/exchange/requests/${request.id}/decline`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
      setIsCancelRequestDialogOpen(false);
      setError(null);
      setSelectedRequest((prev) =>
        prev ? { ...prev, status: "declined" } : null
      );
      onDecline();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to decline exchange request:", err);
    }
  };

  const renderBookDetails = (book: Book, label: string) => (
    <div className="grid gap-2">
      <div className="font-medium">{label}</div>
      <div className="flex flex-wrap gap-10">
        <img
          src="/placeholder.svg"
          alt={book.title}
          width={200}
          height={300}
          className="rounded-lg"
          style={{ aspectRatio: "200/300", objectFit: "cover" }}
        />
        <div className="flex flex-col gap-3 max-w-sm">
          {/* <div>{book.title}</div> */}
          <h3 className="text-2xl font-bold">{book.title}</h3>
          <p>
            <strong>Author: </strong>
            <span className="text-muted-foreground">{book.author}</span>
          </p>
          <p>
            <strong>Genre: </strong>
            <span className="text-muted-foreground">{book.genre}</span>
          </p>
          <div className="flex flex-col">
            <strong className="block">Description:</strong>
            <p className="text-muted-foreground">{book.description}</p>
          </div>
          {/* <div className="text-muted-foreground">{book.author}</div> */}
        </div>
      </div>
    </div>
  );

  const renderOwnerDetails = (
    owner: Book["owner"],
    onUpdate: RequestDetailsProps["onUpdate"]
  ) => (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">Owner Details</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onUpdate}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh details</span>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder-user.jpg" alt={owner.first_name} />
          <AvatarFallback>
            {owner.first_name[0]}
            {owner.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div>
            {owner.first_name} {owner.last_name}
          </div>
          {selectedRequest?.status == "accepted" ||
          selectedRequest?.status == "exchanged" ? (
            <div className="cursor-not-allowed max-w-fit">
              <Button
                size="vsm"
                onClick={() => setIsOwnerDetailsDialogOpen(true)}
              >
                Details
              </Button>
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="cursor-not-allowed max-w-fit">
                    <Button size="vsm" disabled>
                      Details
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={15}
                  className="bg-primary text-primary-foreground text-center"
                >
                  <p>
                    Your request must be accepted <br />
                    to view the owner details!
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <Dialog
        open={isOwnerDetailsDialogOpen}
        onOpenChange={setIsOwnerDetailsDialogOpen}
      >
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Owner Contact</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4 overflow-scroll max-h-96">
            <div className="flex gap-2">
              <strong className="text-right">Name: </strong>
              <p className="col-span-3">
                {owner.first_name} {owner.last_name}
              </p>
            </div>
            <div className="flex gap-2">
              <strong className="text-right">Email: </strong>
              <p className="col-span-3">{owner.email}</p>
            </div>
            <div className="flex gap-2">
              <strong className="text-right">Phone: </strong>
              <p className="col-span-3">{owner.phone}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Back
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Check if selectedRequest is null before rendering its details
  if (!selectedRequest) {
    return <div className="text-red-500">No request details available.</div>;
  }

  return (
    <div className="p-6 space-y-6">
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
            {isRequester ? (
              <>
                <BreadcrumbItem>Request To</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {selectedRequest.RequestedBook.title}
                </BreadcrumbItem>
              </>
            ) : (
              <>
                <BreadcrumbItem>Request For</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {selectedRequest.RequestedBook.title}
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <div className="grid gap-4">
          {error && (
            <div className="text-red-500 text-lg text-center">{error}</div>
          )}
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {isRequester ? (
                <>
                  {renderBookDetails(
                    selectedRequest.RequestedBook,
                    "Requested Book"
                  )}
                  {renderBookDetails(
                    selectedRequest.OfferedBook,
                    "Offered Book"
                  )}
                </>
              ) : (
                <>
                  {renderBookDetails(
                    selectedRequest.OfferedBook,
                    "Offered Book"
                  )}
                  {renderBookDetails(
                    selectedRequest.RequestedBook,
                    "Requested Book"
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-wrap gap-20 justify-between gap-y-10">
              {renderOwnerDetails(
                isRequester
                  ? selectedRequest.RequestedBook.owner
                  : selectedRequest.OfferedBook.owner,
                onUpdate
              )}

              <div className="grid gap-2 items-center">
                <div className="font-medium">Status</div>
                <div
                  className={`px-2 py-1 rounded-md w-fit ${
                    selectedRequest.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedRequest.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : selectedRequest.requested_by_confirmed &&
                        selectedRequest.requested_to_confirmed
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedRequest.requested_by_confirmed &&
                  selectedRequest.requested_to_confirmed ? (
                    <div>exchanged</div>
                  ) : selectedRequest.requested_by_confirmed ? (
                    <div>
                      <div>
                        {selectedRequest.OfferedBook.owner.first_name} -
                        confirmed
                      </div>
                      <div>
                        {selectedRequest.RequestedBook.owner.first_name} - not
                        confirmed
                      </div>
                    </div>
                  ) : selectedRequest.requested_to_confirmed ? (
                    <div>
                      <div>
                        {selectedRequest.RequestedBook.owner.first_name} -
                        confirmed
                      </div>
                      <div>
                        {selectedRequest.OfferedBook.owner.first_name} - not
                        confirmed
                      </div>
                    </div>
                  ) : (
                    selectedRequest.status
                  )}
                </div>
              </div>
              {
                // Case 1: Request is pending and neither party has confirmed
                !selectedRequest.requested_by_confirmed &&
                !selectedRequest.requested_to_confirmed &&
                selectedRequest.status !== "accepted" ? (
                  <>
                    {isRequester && selectedRequest.status === "declined" ? (
                      // Buttons for the requester
                      <div className="flex flex-col gap-6 max-w-fit m-auto sm:m-0 justify-center">
                        <Button
                          onClick={() => handleCancelClick(request)}
                          size="lg"
                        >
                          Cancel Request
                        </Button>
                      </div>
                    ) : !isRequester &&
                      selectedRequest.status !== "declined" ? (
                      // Buttons for the non-requester
                      <div className="flex flex-col gap-6 max-w-fit m-auto sm:m-0">
                        <Button
                          onClick={() => handleAcceptClick(request)}
                          size="lg"
                        >
                          Accept Request
                        </Button>
                        <Button
                          onClick={() => handleDeclineClick(request)}
                          size="lg"
                        >
                          Decline Request
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : selectedRequest.status === "accepted" ? (
                  // Case 2: Request is accepted
                  !selectedRequest.requested_by_confirmed ||
                  !selectedRequest.requested_to_confirmed ? (
                    // Show confirm button if either party has not confirmed
                    !hasConfirmed ? (
                      <div className="flex flex-col justify-center gap-6 max-w-fit m-auto sm:m-0">
                        <Button
                          onClick={() => handleConfirmClick(request)}
                          size="lg"
                        >
                          Confirm
                        </Button>
                      </div>
                    ) : null
                  ) : null
                ) : // Case 3: Request is accepted and one party has confirmed
                !hasConfirmed &&
                  ((selectedRequest.requested_by_confirmed &&
                    !selectedRequest.requested_to_confirmed &&
                    !isRequester) ||
                    (selectedRequest.requested_to_confirmed &&
                      !selectedRequest.requested_by_confirmed &&
                      isRequester)) ? (
                  // Show confirm button to the unconfirmed party
                  <div className="flex flex-col justify-center gap-6 max-w-fit m-auto sm:m-0">
                    <Button
                      onClick={() => handleConfirmClick(request)}
                      size="lg"
                    >
                      Confirm
                    </Button>
                  </div>
                ) : null
              }
            </CardContent>
          </Card>
          {(selectedRequest?.status === "accepted" ||
            selectedRequest?.status === "exchanged") && (
            <Card>
              <CardContent className="grid gap-4">
                <div className="font-medium">Pickup Location</div>
                <MapContainer
                    className="-z-0"
                    center={[
                      selectedRequest.RequestedBook.location?.latitude ?? 0,
                      selectedRequest.RequestedBook.location?.longitude ?? 0,
                    ]}
                    zoom={13}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[
                        selectedRequest.RequestedBook.location?.latitude ?? 0,
                        selectedRequest.RequestedBook.location?.longitude ?? 0,
                      ]}
                      icon={customIcon}
                    >
                      <Popup>This is the location!</Popup>
                    </Marker>
                  </MapContainer>
              </CardContent>
            </Card>
          )}

          <AlertDialog
            open={isCancelRequestDialogOpen}
            onOpenChange={setIsCancelRequestDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Are you sure you want to cancel this exchange request process?
              </AlertDialogDescription>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={isAcceptRequestDialogOpen}
            onOpenChange={setIsAcceptRequestDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Are you sure you want to accept this exchange request? <br />
                <br />
                All the remaining requests for your book{`<strong>${request.RequestedBook.title}</strong>`} will be
                declined.
              </AlertDialogDescription>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAccept}>
                  Accept
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={isDeclineRequestDialogOpen}
            onOpenChange={setIsDeclineRequestDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Are you sure you want to decline this exchange request?
              </AlertDialogDescription>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDecline}>
                  Decline
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={isConfirmRequestDialogOpen}
            onOpenChange={setIsConfirmRequestDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                You are confirming that you got the exchanged book?
              </AlertDialogDescription>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
        </div>
      </div>
    </div>
  );
}
