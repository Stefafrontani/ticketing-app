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

it("sets the orderId /*userId*/ of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // We emit an order:created ticket and that updates the ticket. We have to refetch it
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the mssage", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // Inspect the mock function in detail
  // @ts-ignore - We know .mock exists in there
  // natsWrapper.client.publish.mock.calls[0][1];

  // Alternatively, we can do this to tell TS that publish is a mock function and enable the .mock method
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  // @ts-ignore - We know .mock exists in there
  console.log(natsWrapper.client.publish.mock.calls);
  console.log(ticketUpdatedData.orderId);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
