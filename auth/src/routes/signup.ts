import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import { RequestValidationError } from "../errors/request-validation-error";
import { User } from "../models/users";
import { BadRequestError } from "../errors/bad-request-error";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_KEY! // TS will complain that env.JWT_KEY can have a value of undefined. We have to check this before this line of code. We do it in the start funciton on the index.ts file because if we do it here, we would come up with this error only when trying to access this route, BAD. The process env variables is needed to be checked right before initialization of the app.
    );

    // Store in on session object
    // @ts-ignore // The problem i want to ignore is this: The Session object asked for 3 properties (isNew, isPopulated, isChanged). The issue in here is that the isNew property is created as a writable: false property so it sent an error whever trying to define it! DAMN
    req.session = {
      jwt: userJwt,
    };
    // (*Cookie decoding)
    res.status(201).send(user);
  }
);

export { router as signupRouter };
