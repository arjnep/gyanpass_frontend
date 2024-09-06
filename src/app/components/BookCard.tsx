import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

type BookCardProps = {
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  children?: React.ReactNode;
};

const BookCard = ({ title, author, genre, coverUrl, children }: BookCardProps) => (
  <Card>
    <CardContent className="flex flex-col items-center text-left justify-center p-6">
      <Image
        src={coverUrl}
        width={128}
        height={128}
        alt="Cover"
        className="rounded-lg"
        style={{ aspectRatio: "128/128", objectFit: "cover" }}
      />
      <h3 className="mt-4 font-semibold text-wrap text-center">{title}</h3>
      <small className="text-muted-foreground"><b>Author: </b>{author}</small>
      <small className="text-muted-foreground"><b>Genre:</b> {genre}</small>
    </CardContent>
    <CardFooter className="flex gap-2 pt-0 justify-center">
      {children}
    </CardFooter>
  </Card>
);

export default BookCard;
