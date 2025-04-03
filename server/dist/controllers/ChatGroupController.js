import prisma from "../config/db.config.js";
class ChatGroupController {
    static async index(req, res) {
        try {
            // Check if user exists in request
            if (!req.user) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            const user = req.user;
            console.log("User ID for chat group query:", user.id);
            const groups = await prisma.chatGroup.findMany({
                where: {
                    user_id: user.id,
                },
                orderBy: {
                    created_at: "desc",
                },
            });
            return res.json({ data: groups });
        }
        catch (error) {
            console.error("Error in chat group index method:", error);
            return res
                .status(500)
                .json({ message: "Something went wrong. Please try again! in index", error: String(error) });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const group = await prisma.chatGroup.findUnique({
                    where: {
                        id: id,
                    },
                });
                return res.json({ data: group });
            }
            return res.status(404).json({ message: "No groups found" });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Something went wrong.please try again!" });
        }
    }
    static async store(req, res) {
        try {
            const body = req.body;
            // For POST requests without authentication
            let userId = req.user?.id;
            // If no authenticated user (public endpoint)
            if (!userId && !req.body.user_id) {
                return res.status(400).json({ message: "User ID is required" });
            }
            // Use the ID from request body if no authenticated user
            if (!userId) {
                userId = req.body.user_id;
            }
            await prisma.chatGroup.create({
                data: {
                    title: body?.title,
                    passcode: body?.passcode,
                    user_id: userId,
                },
            });
            return res.json({ message: "Chat Group created successfully!" });
        }
        catch (error) {
            console.error("Error in chat group store method:", error);
            return res
                .status(500)
                .json({ message: "Something went wrong. Please try again! in store", error: String(error) });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            if (id) {
                await prisma.chatGroup.update({
                    data: body,
                    where: {
                        id: id,
                    },
                });
                return res.json({ message: "Group updated successfully!" });
            }
            return res.status(404).json({ message: "No groups found" });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Something went wrong.please try again!" });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.chatGroup.delete({
                where: {
                    id: id,
                },
            });
            return res.json({ message: "Chat Deleted successfully!" });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Something went wrong.please try again!" });
        }
    }
}
export default ChatGroupController;
