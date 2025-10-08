import "@/styles/globals.css";
import "@/styles/resume.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={'content'}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
