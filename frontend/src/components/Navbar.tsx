"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import LoginModel from "./auth/LoginModel";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession(); // Fetch session client-side
  const user = session?.user || null;

  return (
    <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
      <h1 className="text-xl md:text-2xl font-extrabold">QuickChat</h1>

      <div className="flex items-center space-x-2 md:space-x-6 text-gray-700">
        <Link href="/">Home</Link>
        <Link href="#features">Features</Link>

        {status === "loading" ? (
          <p>Loading...</p>
        ) : !user ? (
          <LoginModel />
        ) : (
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
