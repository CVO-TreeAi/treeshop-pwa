import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-client-secret",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom user data to session
      if (session.user) {
        session.user.id = token.sub!;
        // You can add more custom fields here like role, company, etc.
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store additional user info in JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      // You can add company validation, whitelisting, etc. here
      
      // For now, allow all Google users
      // In production, you might want to restrict to specific domains
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};