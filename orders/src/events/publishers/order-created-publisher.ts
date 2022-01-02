import { Publisher, OrderCreatedEvent, Subjects } from "@hrotickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
