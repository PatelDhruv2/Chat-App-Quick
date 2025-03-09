import {z} from 'zod';
export const createChatSchema=z.object({
    title:z.string().min(3).max(255),
    passcode:z.string().min(3).max(255),
}).required();

export type createChatSchemaType=z.infer<typeof createChatSchema>;