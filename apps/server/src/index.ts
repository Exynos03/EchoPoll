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
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRouter);
app.use("/create", roomRouter)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});