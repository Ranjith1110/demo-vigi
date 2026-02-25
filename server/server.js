import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";

import itemRoutes from "./routes/itemRoutes.js";
import orderSummaryRoutes from "./routes/orderSummaryRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import purchaseBillRoutes from "./routes/purchaseBillRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* ===============================
   ✅ CORS CONFIGURATION
================================= */

const allowedOrigins = [
  process.env.CLIENT_URL,       // Production frontend (Render)
  "http://localhost:5173",      // Local frontend (Vite)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ===============================
   ✅ BODY PARSERS
================================= */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());

/* ===============================
   ✅ ROUTES
================================= */

app.use("/api/items", itemRoutes);
app.use("/api/billing", orderSummaryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/purchase-bills", purchaseBillRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscribe", subscribeRoutes);

/* ===============================
   ✅ SERVER START
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);