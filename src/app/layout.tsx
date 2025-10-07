import "@/styles/globals.css";
import "@/styles/resume.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={'content'}>
          {children}
        </div>
      </body>
    </html>
  );
}
