"use client";
import { useEffect } from "react";

export default function GoogleAuth() {
  useEffect(() => {
    window.location.href = "http://localhost:8080/auth/google"; // Redirects to your backend OAuth
  }, []);

  return <p>Redirecting to Google authentication...</p>;
}
