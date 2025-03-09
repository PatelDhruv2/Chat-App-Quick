import React from 'react'
import UserAvatar from '@/components/common/UserAvatar'
import DashNav from '../DashNav/page'
import { getServerSession } from 'next-auth'
import { CustomSession } from '../api/auth/[...nextauth]/options'
import { authOptions } from "../api/auth/[...nextauth]/options"
async function DashBoard ({name,image}:{name:string,image?:string}) {
    const session:CustomSession|null=await getServerSession(authOptions)
    console.log("image",session?.user?.image)
    console.log("name",session?.user?.name);
  return (
    <div>
      <p>{JSON.stringify(session)}</p>
        <DashNav name={session?.user?.name || 'Default Name'} image={session?.user?.image || 'default-image-url'}/>
    </div>
  )
}

export default DashBoard