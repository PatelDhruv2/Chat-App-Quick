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
/**
 * Generate and send OTP via email
 */
export const generateOTP = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Email is required" });
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        // Delete old OTPs for this email (prevent duplicates)
        await prisma.oTP.deleteMany({ where: { email } });
        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        });
        // Store OTP in DB
        await prisma.oTP.create({
            data: {
                email,
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Could not send OTP" });
    }
};
/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP are required" });
    try {
        const storedOtp = await prisma.oTP.findUnique({ where: { email } });
        if (!storedOtp)
            return res.status(400).json({ message: "OTP not found" });
        if (storedOtp.expiresAt < new Date()) {
            await prisma.oTP.delete({ where: { email } });
            return res.status(400).json({ message: "OTP expired" });
        }
        const isMatch = await bcrypt.compare(otp, storedOtp.otp);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid OTP" });
        await prisma.oTP.delete({ where: { email } });
        res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Could not verify OTP" });
    }
};
