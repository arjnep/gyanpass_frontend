import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SuccessAnimation from "@/components/custom/Success";
import { useRouter } from "next/navigation";
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
import { SVGProps, useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import ArrowLeftIcon from "@/components/custom/ArrowLeft";
import Loading from "@/components/custom/Loading";
import BookCard from "./BookCard";
import OfferBookDialog from "./OfferBook";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MapWithSearchBar, { customIcon } from "./Map";

interface BookDetailsProps {
  book: {
    id: number;
    title: string;
    author: string;
    genre: string;
    description: string;
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
  };
  onEdit: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function BookDetails({
  book,
  onEdit,
  onUpdate,
  onDelete,
}: BookDetailsProps) {
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isRequester, setIsRequester] = useState(false);
  const [isRequestAcceptedOrPending, setIsRequestAcceptedOrPending] = useState<
    string | null
  >(null);
  const [isRequestExchanged, setIsRequestExchanged] = useState<string | null>(
    null
  );
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    { lat: 27.700769, lng: 85.30014 }
  );
  const [changeLocation, setChangeLocation] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOfferBookDialogOpen, setIsOfferBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<
    BookDetailsProps["book"] | null
  >(null);
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/exchange/requests/?bookID=${book.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("UserID: ", user.uid);
          const hasRequested = data.requests.some(
            (request: any) => request.requested_by_id === user.uid
          );
          const pendingOrAccepted = data.requests.some(
            (request: any) => request.status === ("pending" || "accepted")
          );
          const pendingExchanged = data.requests.some(
            (request: any) => request.status === "exchanged"
          );
          setIsRequester(hasRequested);
          setIsRequestAcceptedOrPending(pendingOrAccepted);
          setIsRequestExchanged(pendingExchanged);
        } else {
          console.error("Failed to fetch exchange request status");
        }
      } catch (err) {
        console.error("Error fetching exchange request status", err);
      }
    };

    if (user) {
      checkRequestStatus();
      console.log(isRequester);
    }
  }, [user, book.id, token, isRequester]);

  useEffect(() => {
    if (user && book.owner.user_id === user.userID) {
      setIsOwner(true);
    }
  }, [user, book.owner.user_id]);

  const handleEditErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setEditError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setEditError("Internal Server Error!");
    } else {
      setEditError("Something unknown went wrong!");
    }
  };

  const handleLocationErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setLocationError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setLocationError("Internal Server Error!");
    } else {
      setLocationError("Something unknown went wrong!");
    }
  };

  const handleDeleteErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setDeleteError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setDeleteError("Internal Server Error!");
    } else {
      setDeleteError("Something unknown went wrong!");
    }
  };

  const handleEditClick = (book: BookDetailsProps["book"]) => {
    setSelectedBook(book);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (book: BookDetailsProps["book"]) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const handleExchangeRequestClick = (book: BookDetailsProps["book"]) => {
    setSelectedBook(book);
    setIsOfferBookDialogOpen(true);
  };

  const closeOfferBookDialog = () => {
    setIsOfferBookDialogOpen(false);
    setSelectedBook(null);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedBook(book)
    setLocation({ lat, lng });
    console.log("Selected Location:", lat, lng);
  };

  const handleLocationChange = async () => {
    if (selectedBook && location) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/${selectedBook.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: location.lat,
              longitude: location.lng,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          handleLocationErrorResponse(errorData);
          return;
        }
        setChangeLocation(false);
        setLocationError(null);
        onEdit();
      } catch (err: any) {
        setLocationError(err.message);
        console.error("Failed to change pickup location.", err);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (selectedBook) {
      try {
        // Example API call to update the book
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/${selectedBook.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedBook),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          handleEditErrorResponse(errorData);
          return;
        }
        setIsEditDialogOpen(false);
        setEditError(null);
        onEdit();
      } catch (err: any) {
        setEditError(err.message);
        console.error("Failed to update book", err);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedBook) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/${selectedBook.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`, // Use your token storage mechanism
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          handleDeleteErrorResponse(errorData);
          return;
        }
        setIsDeleteDialogOpen(false);
        setDeleteError(null);
        onDelete();
      } catch (err: any) {
        setDeleteError(err.message);
      }
    }
  };

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
            <BreadcrumbItem>
              <BreadcrumbPage>{book.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Book Details</h2>
            <div className="w-full h-64 rounded-lg">
              <img
                src={book.image_url}
                alt="Book Cover"
                className="w-auto h-full m-auto object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-3">
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
            </div>
          </div>
          {isOwner && (
            <CardFooter>
              <Button
                size="lg"
                className="w-auto m-auto"
                onClick={() => handleEditClick(book)}
              >
                Edit
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="w-auto m-auto"
                onClick={() => handleDeleteClick(book)}
              >
                Delete
              </Button>
            </CardFooter>
          )}
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Owner Details</h2>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {book.owner.first_name} {book.owner.last_name}
                </p>
              </div>
            </div>
            {isOwner && (
              <>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{book.owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{book.owner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">
                      {book.location.address}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <Card className="p-6 flex flex-wrap justify-between  gap-10 ">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Status</h2>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <p className="text-muted-foreground">
              {book.is_active ? "Active" : "Not Active"}
            </p>
          </div>
        </div>
        {!isOwner &&
          (book.is_active && !isRequester ? (
            <div className="flex gap-2 w-full justify-center sm:w-auto items-center">
              <Button
                size="lg"
                className="w-full"
                onClick={() => handleExchangeRequestClick(book)}
              >
                Request Exchange
              </Button>
              {selectedBook && isOfferBookDialogOpen && (
                <OfferBookDialog
                  requested_book={selectedBook}
                  isOpen={isOfferBookDialogOpen}
                  onClose={closeOfferBookDialog}
                  onUpdate={onUpdate}
                />
              )}
            </div>
          ) : (
            <div className="cursor-not-allowed items-center">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      disabled
                      size="lg"
                      className="w-full"
                      onClick={() => handleExchangeRequestClick(book)}
                    >
                      Request Exchange
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={15}
                    className="bg-primary text-primary-foreground text-center"
                  >
                    {" "}
                    {isRequestAcceptedOrPending ? (
                      <p>
                        Your have an ongoing request process for this book
                        <br />
                        Please Check Requests Made or Received
                      </p>
                    ) : isRequestExchanged ? (
                      <p>This Book is already exchanged.</p>
                    ) : (
                      <p>This Book is Not Active For Exchange.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {selectedBook && isOfferBookDialogOpen && (
                <OfferBookDialog
                  requested_book={selectedBook}
                  isOpen={isOfferBookDialogOpen}
                  onClose={closeOfferBookDialog}
                  onUpdate={onEdit}
                />
              )}
            </div>
          ))}
      </Card>
      {isOwner && (
        <Card>
          <CardContent className="grid gap-4">
            <div className="font-medium">Map</div>
            {locationError && (
                <div className="text-red-500 text-lg text-center">
                  {locationError}
                </div>
              )}
            {changeLocation ? (
              <MapWithSearchBar onLocationSelect={handleLocationSelect} />
            ) : (
              book.location && (
                <MapContainer
                  className="-z-0"
                  center={[book.location.latitude, book.location.longitude]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[book.location.latitude, book.location.longitude]}
                    icon={customIcon}
                  >
                    <Popup>This is the location!</Popup>
                  </Marker>
                </MapContainer>
              )
            )}
          </CardContent>
          <CardFooter>
            {changeLocation ? (
              <div className="flex flex-wrap gap-10 justify-around">
                <Button
                  size="lg"
                  className="w-auto m-auto"
                  onClick={handleLocationChange}
                >
                  Save Changes
                </Button>
                <Button
                  size="lg"
                  className="w-auto m-auto"
                  onClick={() => setChangeLocation(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-auto m-auto"
                onClick={() => setChangeLocation(true)}
              >
                Change Pickup Location
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update the details of the selected book.
            </DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              {editError && (
                <div className="text-red-500 text-lg text-center">
                  {editError}
                </div>
              )}

              <input
                type="text"
                value={selectedBook.title}
                onChange={(e) =>
                  setSelectedBook({ ...selectedBook, title: e.target.value })
                }
                placeholder="Title"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={selectedBook.author}
                onChange={(e) =>
                  setSelectedBook({ ...selectedBook, author: e.target.value })
                }
                placeholder="Author"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={selectedBook.genre}
                onChange={(e) =>
                  setSelectedBook({ ...selectedBook, genre: e.target.value })
                }
                placeholder="Genre"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                value={selectedBook.description}
                onChange={(e) =>
                  setSelectedBook({
                    ...selectedBook,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  setEditError(null);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="sm:text-center mb-4">
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          {deleteError && (
            <div className="text-red-500 text-lg text-center">
              {deleteError}
            </div>
          )}
          <AlertDialogDescription>
            Do you really want to delete this book? This process is
            irreversible!
          </AlertDialogDescription>
          <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
            <AlertDialogCancel
              onClick={() => {
                setDeleteError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
