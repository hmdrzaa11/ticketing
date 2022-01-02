import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TickedCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  /*
    "subject:Subjects.TicketCreated" this is for typescript because if you do not put the ":" annotation before it
    its going to think you might later change it "this.subject = 'sss'" but if you put annotation before it's going to happy
   */
  queueGroupName = "payments-service";
  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    //this the place we put our real logic
    console.log("Event Data ", data);
    msg.ack();
  }
}
