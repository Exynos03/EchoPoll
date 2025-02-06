"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8080/auth/profile", {
      credentials: "include", // Ensures cookies are sent with the request
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("User data:", data);
        router.push("/"); // Redirect user after login
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        // router.push("/login"); // Redirect back to login page if authentication fails
      });
  }, []);

  return <p>Logging you in...</p>;
}
