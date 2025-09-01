import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "404 Not Found",
    description: "404 Not Found",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full bg-white text-black`}>
                {children}
            </body>
        </html>
    )
}


