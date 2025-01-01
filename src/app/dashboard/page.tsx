"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth"; // Adjust the import path as needed
import Search from "../components/Search";
import { Button } from "@/components/ui/button";
import MyBooks from "../components/MyBooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import RequestsMade from "../components/RequestsMade";
import RequestsReceived from "../components/RequestsReceived";
import NotFound from "../not-found";
import dynamic from 'next/dynamic';
import Header from "../components/Header";

const AddBookForm = dynamic(() => import('../components/AddBookForm'), { 
  ssr: false 
});


export default function Dashboard() {
  const { isAuthenticated, token, logout, validateToken } = useAuth();
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
    if (!isAuthenticated) {
      return <NotFound title="Page Not Found" description="The page you are looking for does not exist." />
    }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 grid grid-cols-1 gap-8 sm:p-8 p-1">
        <Tabs
          defaultValue="search-books"
          className="overflow-x-auto whitespace-nowrap"
        >
          <TabsList className="flex justify-start gap-4 mb-8 overflow-x-auto">
            <TabsTrigger value="search-books">Search Books</TabsTrigger>
            <TabsTrigger value="my-books">My Books</TabsTrigger>
            <TabsTrigger value="exchange-requests">Requests Made</TabsTrigger>
            <TabsTrigger value="exchange-requests-received">
              Requests Received
            </TabsTrigger>
            <TabsTrigger value="add-new-book">Add New Book</TabsTrigger>
          </TabsList>
          <TabsContent value="search-books">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Search Books</h2>
              </div>
              <Search />
            </div>
          </TabsContent>
          <TabsContent value="my-books">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">My Books</h2>
              </div>
              <MyBooks />
            </div>
          </TabsContent>
          <TabsContent value="exchange-requests">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Requests Made</h2>
              </div>
              <RequestsMade />
            </div>
          </TabsContent>
          <TabsContent value="exchange-requests-received">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Requests Received</h2>
              </div>
              <RequestsReceived />
            </div>
          </TabsContent>
          <TabsContent value="add-new-book">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Add New Book</h2>
              </div>
              <AddBookForm />
            </div>
          </TabsContent>
        </Tabs>
      </main>
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
  );
}
