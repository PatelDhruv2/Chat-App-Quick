import nodemailer from 'nodemailer';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use an app-specific password
    }
});

// Store OTPs in memory (not in database)
const otpStore = new Map<string, { otp: string; expiry: Date }>();

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, otp: string) => {
    // OTP expires in 10 minutes
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    otpStore.set(email, { otp, expiry });
};

export const verifyOTP = (email: string, otp: string): boolean => {
    const storedData = otpStore.get(email);
    if (!storedData) return false;

    const { otp: storedOTP, expiry } = storedData;
    
    // Check if OTP is expired
    if (Date.now() > expiry.getTime()) {
        otpStore.delete(email); // Clean up expired OTP
        return false;
    }

    // Check if OTP matches
    const isValid = storedOTP === otp;
    if (isValid) {
        otpStore.delete(email); // Clean up used OTP
    }
    return isValid;
};

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Chat App Registration',
            html: `
                <h1>Email Verification</h1>
                <p>Your OTP for registration is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this OTP, please ignore this email.</p>
            `
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}; 