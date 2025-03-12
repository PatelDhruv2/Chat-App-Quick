export async function fetchChatGroups(token:string){
    const res=await fetch("http://localhost:7000/api/chat-group",{
        method:"GET",
        headers:{
            Authorization: token
        },
        next:{
            revalidate:60*60,
            tags:["dashboard"]
        }
       
    });
    if(!res.ok){
        return [];
    }
    const response = await res.json();
    if(response?.data){
        return response?.data;
    }
    return [];
}



export async function fetchChatGroup(id: string) {
    const res = await fetch(`http://localhost:7000/api/chat-group/${id}`, {
        method: "GET",
        cache: "no-cache"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch chat group");
    }

    const response = await res.json();
    return response?.data || null;
}



export async function fetchChatUsers(id:string){
    const res=await fetch( `http://localhost:7000/api/chat-group-users?group_id=${id}`,
        {
        
       cache:"no-cache"
    });
    if(!res.ok){
        return [];
    }
    const response = await res.json();
    if(response?.data){
        return response?.data;
    }
    return [];
}
