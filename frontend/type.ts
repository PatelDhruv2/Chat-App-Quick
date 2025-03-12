export type ChatGroupType = {
    title: string,
    passcode: string,
    id: string,
    user_id: number,
    created_at: string,
}
export type GroupChatUserType = {
    id:number,
    name: string,
    groupId: string,
    created_at: string,
}

export type MessageType = {
    id: string,
    group_id: string,
    name: string,
    message: string,
    created_at: string,
}