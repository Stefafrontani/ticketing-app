import express from "express";
import jwt from "jsonwebtoken";

import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/users";
import { BadRequestError } from "../errors/bad-request-error";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  // Equals to: !req.session && !req.session.jwt
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }

  // When jwt tries to verify that token, if that jwt was in someway modified or messed around with, jwt library will throw an error. Thats why we have to put the code inside a try catch block
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    res.send({ currentUser: payload });
  } catch (error) {
    res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
