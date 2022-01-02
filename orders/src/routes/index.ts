import express, { Request, Response } from "express";
import { requiredAuth } from "@hrotickets/common";
import { Order } from "../models/order";

let router = express.Router();

router.get("/api/orders", requiredAuth, async (req: Request, res: Response) => {
  let orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket"
  );
  res.send(orders);
});

export { router as indexOrderRouter };
