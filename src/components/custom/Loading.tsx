import { cn } from "@/lib/utils"

import { SVGProps } from "react"

interface LoadingProps {
  message?: string
  className?: string
}

  const Loading: React.FC<LoadingProps> = ({ message = "Loading...", className }) => {
  return (
    <div className={cn("flex min-h-[50dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-md text-center">
      <div className="flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <LoaderPinwheelIcon className="h-12 w-12 animate-spin text-primary" />
        </div>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{message}</h1>
      </div>
    </div>
  )
}

function LoaderPinwheelIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5 2.2 5 5 5 5-2.2 5-5" />
      <path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6" />
      <path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export default Loading;
