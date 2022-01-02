import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@hrotickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: {
      id: string;
      title: string;
      price: number;
      userId: string;
      version: number;
    },
    msg: Message
  ) {
    let { title, price, id } = data;
    let ticket = Ticket.build({ title, price, id });
    await ticket.save();

    //after the save is successful we need to "ack"
    msg.ack();
  }
}
