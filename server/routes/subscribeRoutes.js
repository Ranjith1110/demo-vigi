import express from "express";
import { subscribeHandler } from "../controllers/subscribeController.js";
const router = express.Router();

router.post("/", subscribeHandler);

export default router;
