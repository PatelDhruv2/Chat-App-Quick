

export async function fetchChats(groupId: string) {
  const res = await fetch(`http://localhost:7000/api/chats/${groupId}`, {
    cache: "no-cache",
  });

  if (!res.ok) {
    return [];
  }
  const response = await res.json();
  if (response?.data) {
    return response?.data;
  }
  return [];
}