import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from 'next/link'
import { Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Transcribe Audio to Text",
  description: "With a few clicks get your audio transcribed into text",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-zinc-950 border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="size-9 grid place-items-center rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Mic className="size-5" />
            </div>
            <Link href="/" className="font-semibold tracking-tight text-white">EchoWrite</Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <Link href="/#features" className="hover:text-white">Features</Link>
            <Link href="/#how" className="hover:text-white">How it works</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/#faq" className="hover:text-white">FAQ</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/login" className="hidden sm:inline-flex cursor-pointer text-white">Sign in</Link>
            </SignedOut>
            <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">Get started</Button>
          </div>
          <UserButton />
        </nav>
      </header>

      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-400 md:flex-row">
          <p>© {new Date().getFullYear()} EchoWrite. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-white" href="#">Pricing</a>
            <a className="hover:text-white" href="#">Changelog</a>
            <a className="hover:text-white" href="#">Privacy</a>
            <a className="hover:text-white" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </ClerkProvider>
  )
}
