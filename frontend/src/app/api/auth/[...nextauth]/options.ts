import { AuthOptions, ISODateString } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import axios from "axios";
import { LOGIN_URL } from "../../../../lib/apiEndPoints";

// Session and User Types
export interface CustomSession {
    user?: CustomUser;
    expires: ISODateString;
}

export interface CustomUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
    token?: string;
}

// Auth Options
export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,  // ✅ Important!

    pages: {
        signIn: '/',  // Optional, but okay if you want custom page
    },

    session: {
        strategy: "jwt",  // ✅ This is important for App Router
    },

    callbacks: {
        async signIn({ user, account }) {
            console.log("User details in signIn callback:", user, account);

            try {
                const payload = {
                    email: user.email,
                    name: user.name,
                    oauth_id: account?.id,
                    provider: account?.provider,
                    image: user.image
                };

                const { data } = await axios.post(LOGIN_URL, payload);
                console.log("Login API Response:", data);

                if (data?.success) {
                    return true;  // Login successful
                } else {
                    console.error("Login API failed:", data);
                    return false;  // Fail login if your API rejects it
                }
            } catch (error) {
                console.error("Error during login API call:", error);
                return false;  // Fail safe
            }
        },

        async session({ session, token }) {
            session.user = token.user as CustomUser;  // ✅ No need to pass 'user' directly here
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.user = user as CustomUser;  // ✅ Explicit cast to CustomUser
            }
            return token;
        },
    },
};
