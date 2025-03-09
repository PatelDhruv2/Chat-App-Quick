"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { Suspense } from 'react'
import UserAvatar from '@/components/common/UserAvatar'
import dynamic from "next/dynamic";
const LogoutModel = dynamic(() => import('@/components/auth/LogoutModel'), { loading: () => <p>Loading...</p> });
const ProfileMenu = ({name,image}:{name:string,image?:string}) => {
    const [logoutOpen,setlogoutOpen]=React.useState(false);

    return (
        <>
        {logoutOpen && <Suspense fallback={<div>Loading...</div>}> <LogoutModel open={logoutOpen} setOpen={setlogoutOpen}/>

            </Suspense>}
        <DropdownMenu>
            <DropdownMenuTrigger><UserAvatar name={name} image={image}/></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={()=>setlogoutOpen(true)}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}

export default ProfileMenu
