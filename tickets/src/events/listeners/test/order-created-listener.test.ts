import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@sfticketing/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/tickets";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: "Valid Title",
    price: 20,
    userId: "asd",
  });
  await ticket.save();

  // Create a fake data event object
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "noneeded",
    expiresAt: "noneeded",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Create a fake msg event object
  // @ts-ignore (message has a lot of props, dont panic ts)
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};
