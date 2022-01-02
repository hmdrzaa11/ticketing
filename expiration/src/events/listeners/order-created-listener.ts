import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@hrotickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    let delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`waiting ${delay} milliseconds to precess the job`);
    await expirationQueue.add(
      { orderId: data.id },
      {
        delay,
      }
    );

    msg.ack();
  }
}
