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
import cors from "cors"
import { validateRoomID } from "./middleware/validRoomID.middleware";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed
    methods: ['GET', 'POST']
  }
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to `true` in production if using HTTPS
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000, // 3 day
  },
})

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
io.use((socket, next) => {
  sessionMiddleware(socket.request as any, {} as any, (err?: any) => {
    if (err) {
      return next(new Error("Session middleware failed"));
    }
    next();
  });
});
io.use(validateRoomID)

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

server.listen(PORT, async () => {
  await initializeServices();
  console.log(`Server is running on ${PORT}`);
});
