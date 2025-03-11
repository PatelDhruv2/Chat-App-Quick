import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail, storeOTP, verifyOTP } from "../utils/emailService.js";

// Define Login Payload Type
interface LoginPayloadType {
    name: string;
    email: string;
    provider: string;
    oauth_id?: string;
    image?: string;
    otp?: string;
}

class AuthController {
    static async sendOTP(req: Request, res: Response) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            // Generate OTP
            const otp = generateOTP();
            console.log("Generated OTP for", email, ":", otp);
            
            // Store OTP in memory
            storeOTP(email, otp);

            // Send OTP via email
            const emailSent = await sendOTPEmail(email, otp);

            if (!emailSent) {
                return res.status(500).json({ message: "Failed to send OTP email" });
            }

            return res.json({ 
                message: "OTP sent successfully",
                email: email // Return email for confirmation
            });
        } catch (error) {
            console.error("Error in sendOTP:", error);
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    }

    static async getUser(req: Request, res: Response) {
        try {
            const body: LoginPayloadType = req.body;
            console.log("📩 Received login request:", body);

            // Validate Required Fields
            if (!body.email || !body.provider) {
                return res.status(400).json({ 
                    message: "Missing required fields",
                    required: ["email", "provider"]
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            // For non-OAuth logins, verify OTP
            if (body.provider === 'email') {
                if (!body.otp) {
                    return res.status(400).json({ message: "OTP is required for email login" });
                }

                const isValidOTP = verifyOTP(body.email, body.otp);
                if (!isValidOTP) {
                    return res.status(401).json({ 
                        message: "Invalid or expired OTP",
                        action: "Please request a new OTP"
                    });
                }
            }

            // Find or create user
            let user = await prisma.user.findUnique({
                where: { email: body.email }
            });

            if (!user) {
                // For email login, name is required for new users
                if (body.provider === 'email' && !body.name) {
                    return res.status(400).json({ message: "Name is required for new users" });
                }

                user = await prisma.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        provider: body.provider,
                        oauth_id: body.oauth_id,
                        image: body.image
                    }
                });
                console.log("👤 New user created:", user);
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name 
                },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: "1h" }
            );

            return res.status(200).json({
                message: "✅ User logged in successfully",
                user: {
                    ...user,
                    token: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error in getUser:", error);
            return res.status(500).json({ 
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            });
        }
    }
}

export default AuthController;
