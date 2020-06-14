import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@sfticketing/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

export { app };
