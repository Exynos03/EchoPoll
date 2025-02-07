import express, { NextFunction } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth.route";
import "./config/passport";
import roomRouter from "./routes/room.route";
import { connectRedis } from "./config/redis";
import { connectKafka } from "./config/kafka";
import prisma from "./config/prisma";
import { startKafkaConsumer } from "./services/kafka.service";
import { setupRoomSocket } from "./sockets/room.socket";
import cors from "cors";
import { validateRoomID } from "./middleware/validRoomID.middleware";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000,
    sameSite: "lax",
  },
});

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

    passport.authenticate("session", (authErr: any, user: any) => {
      if (authErr || !user) {
        return next(new Error("Unauthorized"));
      }
      (socket as any).user = user;
      next();
    })(socket.request, {} as any, next);
  });
});
io.use(validateRoomID);

// Routes
app.use("/auth", authRouter);
app.use("/room", roomRouter);

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

// Start Kafka consumer and set up room socket handling
startKafkaConsumer();
setupRoomSocket(io);

const PORT = process.env.PORT || 8080;

server.listen(PORT, async () => {
  await initializeServices();
  console.log(`Server is running on ${PORT}`);
});
