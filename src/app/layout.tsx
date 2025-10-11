import "@/styles/global.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata  = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <div className={'content'}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
