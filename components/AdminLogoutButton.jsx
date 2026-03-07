"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 font-medium"
    >
      Sign Out
    </button>
  );
}
