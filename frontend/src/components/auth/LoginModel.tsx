"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import React from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import OTPVerification from './OTPVerification'

const LoginModel = () => {
  const handleLogin = () => {
    signIn('google', {
      callbackUrl: '/dashboard',
      redirect: true
    })
  }

  const handleOTPSuccess = (data: any) => {
    // Redirect to dashboard after successful OTP verification
    window.location.href = '/dashboard';
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Get started</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome</DialogTitle>
          <DialogDescription>
            chat faster be smarter
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <Button variant="outline" onClick={handleLogin} className="w-full">
            <Image src="/Images/google.png" alt="google" width={20} height={20} className="mr-2" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <OTPVerification onSuccess={handleOTPSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginModel  