import express from "express";
import http from 'http';
import { Server } from 'socket.io';
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth.route";
import { isAuthenticated } from "./middleware/auth.middleware";
import "./config/passport"; // Import Passport configuration
import roomRouter from "./routes/room.route";
import { connectRedis } from "./config/redis";
import { connectKafka } from "./config/kafka";
import prisma from "./config/prisma";
import { startKafkaConsumer } from "./services/kafka.service";
import { setupRoomSocket } from "./sockets/room.socket";

const app = express();
const server = http.createServer(app);
const io = new Server(server);


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

// Initialize Redis and Kafka
const initializeServices = async () => {
  try {
    await connectRedis();
    await connectKafka();
    await prisma.$connect();
  } catch (error) {
    process.exit(1);
  }
};

startKafkaConsumer()

setupRoomSocket(io)

const PORT = process.env.PORT || 7000;

app.listen(PORT, async () => {
  await initializeServices();
  console.log(`Server is running on ${PORT}`);
});

// app.on("error", (err) => {
//   if (err?.code a === "EADDRINUSE") {
//     console.error(`Port ${PORT} is already in use. Try using a different port.`);
//     process.exit(1);
//   } else {
//     console.error("Server error:", err);
//   }
// });