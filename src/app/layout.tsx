import "./globals.css";
import { AuthProvider } from "./context/auth";
import RootClientLayout from "./RootClientLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>
        <RootClientLayout>{children}</RootClientLayout>
      </AuthProvider>
  );
}
