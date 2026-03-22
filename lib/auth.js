import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "./mongoose";
import User from "./models/user.model";
import { decode } from "next-auth/jwt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check for admin login
        if (credentials.isAdmin === "true") {
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
            throw new Error("Invalid admin credentials");
          }

          return {
            id: "admin",
            email: adminEmail,
            name: "Administrator",
            image: "",
            isAdmin: true,
          };
        }

        await connectToDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import { getServerSession } from "next-auth/next";

/**
 * Get session from request (handles both cookies and Bearer tokens)
 * @param {Request} req 
 * @returns {Promise<Object|null>}
 */
export async function getSession(req) {
  try {
    // 1. Try to get session from cookie (standard NextAuth)
    const session = await getServerSession(authOptions);
    
    if (session) return session;

    // 2. Try to get session from Bearer token (for Chrome Extension)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = await decode({
          token,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (decoded) {
          return {
            user: {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              image: decoded.image,
              isAdmin: decoded.isAdmin,
            }
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
