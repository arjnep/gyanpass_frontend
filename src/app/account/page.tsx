"use client";

import { useAuth } from "../context/auth";
import { SVGProps, useEffect, useState } from "react";
import Loading from "@/components/custom/Loading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ArrowLeftIcon from "@/components/custom/ArrowLeft";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface User {
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function Account() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user, token, logout } = useAuth(); // Ensure token is available in your context
  const [editingFields, setEditingFields] = useState({
    // email: false,
    first_name: false,
    last_name: false,
    phone: false,
  });
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleErrorResponse = (errorData: any) => {
    const err = errorData?.error;
    console.log(err);
    if (err?.type === "BAD_REQUEST") {
      setError("Bad Request!");
    } else if (err?.type === "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err?.type === "INTERNAL") {
      setError("Internal Server Error!");
    } else {
      setError("Something unknown went wrong!");
    }
    setLoading(false);
  };

  const handleUpdate = async (field: string, value: string) => {
    if (!user?.uid || !token) return;

    if (!["email", "first_name", "last_name", "phone"].includes(field)) {
      console.error(`Invalid field: ${field}`);
      return;
    }

    const updatePayload = {
      [field]: value,
    };

    try {
      const response = await fetch(
        `https://golden-goblin-master.ngrok-free.app/api/users/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "1",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handleErrorResponse(errorData);
        return;
      }

      const data = await response.json();
      setSelectedUser((prevState) => ({
        ...prevState!,
        [field]: value,
      }));
    } catch (error: any) {
      console.error("Error updating user data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingFields((prevState) => ({
      ...prevState,
      [field]: true,
    }));
  };

  const showToast = () => {
    toast({
      description: `Saved Successfully!`,
    });
  };

  const handleSave = (field: string) => {
    const inputElement = document.querySelector(
      `#${field}-input`
    ) as HTMLInputElement;
    const newValue = inputElement?.value || "";

    handleUpdate(field, newValue);
    setEditingFields((prevState) => ({
      ...prevState,
      [field]: false,
    }));
    showToast();
  };

  const handleCancel = (field: string) => {
    setEditingFields((prevState) => ({
      ...prevState,
      [field]: false,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid || !token) return;

      try {
        const response = await fetch(
          `https://golden-goblin-master.ngrok-free.app/api/users/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          handleErrorResponse(errorData);
          return;
        }
        const data = await response.json();
        setSelectedUser(data.user);
        setLoading(false)
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, token]);

  if (loading) {
    return <Loading message="Loading User..." />;
  }

  if (error) {
    return (
      <div className="text-red-500 my-10 text-lg text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
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
          <BreadcrumbPage>Account</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="grid grid-cols-1 gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                <AvatarFallback>
                  {selectedUser?.first_name[0]}
                  {selectedUser?.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium">{selectedUser?.first_name} {selectedUser?.last_name}</div>
              <div className="text-muted-foreground">{selectedUser?.email}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>First Name</div>
              <div className="flex items-center gap-2">
                {editingFields.first_name ? (
                  <>
                    <Input
                      id="first_name-input"
                      defaultValue={selectedUser?.first_name}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSave("first_name")}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="sr-only">Save First Name</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCancel("first_name")}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <div>{selectedUser?.first_name}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit("first_name")}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit First Name</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Last Name</div>
              <div className="flex items-center gap-2">
                {editingFields.last_name ? (
                  <>
                    <Input
                      id="last_name-input"
                      defaultValue={selectedUser?.last_name}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSave("last_name")}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="sr-only">Save Last Name</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCancel("last_name")}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <div>{selectedUser?.last_name}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit("last_name")}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit Last Name</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Phone</div>
              <div className="flex items-center gap-2">
                {editingFields.phone ? (
                  <>
                    <Input
                      id="phone-input"
                      defaultValue={selectedUser?.phone}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSave("phone")}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="sr-only">Save phone</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCancel("phone")}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <div>{selectedUser?.phone}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit("phone")}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit phone</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <br />
            <small className="text-red-500 my-2">Out of service for now!</small>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input disabled id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input disabled id="new-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
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
    </div>
    </div>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
