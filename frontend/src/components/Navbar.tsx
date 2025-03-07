"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import LoginModel from "./auth/LoginModel";
import { Customuser } from "../app/api/auth/[...nextauth]/options"; 
export default function Navbar({user}:{user:Customuser}) {
  return (
    <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
      <h1 className="text-xl md:text-2xl font-extrabold">QuickChat</h1>
      <div className="flex items-center space-x-2 md:space-x-6 text-gray-700">
        <Link href="/">Home</Link>
        <Link href="#features">Features</Link>
       
        {!user ? (
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