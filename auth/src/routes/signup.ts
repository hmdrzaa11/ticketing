import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@hrotickets/common";
import { User } from "../models/user";

let router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("password must between 4 and 20"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    let user = User.build({ email, password });
    await user.save();
    //generate token
    let userJwt = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );
    //store in on session
    req.session = { jwt: userJwt }; //do it in this fashion and do not use 'req.session.jwt'
    res.status(201).send(user);
  }
);

export { router as signupRouter };
