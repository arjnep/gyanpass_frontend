import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

type ExchangeRequestCardProps = {
  type: string;
  requested_by_or_to: string;
  title: string;
  author: string;
  genre: React.ReactNode;
  coverUrl: string;
  children?: React.ReactNode;
};

const ExchangeRequestCard = ({ type, requested_by_or_to, title, author, genre, coverUrl, children}: ExchangeRequestCardProps) => (
  <Card className="sm:flex justify-between items-center">
    <CardContent>
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={coverUrl}
            width={64}
            height={64}
            alt="Cover"
            className="rounded-lg"
            style={{ aspectRatio: "64/64", objectFit: "cover" }}
          />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-muted-foreground">
            Requested {type === "made" ? `To ${requested_by_or_to}` : `By ${requested_by_or_to}`}
            </p>
            <p className="text-muted-foreground">
            Author: {author}
            </p>
            <p className="text-muted-foreground">
            Genre: {genre}
            </p>
          </div>
        </div>
  </div>
    </CardContent>
    <CardFooter className="float-end">
      {children}
    </CardFooter>
  </Card>
)

export default ExchangeRequestCard;