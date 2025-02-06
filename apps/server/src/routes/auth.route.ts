import express from "express";
import passport from "passport";

const authRouter = express.Router();

// Route to start Google OAuth flow
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to profile or home page
    res.redirect("http://localhost:3000/auth/callback");
  }
);

// Route to fetch the current user's profile
authRouter.get("/profile", (req, res) => {
  if (!req.user) {
    return res.redirect("/login"); // Redirect if user is not authenticated
  }
  console.log("backend is fine!")
  res.json(req.user); // Send user data as JSON
});

// Route to log out the user
authRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.redirect("/"); // Redirect to home page after logout
  });
});

export default authRouter;