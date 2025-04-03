import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import prisma from "../config/db.config.js";
import dotenv from "dotenv";
dotenv.config();
// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password (not your Gmail password)
    },
});
export const generateOTP = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Email is required" });
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        });
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Could not send OTP" });
    }
};
/**
export const verifyOTP = async (req: Request, res: Response) => {
 */
export const verifyOTP = async (req, res) => {
    const { username, email, otp } = req.body;
    if (!username || !email || !otp)
        return res.status(400).json({ message: "Username, Email, and OTP are required" });
    try {
        // Check if session exists and has OTP data
        if (!req.session || !req.session.otpData) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }
        const { otp: storedOtp, expiresAt } = req.session.otpData;
        // Debugging logs
        console.log("Stored OTP:", storedOtp);
        console.log("Received OTP:", otp);
        if (expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        const isMatch = await bcrypt.compare(otp, storedOtp);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid OTP" });
        // Proceed with user creation
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: username,
                    email,
                    provider: "OTP",
                    oauth_id: null,
                    image: username.charAt(0).toUpperCase(),
                },
            });
        }
        // Clear OTP after successful verification
        delete req.session.otpData;
        res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Could not verify OTP" });
    }
};
