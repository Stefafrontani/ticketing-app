import express, { Request, Response } from "express";
import { Ticket } from "../models/tickets";
import { NotFoundError } from "@sfticketing/common";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  console.log(ticket);
  res.send(ticket);
});

export { router as showTicketRouter };
