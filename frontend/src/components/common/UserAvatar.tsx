import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const UserAvatar = ({name,image}:{name:string,image?:string}) => {
  console.log("image of gay is",image);
  return (
    <Avatar>
      <AvatarImage src={image} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar