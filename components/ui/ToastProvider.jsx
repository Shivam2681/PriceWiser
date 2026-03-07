"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#22c55e",
            secondary: "white",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "white",
          },
        },
      }}
    />
  );
}
