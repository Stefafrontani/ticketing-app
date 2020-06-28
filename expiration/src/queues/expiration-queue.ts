import Queue from "bull";

interface Payload {
  orderId: string;
}

// order:expiration will be the name of the collection of the jobs that will be saved
const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(
    "I want to publish an expiration:complete event for orderId",
    job.data.orderId
  );
});

export { expirationQueue };
