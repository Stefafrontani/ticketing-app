import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server
    // Add baseUrl and headers (for the cookie for example) and behave like that
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // Browser env - nothing to add to the axios instance
    return axios.create({
      baseUrl: "/", // nothing to modified
    });
  }
};
