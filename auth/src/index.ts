import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  // Usually something like t hat the url mongodb://localhost, but now we have the mongo running inside a pod on the cluster, the one we created in auth-mongo-depl, not localhost. We should write then that clusterIp service name to connect to that mongoDB instance on the pod: auth-mongo.srv. We complete that URL with the port (27017 by default and /databseName - if we do not have one, mongoDB or mongoose will create one for us)
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
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
