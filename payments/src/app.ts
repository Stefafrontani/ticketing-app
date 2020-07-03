import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@sfticketing/common";
import { createChargeRouter } from './routes/new';

const app = express();
app.set("trust proxy", true); // Express service will be behind nginx proxy so traffic is been proxyed to our app through ingress-nginx. With this line, we tell express to accept (trust) the proxy ingress-nginx anyways
app.use(json());
app.use(
  cookieSession({
    signed: false, // not encrypted
    secure: process.env.NODE_ENV !== "test", // cookies only used when https protection
  })
);

app.use(currentUser);

app.use(createChargeRouter);

app.all("*", (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

export { app };
