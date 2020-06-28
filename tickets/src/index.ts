import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  // Usually something like t hat the url mongodb://localhost, but now we have the mongo running inside a pod on the cluster, the one we created in auth-mongo-depl, not localhost. We should write then that clusterIp service name to connect to that mongoDB instance on the pod: auth-mongo.srv. We complete that URL with the port (27017 by default and /databseName - if we do not have one, mongoDB or mongoose will create one for us)
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // In case the NATS deployment goes down, we will listen to that close event and exit the whole process. Thanks to skaffold, the process will be restarted.
    natsWrapper.client.on("close", () => {
      // This closes the process whenever we loose conenction with NATS
      console.log("NATS connection closed!");
      process.exit();
    });
    // This closes the client whenever we end the terminal process
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      // Not that relevant config options, stop mongoose warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to Auth - MongoDB");
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
