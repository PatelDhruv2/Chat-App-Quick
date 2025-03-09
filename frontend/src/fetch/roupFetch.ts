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