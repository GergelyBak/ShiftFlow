import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/me", authMiddleware, (req: any, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

export default router;