import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail, storeOTP } from "../utils/emailService.js";
class AuthController {
    static async sendOTP(req, res) {
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
        }
        catch (error) {
            console.error("Error in sendOTP:", error);
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    }
    // In AuthController.ts, update the getUser method:
    static async getUser(req, res) {
        try {
            const body = req.body;
            console.log("📩 Received login request:", body);
            // ... (existing validation code)
            let user = await prisma.user.findUnique({
                where: { email: body.email }
            });
            if (!user) {
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
            const token = jwt.sign({
                id: user.id,
                email: user.email,
                name: user.name
            }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
            // Return response with Bearer token
            return res.status(200).json({
                message: "✅ User logged in successfully",
                user: {
                    ...user,
                    token: `Bearer ${token}` // Add 'Bearer ' prefix here
                }
            });
        }
        catch (error) {
            console.error("Error in getUser:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            });
        }
    }
}
export default AuthController;
