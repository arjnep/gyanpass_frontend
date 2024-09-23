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
  RequestedBook: {
    title: string;
    author: string;
    genre: string;
    owner: {
      first_name: string;
      last_name: string;
    };
  };
}

const RequestsMade: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [requestsMade, setRequestsMade] = useState<Request[]>([]);
  const [requestsMadeError, setRequestsMadeError] = useState<string | null>(
    null
  );
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  const { isAuthenticated, token, logout } = useAuth();

  const handleRequestsMadeErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setRequestsMadeError("Bad Request!");
    } else if (err.type == "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err.type == "INTERNAL") {
      setRequestsMadeError("Internal Server Error!");
    } else {
      setRequestsMadeError("Something unknown went wrong!");
    }
  };

  const fetchRequestsMade = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/exchange/requests/made`,
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
        setRequestsMade(data.requests_made); // Update the state with the fetched data
      } else {
        const errorData = await response.json();
        handleRequestsMadeErrorResponse(errorData);
        console.error("Failed to fetch requests made");
      }
    } catch (err: any) {
      setRequestsMadeError(err.message);
      console.error("Error fetching requests made:", err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequestsMade();
    } else {
      setLoading(false); // No need to fetch if not authenticated
    }
  }, [isAuthenticated, token, loading]);

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-4">
        {loading && <Loading message="Loading..." />}
        {requestsMadeError && (
          <div className="text-red-500 my-10 text-lg text-center">
            {requestsMadeError}
          </div>
        )}
        {requestsMade && requestsMade.length > 0 ? (
          <div className="grid gap-4">
            {requestsMade.map((request) => (
              <ExchangeRequestCard
                key={request.id}
                type="made"
                requested_by_or_to={`${request.RequestedBook.owner.first_name} ${request.RequestedBook.owner.last_name}`}
                title={request.RequestedBook.title}
                author={request.RequestedBook.author}
                genre={request.RequestedBook.genre}
                coverUrl={"/placeholder.svg"}
              >
                <Link href={`/request/${request.id}`}>
                <Button size="lg">View</Button>
                </Link>
              </ExchangeRequestCard>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="my-10 text-center text-2xl">No Requests Made!</div>
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

export default RequestsMade;
