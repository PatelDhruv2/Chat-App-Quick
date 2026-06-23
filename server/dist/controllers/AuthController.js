import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail, storeOTP } from "../utils/emailService.js";
const AUTH_CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS ?? 10 * 60 * 1000);
const AUTH_DEBUG = process.env.AUTH_DEBUG === "true";
const userCache = new Map();
const authResponseCache = new Map();
const loginInFlight = new Map();
function getCachedUser(email) {
    const cached = userCache.get(email);
    if (!cached)
        return null;
    if (cached.expiresAt < Date.now()) {
        userCache.delete(email);
        return null;
    }
    return cached.user;
}
function setCachedUser(user) {
    userCache.set(user.email, {
        user,
        expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
    });
}
function getCachedAuthResponse(email) {
    const cached = authResponseCache.get(email);
    if (!cached)
        return null;
    if (cached.expiresAt < Date.now()) {
        authResponseCache.delete(email);
        return null;
    }
    return cached;
}
function setCachedAuthResponse(user, token) {
    authResponseCache.set(user.email, {
        user,
        token,
        expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
    });
}
function buildAuthResponse(user) {
    const token = `Bearer ${jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
    }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })}`;
    setCachedAuthResponse(user, token);
    return { user, token };
}
async function resolveLogin(body) {
    const cachedAuth = getCachedAuthResponse(body.email);
    if (cachedAuth) {
        return {
            user: cachedAuth.user,
            token: cachedAuth.token,
        };
    }
    const inFlight = loginInFlight.get(body.email);
    if (inFlight) {
        return inFlight;
    }
    const loginPromise = (async () => {
        let user = getCachedUser(body.email);
        if (!user) {
            user = await prisma.user.upsert({
                where: { email: body.email },
                update: {
                    name: body.name,
                    provider: body.provider,
                    oauth_id: body.oauth_id,
                    image: body.image,
                },
                create: {
                    name: body.name,
                    email: body.email,
                    provider: body.provider,
                    oauth_id: body.oauth_id,
                    image: body.image,
                },
            });
            setCachedUser(user);
            if (AUTH_DEBUG) {
                console.log("Cached login user:", user.email);
            }
        }
        return buildAuthResponse(user);
    })();
    loginInFlight.set(body.email, loginPromise);
    try {
        return await loginPromise;
    }
    finally {
        loginInFlight.delete(body.email);
    }
}
class AuthController {
    static async sendOTP(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            const otp = generateOTP();
            console.log("Generated OTP for", email, ":", otp);
            storeOTP(email, otp);
            const emailSent = await sendOTPEmail(email, otp);
            if (!emailSent) {
                return res.status(500).json({ message: "Failed to send OTP email" });
            }
            return res.json({
                message: "OTP sent successfully",
                email,
            });
        }
        catch (error) {
            console.error("Error in sendOTP:", error);
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    }
    static async getUser(req, res) {
        try {
            const body = req.body;
            if (AUTH_DEBUG) {
                console.log("Received login request:", body.email);
            }
            const { user, token } = await resolveLogin(body);
            return res.status(200).json({
                message: "User logged in successfully",
                user: {
                    ...user,
                    token,
                },
            });
        }
        catch (error) {
            console.error("Error in getUser:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: process.env.NODE_ENV === "development" ? String(error) : undefined,
            });
        }
    }
}
export default AuthController;
