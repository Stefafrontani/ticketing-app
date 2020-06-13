import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@sfticketing/common";

import { Password } from "../services/password";
import { User } from "../models/users";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! // TS will complain that env.JWT_KEY can have a value of undefined. We have to check this before this line of code. We do it in the start funciton on the index.ts file because if we do it here, we would come up with this error only when trying to access this route, BAD. The process env variables is needed to be checked right before initialization of the app.
    );

    // Store in on session object
    // @ts-ignore // The problem i want to ignore is this: The Session object asked for 3 properties (isNew, isPopulated, isChanged). The issue in here is that the isNew property is created as a writable: false property so it sent an error whever trying to define it! DAMN
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
