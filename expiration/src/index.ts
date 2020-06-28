import { natsWrapper } from "./nats-wrapper";

const start = async () => {
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
  } catch (err) {
    console.log(err);
  }
};

start();
