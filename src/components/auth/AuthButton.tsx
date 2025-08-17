"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border-2 border-primary/20"
            />
          ) : (
            <UserCircleIcon className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="hidden md:block">
            <div className="text-sm font-medium text-foreground">
              {session.user.name || "User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {session.user.email}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="Sign out"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
    >
      <UserCircleIcon className="w-4 h-4" />
      <span>Sign in</span>
    </button>
  );
}