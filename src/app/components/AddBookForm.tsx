import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/auth";
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
import Image from "next/image";
import SuccessAnimation from "@/components/custom/Success";
import Map from "./Map";
import { customIcon } from "./Map";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const AddBookForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    {lat: 27.700769, lng: 85.30014}
  );
  const [coverUrl, setCoverUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const { token, logout, validateToken } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          setIsSessionDialogOpen(true);
        }
        console.log("Token valid:", isValid); // Log the result
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };

    checkToken();
  }, [validateToken]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    console.log("Selected Location:", lat, lng);
    // You can handle the API call here
  };

  const handleSuccessResponse = () => {
    setTitle("");
    setAuthor("");
    setDescription("");
    setGenre("");
    setAddress("");
    setCoverUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
    setIsSuccessDialogOpen(true);
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCoverUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://golden-goblin-master.ngrok-free.app/api/books/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({
          title,
          author,
          description,
          genre,
          address,
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        handleErrorResponse(errorData);
        return;
      }

      setIsAddBookDialogOpen(false);
      handleSuccessResponse();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-title">Book Title</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-author">Book Author</Label>
            <Input
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter book author"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-description">Book Description</Label>
            <Textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter book description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-genre">Book Genre</Label>
            <Input
              id="book-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Enter book genre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-description">Book Area</Label>
            <Input
              id="book-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter city or area to search you book"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-description">Pickup Location</Label>
            <small className="text-center ml-2">
              (Select a location on the map)
            </small>
            <div>
              <Map onLocationSelect={handleLocationSelect} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-cover">Cover</Label>
            <Input
              id="book-cover"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            className="w-full"
            onClick={() => setIsAddBookDialogOpen(true)}
          >
            Add Book
          </Button>
        </CardFooter>

        <Dialog
          open={isAddBookDialogOpen}
          onOpenChange={setIsAddBookDialogOpen}
        >
          <DialogTrigger></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Book</DialogTitle>
              <DialogDescription>
                Are you sure to confirm to add this book?
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="px-10 text-center text-red-500">{error}</div>
            )}
            <div className="flex flex-col gap-6 py-4 overflow-scroll max-h-96">
              <Image
                src={coverUrl}
                width={250}
                height={250}
                alt="Cover"
                className="rounded-lg border-2 m-auto"
                style={{ aspectRatio: "300/300", objectFit: "cover" }}
              />
              <div className="flex gap-2">
                <strong className="text-right">Book Name: </strong>
                <p className="col-span-3">{title}</p>
              </div>
              <div className="flex gap-2">
                <strong className="text-right">Book Author: </strong>
                <p className="col-span-3">{author}</p>
              </div>
              <div className="flex gap-2">
                <strong className="text-right">Book Genre: </strong>
                <p className="col-span-3">{genre}</p>
              </div>
              <div className="flex flex-col">
                <strong className="text-left">Description: </strong>
                <p className="col-span-3">{description}</p>
              </div>
              <div className="flex gap-2">
                <strong className="text-right">Pickup Area: </strong>
                <p className="col-span-3">{address}</p>
              </div>
              {location && (
              <div className="flex gap-2">
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location?.lat, location?.lng]} icon={customIcon}>
                    <Popup>This is the location!</Popup>
                  </Marker>

                </MapContainer>
              </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Back
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding Book..." : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        <Dialog
          open={isSuccessDialogOpen}
          onOpenChange={setIsSuccessDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>
                <SuccessAnimation />
                <p className="text-xl text-center text-gray-950">
                  <strong>
                    {title}<br></br>
                  </strong>
                  Book Successfully Added!
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </form>
    </Card>
  );
};

export default AddBookForm;
