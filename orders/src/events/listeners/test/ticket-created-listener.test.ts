import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@sfticketing/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../../models/tickets";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event (argument receibed by onMessage function inside listener)
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Valid Title",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object (argument receibed by onMessage function inside listener)
  // @ts-ignore (message has a lot of props, dont panic ts)
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};
it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});
