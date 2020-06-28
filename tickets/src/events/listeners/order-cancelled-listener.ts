import { Message } from "node-nats-streaming";
import { Listener, OrderCancelledEvent, Subjects } from "@sfticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as not reserved
    ticket.set({ orderId: undefined });

    // Save the ticket
    await ticket.save();

    // Publish an event to make other service know the ticket was updated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    // Ack the message
    msg.ack();
  }
}
