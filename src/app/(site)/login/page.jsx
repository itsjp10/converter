"use client"

import { SignIn, SignedOut } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <SignedOut>
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Sign in to your account
          </h2>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </div>
  )
}
