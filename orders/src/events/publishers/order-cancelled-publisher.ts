import { Publisher, OrderCancelledEvent, Subjects } from "@sfticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
