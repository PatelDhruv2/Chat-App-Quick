import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const UserAvatar = ({name,image}:{name:string,image?:string}) => {
  console.log("image of user is",image);
  const avatarFallback = name ? name[0] : 'U'; // Use the first letter of the name or 'U' as default
  return (
    <Avatar>
      <AvatarImage src={image} />
      <AvatarFallback>{avatarFallback}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar