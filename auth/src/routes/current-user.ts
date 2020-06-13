import express from "express";
import { currentUser } from "@sfticketing/common";
import { requireAuth } from "@sfticketing/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, requireAuth, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
