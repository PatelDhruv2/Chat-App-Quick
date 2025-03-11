import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeatureSection from '@/components/FeatureSection'
import UserReviews from '@/components/UserReview'
import Footer from '@/components/Footer'
import { authOptions } from './api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'
import { CustomSession } from './api/auth/[...nextauth]/options'
import { Metadata } from "next";
import Image from "next/image";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/auth/user-auth-form";
import OTPVerification from "@/components/auth/OTPVerification";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default async function Home  () {
  const session = await getServerSession();
  const handleOTPSuccess = (data: any) => {
    // Handle successful OTP verification
    console.log("OTP verified successfully:", data);
    // You can redirect to dashboard or handle the login success
  };

  return (
    <div>
       <div className="min-h-screen flex flex-col ">
      {/* Header */}
      <Navbar user={session?.user || {}}/>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeatureSection />

      {/* User Reviews Section */}
      <UserReviews />

      {/* Footer */}
      <Footer />
    </div>
    </div>
  )
}