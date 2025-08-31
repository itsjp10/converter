import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Transcribe Audio to Text",
  description: "With a few clicks get your audio transcribed into text",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} h-full bg-white text-black`}>
          <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
            {/* Logo + Brand */}
            <div className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15 8H9L12 2ZM12 22L9 16H15L12 22ZM2 12L8 15V9L2 12ZM22 12L16 9V15L22 12Z" />
              </svg>
              <span className="text-xl font-bold text-gray-800">My App Name</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-700 font-medium hover:text-blue-600">
                Home
              </a>
              <a href="/pricing" className="text-gray-700 font-medium hover:text-blue-600">
                Pricing
              </a>
              <a href="/faq" className="text-gray-700 font-medium hover:text-blue-600">
                FAQ
              </a>
              <a href="/about" className="text-gray-700 font-medium hover:text-blue-600">
                About
              </a>
            </nav>

            {/* User menu */}
            <div className="flex items-center">
              <UserButton showName />
            </div>
          </header>

          <main className="p-6 max-w-5xl mx-auto">
            <SignedOut>
              <div className="flex justify-center items-center min-h-[60vh]">
                <SignIn routing="hash" />
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </main>
          <footer className="p-4 bg-gray-800 text-white text-center">
            © 2025 My App
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}
