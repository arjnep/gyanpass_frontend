"use client";

import { Bell, Menu, RefreshCw, Trash2, User, X } from "lucide-react";
import { useAuth } from "../context/auth";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { SVGProps, useEffect, useState } from "react";
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
import Loading from "@/components/custom/Loading";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  type: string;
  message: string;
  created_at: Date;
  is_read: boolean;
}

const Header = () => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, logout, token } = useAuth();
  const [isLogoutDialogOpen, setisLogoutDialogOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );

  const router = useRouter();

  const handleNotificationsErrorResponse = (errorData: any) => {
    const err = errorData.error;
    console.log(errorData.error);
    console.log(errorData.error.type);
    if (err.type == "BAD_REQUEST") {
      setNotificationError("Bad Request!");
    } else if (err.type == "INTERNAL") {
      setNotificationError("Internal Server Error!");
    } else {
      setNotificationError("Something unknown went wrong!");
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/notifications/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response of Notif: ", response)
      console.log("TOken is ", token)
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        const errorData = await response.json();
        handleNotificationsErrorResponse(errorData);
        console.error("Failed to fetch notifications");
      }
    } catch (err: any) {
      setNotificationError(err.message);
      console.error("Error Fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/notifications/${id}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        // Update local state to reflect that the notification is read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification
          )
        );
      } else {
        const errorData = await response.json();
        handleNotificationsErrorResponse(errorData);
      }
    } catch (err: any) {
      setNotificationError(err.message);
      console.error("Error marking notification as read:", err);
    }
  };

  const removeNotification = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/notifications/${id}/remove`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== id)
        );
      } else {
        const errorData = await response.json();
        handleNotificationsErrorResponse(errorData);
      }
    } catch (err: any) {
      setNotificationError(err.message);
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
  };

  const sortedNotifications = notifications.sort((a, b) => {
    return a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1;
  });

  const unreadNotificationsCount = sortedNotifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
        <header className="bg-background px-4 lg:px-6 h-20 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center justify-center"
            prefetch={false}
          >
            <BookIcon className="h-12 w-12" />
            <span className="sr-only">Book Exchange</span>
          </Link>

          <AlertDialog
            open={isLogoutDialogOpen}
            onOpenChange={setisLogoutDialogOpen}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="sm:text-center mb-4">
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:space-x-6 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-x-6">
            <ThemeToggle />
            <DropdownMenu
              open={isNotificationsOpen}
              onOpenChange={setIsNotificationsOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full relative"
                  size="icon"
                  aria-label="Notifications"
                >
                  <Bell className="h-7 w-7" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-screen mt-5 sm:m-0 sm:mr-5 sm:w-auto sm:min-w-96"
              >
                <DropdownMenuLabel>
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.preventDefault();
                          fetchNotifications();
                        }}
                        className="mr-2 h-auto w-auto"
                        aria-label="Refresh notifications"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <h2 className="text-sm font-semibold">Notifications</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-auto w-auto"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      <X className="h-4 w-4 justify-end" />
                    </Button>
                  </div>
                </DropdownMenuLabel>

                {loading ? (
                  <Loading message="Loading..." className="min-h-10" />
                ) : (
                  <>
                    {notificationError && (
                      <div className="text-red-500 m-10 text-sm text-center">
                        {notificationError}
                      </div>
                    )}
                    {sortedNotifications.length > 0 ? (
                      <div className="flex flex-col gap-y-1 max-h-64 overflow-y-scroll">
                        <small className="text-center text-green-500">
                          Click to mark read
                        </small>
                        {sortedNotifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex items-center justify-between cursor-default border font-normal ${
                              !notification.is_read &&
                              "border-green-500 font-medium cursor-pointer"
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <span className="mr-2">{notification.message}</span>
                            {notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6"
                                aria-label={`Delete notification: ${notification.message}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ) : (
                      !notificationError && (
                        <div className="m-10 text-center text-sm">
                          No New Notifications!
                        </div>
                      )
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full"
                  size="icon"
                  aria-label="User avatar"
                >
                  <User className="h-7 w-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-5">
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account")}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setisLogoutDialogOpen(true)}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
  );
};

export default Header;

function BookIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CurrencyIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="8" />
      <line x1="3" x2="6" y1="3" y2="6" />
      <line x1="21" x2="18" y1="3" y2="6" />
      <line x1="3" x2="6" y1="21" y2="18" />
      <line x1="21" x2="18" y1="21" y2="18" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function ReplyIcon(props: SVGProps<SVGSVGElement>) {
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
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
