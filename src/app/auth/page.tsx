// pages/auth.tsx
"use client";

import { SVGProps, useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth"; // Adjust the import path as needed
import { Check, X } from "lucide-react";

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/dashboard");
  }

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<string | null>(null);
  const [signupErrors, setSignupErrors] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [authType, setAuthType] = useState<"login" | "signup">("login");

  const [password, setPassword] = useState("");
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
    setIsPasswordValid(checkPasswordValidity(password));
  }, [password]);

  useEffect(() => {
    if (showSuccessDialog) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [showSuccessDialog, router]);

  const handleTabSwitch = (tab: string) => {
    if (tab === "login" || tab === "signup") {
      setActiveTab(tab as "login" | "signup");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "login" | "signup"
  ) => {
    if (type === "login") {
      setLoginData({ ...loginData, [e.target.id]: e.target.value });
    } else {
      setSignupData({ ...signupData, [e.target.id]: e.target.value });
    }
  };

  const handleAuthErrorResponse = (
    errorData: any,
    type: "login" | "signup"
  ) => {
    const err = errorData.error;
    console.log(errorData.error.type);
    if (type === "login") {
      if (err.type == "BAD_REQUEST") {
        setSignupErrors("Bad Request!");
      } else if (err.type == "NOT_FOUND") {
        setLoginErrors("User with email " + err.value + " doesn't exist");
      } else if (err.type == "AUTHORIZATION") {
        setLoginErrors("Invalid email or password!");
      } else if (err.type == "INTERNAL") {
        setLoginErrors("Internal Server Error!");
      } else {
        setLoginErrors("Something unknown went wrong!");
      }
    } else {
      if (err.type == "BAD_REQUEST") {
        setSignupErrors("Bad Request!");
      } else if (err.type == "CONFLICT") {
        setSignupErrors("User with email or phone already exists!");
      } else if (err.type == "INTERNAL") {
        setSignupErrors("Internal Server Error!");
      } else {
        setLoginErrors("Something unknown went wrong!");
      }
    }
  };

  const handleAuthSuccessResponse = (type: "login" | "signup") => {
    setAuthType(type);
    setShowSuccessDialog(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        handleAuthSuccessResponse("login");
        setTimeout(() => {
          login(data.token, data.user);
        }, 3000);
        // Handle successful login (e.g., save tokens, redirect, etc.)
      } else {
        const errorData = await response.json();
        handleAuthErrorResponse(errorData, "login");
      }
    } catch (error: any) {
      console.error("An error occurred during login:", error);
      setLoginErrors(error.message);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Sign-up successful:", data);
        register(data.token, data.user);
        handleAuthSuccessResponse("signup");
        // Handle successful sign-up (e.g., auto-login, redirect, etc.)
      } else {
        const errorData = await response.json();
        handleAuthErrorResponse(errorData, "signup");
      }
    } catch (error: any) {
      console.error("An error occurred during sign-up:", error);
      setSignupErrors(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-background px-4 lg:px-6 h-20 flex items-center justify-center">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <BookIcon className="h-12 w-12" />
          <span className="sr-only">Book Exchange</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mx-auto max-w-[600px] space-y-6">
              <Tabs defaultValue={activeTab} onValueChange={handleTabSwitch}>
                <TabsList className="grid w-full grid-cols-2 gap-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Login</CardTitle>
                      <CardDescription>
                        Enter your email and password to access your account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loginErrors && (
                        <div className="text-red-500 text-lg text-center">
                          {loginErrors}
                        </div>
                      )}
                      <form onSubmit={handleLoginSubmit}>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={loginData.email}
                            onChange={(e) => handleInputChange(e, "login")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={loginData.password}
                            onChange={(e) => handleInputChange(e, "login")}
                            required
                          />
                        </div>
                        <CardFooter>
                          <Button type="submit" className="w-full">
                            Login
                          </Button>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sign Up</CardTitle>
                      <CardDescription>
                        Create a new account to start exchanging books.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {signupErrors && (
                        <div className="text-red-500 text-lg text-center">
                          {signupErrors}
                        </div>
                      )}
                      <form onSubmit={handleSignupSubmit}>
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            placeholder="John"
                            value={signupData.first_name}
                            onChange={(e) => handleInputChange(e, "signup")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            placeholder="Doe"
                            value={signupData.last_name}
                            onChange={(e) => handleInputChange(e, "signup")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={signupData.email}
                            onChange={(e) => handleInputChange(e, "signup")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="9812345678"
                            value={signupData.phone}
                            onChange={(e) => handleInputChange(e, "signup")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={signupData.password}
                            onChange={(e) => {
                              handleInputChange(e, "signup");
                              setPassword(e.target.value);
                            }}
                            required
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Password Requirements:
                          </h3>
                          <ul className="space-y-1">
                            {passwordRules.map((rule, index) => (
                              <li
                                key={index}
                                className="flex items-center text-sm"
                              >
                                {rule.test(password) ? (
                                  <Check className="w-4 h-4 text-green-500 mr-2" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500 mr-2" />
                                )}
                                {rule.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <CardFooter>
                          <div
                            className={
                              isPasswordValid
                                ? "cursor-pointer w-full"
                                : "cursor-not-allowed w-full"
                            }
                          >
                            <Button
                              type="submit"
                              disabled={!isPasswordValid}
                              className="w-full"
                            >
                              Sign Up
                            </Button>
                          </div>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      {showSuccessDialog && (
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Success</AlertDialogTitle>
              <AlertDialogDescription>
                You are successfully{" "}
                {authType === "login" ? "logged in" : "registered"}! You will be
                redirected to the dashboard in {countdown} seconds...
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

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
