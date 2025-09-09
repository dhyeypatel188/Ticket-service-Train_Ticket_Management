import express from "express";
import "reflect-metadata"; // <-- This must be the FIRST import
import cors from "cors";
import bodyParser from "body-parser";
import ticketRouter from "./Module/Tickets/tickets.routers";
import trainScheduleRoute from "./Module/TrainSchedule/train-schedule.router";
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins (you can restrict to your frontend URL later)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options("*", cors());

app.use("/api", trainScheduleRoute);
app.use("/api", ticketRouter);
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware

export default app;
