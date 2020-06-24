import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@sfticketing/common";
import { Order, OrderStatus } from "../models/orders";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    /*Technically we are not deleting, we are updating the record status so it would not be a 204 for delete, nor a method delete on the route butt.. its ok. Not big of a deal */
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
