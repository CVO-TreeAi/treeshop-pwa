import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Check for required environment variables
const checkEnvironment = () => {
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return false;
  }
  return true;
};

// Handle missing environment variables gracefully
if (!checkEnvironment()) {
  const errorHandler = async (req: NextRequest) => {
    console.error('NextAuth configuration error: Missing environment variables');
    return NextResponse.json(
      { 
        error: 'Authentication not configured properly', 
        message: 'Missing required environment variables' 
      },
      { status: 500 }
    );
  };
  
  export { errorHandler as GET, errorHandler as POST };
} else {
  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
}