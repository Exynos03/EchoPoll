import express from "express";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth.route";
import { isAuthenticated } from "./middleware/auth.middleware";
import "./config/passport"; // Import Passport configuration
import roomRouter from "./routes/room.route";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to `true` in production if using HTTPS
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRouter);
app.use("/room", roomRouter)


const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// app.on("error", (err) => {
//   if (err?.code a === "EADDRINUSE") {
//     console.error(`Port ${PORT} is already in use. Try using a different port.`);
//     process.exit(1);
//   } else {
//     console.error("Server error:", err);
//   }
// });