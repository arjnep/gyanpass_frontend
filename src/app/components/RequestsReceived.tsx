import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import ExchangeRequestCard from "./RequestCard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Loading from "@/components/custom/Loading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Request {
  id: number;
  OfferedBook: {
    title: string;
    author: string;
    genre: string;
    image_url: string;
    owner: {
      first_name: string;
      last_name: string;
    };
  };
}

const RequestsReceived: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [requestsReceived, setRequestsReceived] = useState<Request[]>([]);
  const [requestsReceivedError, setRequestsReceivedError] = useState<
    string | null
  >(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  const { isAuthenticated, token, logout } = useAuth();

  const handleRequestsReceivedErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setRequestsReceivedError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setRequestsReceivedError("Internal Server Error!");
    } else {
      setRequestsReceivedError("Something unknown went wrong!");
    }
  };

  const fetchRequestsReceived = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/exchange/requests/received`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "1",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setRequestsReceived(data.requests_received); // Update the state with the fetched data
      } else {
        const errorData = await response.json();
        handleRequestsReceivedErrorResponse(errorData);
        console.error("Failed to fetch requests received");
      }
    } catch (err: any) {
      setRequestsReceivedError(err.message);
      console.error("Error fetching requests received:", err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequestsReceived();
    } else {
      setLoading(false); // No need to fetch if not authenticated
    }
  }, [isAuthenticated, token, loading]);

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-4">
        {loading && <Loading message="Loading..." />}
        {requestsReceivedError && (
          <div className="text-red-500 my-10 text-lg text-center">
            {requestsReceivedError}
          </div>
        )}
        {requestsReceived && requestsReceived.length > 0 ? (
          <div className="grid gap-4">
            {requestsReceived.map((request) => (
              <ExchangeRequestCard
                key={request.id}
                type="received"
                requested_by_or_to={`${request.OfferedBook.owner.first_name} ${request.OfferedBook.owner.last_name}`}
                title={request.OfferedBook.title}
                author={request.OfferedBook.author}
                genre={request.OfferedBook.genre}
                coverUrl={request.OfferedBook.image_url}
              >
                <Link href={`/request/${request.id}`}>
                  <Button size="lg">View</Button>
                </Link>
              </ExchangeRequestCard>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="my-10 text-center text-2xl">
              No Requests Received!
            </div>
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

export default RequestsReceived;
