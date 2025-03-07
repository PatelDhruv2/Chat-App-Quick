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

const LoginModel = () => {
  return (
    <Dialog>
  <DialogTrigger asChild>
    <Button>Get started</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-xl">Welcome</DialogTitle>
      <DialogDescription>
        chat faster be smarter
      </DialogDescription>
    </DialogHeader>
    <Button variant="outline">
        <Image src="/Images/google.png" alt="google" width={20} height={20} />
        Continue with Google
    </Button>
  </DialogContent>
</Dialog>

  )
}

export default LoginModel  