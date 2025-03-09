import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";

// Define Login Payload Type
interface LoginPayloadType {
    name: string;
    email: string;
    provider: string;
    oauth_id?: string | null; // ✅ Made optional
    image?: string;
}

class AuthController {
    static async getUser(req: Request, res: Response) {
        
        try {
            console.log("inside getUser");
            const body: LoginPayloadType = req.body;
            console.log("📩 Received login request:", body);

            // Validate Required Fields
            if (!body.email || !body.provider) {
                return res.status(400).json({ message: "Missing required fields: email, provider" });
            }

            // Ensure Prisma Connection
            await prisma.$connect();
            console.log("✅ Prisma connected");

            // Find user by email
            let user = await prisma.user.findUnique({
                where: { email: body.email }
            });

            // If user does not exist, create a new user
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        provider: body.provider,
                        oauth_id: body.oauth_id ?? null, // ✅ Set explicitly to null if missing
                        image: body.image
                    }
                });
                console.log("👤 New user created:", user);
            }

            // JWT Payload
            const JWTPayload = {
                name: user.name,
                email: user.email,
                id: user.id
            };

            // Ensure SECRET_KEY is defined
            if (!process.env.JWT_SECRET_KEY) {
                console.error("❌ JWT_SECRET_KEY is missing in .env");
                return res.status(500).json({ message: "Internal server error" });
            }

            // Generate JWT Token
            const token = jwt.sign(JWTPayload, process.env.JWT_SECRET_KEY, {
                expiresIn: "1h"
            });

            // Response
            return res.status(200).json({
                message: "✅ User logged in successfully",
                user: {
                    ...user,
                    token: `Bearer ${token}`
                }
            });
        } catch (err: any) {
            console.error("❌ Error in getUser:", err);
            res.status(500).json({ message: err.message || "Internal server error" });
        } finally {
            await prisma.$disconnect();
        }
    }
}

export default AuthController;
