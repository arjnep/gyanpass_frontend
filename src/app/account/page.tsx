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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Check, Loader2, X } from "lucide-react";

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
  const [detailError, setDetailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const passwordRules = [
    {
      label: "At least 8 characters long",
      test: (pw: string) => pw.length >= 8,
    },
    {
      label: "Contains at least 1 uppercase letter",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "Contains at least 1 lowercase letter",
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: "Contains at least 1 number",
      test: (pw: string) => /[0-9]/.test(pw),
    },
    {
      label: "Contains at least 1 special character",
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
  ];
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const checkPasswordValidity = (password: string) => {
    return passwordRules.every((rule) => rule.test(password));
  };
  useEffect(() => {
    setIsPasswordValid(checkPasswordValidity(newPassword));
  }, [newPassword]);

  const handleErrorResponse = (errorData: any) => {
    const err = errorData?.error;
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

  const handleDetailErrorResponse = (errorData: any) => {
    const err = errorData?.error;
    if (err?.type === "BAD_REQUEST") {
      setDetailError("Bad Request!");
    } else if (err?.type === "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err?.type === "INTERNAL") {
      setDetailError("Internal Server Error!");
    } else {
      setDetailError("Something unknown went wrong!");
    }
  };

  const handlePasswordErrorResponse = (errorData: any) => {
    const err = errorData?.error;
    if (err?.type === "BAD_REQUEST") {
      if (err?.message.includes("invalid current password")) {
        setPasswordError("Incorrect Current Password!");
      } else if (err?.message.includes("the new password must be different")) {
        setPasswordError("New Password cannot be same!");
      } else if (err?.message.includes("password must contain")) {
        setPasswordError("Rules Not Satisfied!");
      } else {
        setPasswordError("Bad Request!");
      }
    } else if (err?.type === "AUTHORIZATION") {
      setIsSessionDialogOpen(true);
    } else if (err?.type === "INTERNAL") {
      setPasswordError("Internal Server Error!");
    } else {
      setPasswordError("Something unknown went wrong!");
    }
  };

  const handleUpdate = async (
    field: string,
    value: string
  ): Promise<boolean> => {
    if (!user?.uid || !token) return false;
    setDetailError(null);
    if (!["email", "first_name", "last_name", "phone"].includes(field)) {
      console.error(`Invalid field: ${field}`);
      return false;
    }

    const updatePayload = {
      [field]: value,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handleDetailErrorResponse(errorData);
        return false;
      }

      const data = await response.json();
      setSelectedUser((prevState) => ({
        ...prevState!,
        [field]: value,
      }));
      return true;
    } catch (error: any) {
      console.error("Error updating user data:", error);
      setDetailError(error.message);
      setLoading(false);
      return false;
    }
  };

  const handlePasswordReset = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user?.uid || !token) return;
    setPasswordError(null);

    const updatePayload = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${user.uid}/reset-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handlePasswordErrorResponse(errorData);
        return;
      }

      const data = await response.json();
      showToast("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error("Error updating user data:", error);
      setPasswordError(error.message);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    if (currentPassword === newPassword) {
      setPasswordError("New Password cannot be same!");
      return;
    }
    handlePasswordReset(currentPassword, newPassword);
  };

  const handleEdit = (field: string) => {
    setEditingFields((prevState) => ({
      ...prevState,
      [field]: true,
    }));
  };

  const showToast = (message: string, loading: boolean = false) => {
    toast({
      description: loading ? (
        <>
          <Loader2 className="animate-spin inline-block mr-2" /> Saving...
        </>
      ) : (
        message
      ),
    });
  };

  const handleSave = async (field: string) => {
    const inputElement = document.querySelector(
      `#${field}-input`
    ) as HTMLInputElement;
    const newValue = inputElement?.value || "";

    showToast("Saving...", true);

    const ok = await handleUpdate(field, newValue);
    if (ok) {
      setEditingFields((prevState) => ({
        ...prevState,
        [field]: false,
      }));
      showToast("Saved Successfully!");
    } else {
      showToast("Failed to Save!");
    }
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
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, token]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
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
                <BreadcrumbPage>Account</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {loading ? (
          <Loading message="Loading User..." />
        ) : error ? (
          <div className="text-red-500 my-10 text-lg text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-8 lg:p-8">
            <div className="flex flex-col gap-4">
              <Card>
                <CardContent className="grid grid-cols-1 gap-6">
                  {detailError && (
                    <div className="text-red-500 text-sm text-center">
                      {detailError}
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                      <AvatarFallback>
                        {selectedUser?.first_name[0]}
                        {selectedUser?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">
                      {selectedUser?.first_name} {selectedUser?.last_name}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedUser?.email}
                    </div>
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
              <form onSubmit={handlePasswordSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  {passwordError && (
                    <div className="text-red-500 text-sm text-center">
                      {passwordError}
                    </div>
                  )}
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        value={newPassword}
                        type="password"
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        New Password Requirements:
                      </h3>
                      <ul className="space-y-1">
                        {passwordRules.map((rule, index) => (
                          <li key={index} className="flex items-center text-sm">
                            {rule.test(newPassword) ? (
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 mr-2" />
                            )}
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div
                      className={
                        isPasswordValid
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      }
                    >
                      <Button type="submit" disabled={!isPasswordValid}>
                        Save Changes
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </form>
            </div>
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
        )}
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
