import { AuthOptions, ISODateString, Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { LOGIN_URL } from "../../../../lib/apiEndPoints";
import { CloudCog } from "lucide-react";

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
        signIn: '/',  // Optional, but okay if you want a custom sign-in page
    },

    session: {
        strategy: "jwt",  // ✅ This is important for App Router
    },

    callbacks: {
        async signIn({ user, account }: { user: CustomUser, account: Account | null }) {
            console.log("User details in signIn callback:", user, account);

            try {
                const payload = {
                    email: user.email,
                    name: user.name,
                    oauth_id: account?.id || null,
                    provider: account?.provider,
                    image: user.image
                };

                console.log("Sending payload to backend:", payload);

                const response = await fetch("http://localhost:8000/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload),
                });
       
                console.log("Response status:", response.status);
                console.log("Response headers:", Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Login API failed GG:", {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    });
                    return false;
                }

                const responseData = await response.json();
                console.log("Login API Response HH:", responseData);
                
                // Extract user data from the response structure
                if (responseData.user) {
                    user.id = responseData.user.id;
                    user.token = responseData.user.token;
                    console.log("Updated user details:", user);
                } else {
                    console.error("User data not found in response");
                    return false;
                }

                return true;
            } catch (error) {
                console.error("Error during login API call:", error);
                return false;
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
