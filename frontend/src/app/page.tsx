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
export default async function Home  () {
  const session = await getServerSession();
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