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
import MapWithSearchBar from "./Map";
import { customIcon } from "./Map";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { storage } from "../../lib/firebase"; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddBookForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    { lat: 27.700769, lng: 85.30014 }
  );
  const [coverUrl, setCoverUrl] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const authorRef = useRef<HTMLInputElement | null>(null);
  const genreRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { token, logout, validateToken, user } = useAuth();

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

  const validateForm = () => {
    if (!title) {
      setValidationError("All fields are necessary");
      titleRef.current?.focus();
      return;
    }
    if (!author) {
      setValidationError("All fields are necessary");
      authorRef.current?.focus();
      return;
    }
    if (!genre) {
      setValidationError("All fields are necessary");
      genreRef.current?.focus();
      return;
    }
    if (!address) {
      setValidationError("All fields are necessary");
      addressRef.current?.focus();
      return;
    }
    if (!coverUrl) {
      setValidationError("All fields are necessary");
      fileInputRef.current?.focus();
      console.log(location);
      return;
    }
    setValidationError(null);
    // Proceed with the dialog opening if all validations pass
    setIsAddBookDialogOpen(true);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    console.log("Selected Location:", lat, lng);
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
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setCoverUrl(fileUrl);
    }
  };

  const uploadImageToFirebaseWithBookId = async (
    file: File,
    bookId: string
  ) => {
    const fileExtension = file.name.split(".").pop(); // Get file extension
    const fileName = `books/${bookId}.${fileExtension}`; // Create new file name with bookId as prefix
    const storageRef = ref(storage, fileName);

    // Upload file and get download URL
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/books/`,
        {
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
            image_url: imageFile?.name,
          }),
        }
      );

      if (!bookResponse.ok) {
        const errorData = await bookResponse.json();
        handleErrorResponse(errorData);
        return;
      }

      const { book } = await bookResponse.json();

      let uploadedCoverUrl = "";
      if (imageFile) {
        uploadedCoverUrl = await uploadImageToFirebaseWithBookId(
          imageFile,
          book.id
        );
      }

      await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/books/${book.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({
          image_url: uploadedCoverUrl,
        }),
      });

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
            {validationError && (
              <div className="px-10 text-center text-red-500">
                {validationError}
              </div>
            )}
            <Label htmlFor="book-title">Book Title</Label>
            <Input
              id="book-title"
              ref={titleRef}
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
              ref={authorRef}
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
              ref={genreRef}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Enter book genre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-description">Book Area</Label>
            <Input
              id="book-address"
              ref={addressRef}
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
              <MapWithSearchBar onLocationSelect={handleLocationSelect} />
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
            onClick={() => validateForm()}
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
                    <Marker
                      position={[location?.lat, location?.lng]}
                      icon={customIcon}
                    >
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
                    {title}
                    <br></br>
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
