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

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.json());
app.use("/api/items", itemRoutes);
app.use("/api/billing", orderSummaryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/purchase-bills", purchaseBillRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscribe", subscribeRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
