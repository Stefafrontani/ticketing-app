import express, { Request, Response } from "express";
import { requireAuth } from "@sfticketing/common";
import { Order } from "../models/orders";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("ticket"); // basically it get the ticket data and put it in that property inside order. order.ticket.whateverMongooseBringsFromTicketDocument

  res.send(orders);
});

export { router as indexOrderRouter };
