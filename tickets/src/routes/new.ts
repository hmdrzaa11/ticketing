import { requiredAuth, validateRequest } from "@hrotickets/common";
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { natsWrapper } from "../nats-wrapper";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { Ticket } from "../models/ticket";

let router = Router();

router.post(
  "/api/tickets",
  requiredAuth,
  [
    body("title").trim().not().isEmpty().withMessage("title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("price must be grater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { title, price } = req.body;
    let ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
