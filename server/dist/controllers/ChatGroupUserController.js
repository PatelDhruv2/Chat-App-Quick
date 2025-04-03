import prisma from "../config/db.config.js";
class ChatGroupUserController {
    static async index(req, res) {
        try {
            const { group_id } = req.query;
            const users = await prisma.groupUsers.findMany({
                where: {
                    group_id: group_id,
                },
            });
            return res.json({ message: "Date fetched successfully!", data: users });
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
            const user = await prisma.groupUsers.create({
                data: body,
            });
            console.log("User created successfully:", user);
            return res.json({ message: "User created successfully!", data: user });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Something went wrong.please try again!" });
        }
    }
}
export default ChatGroupUserController;
