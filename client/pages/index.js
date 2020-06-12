import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1> You are signed in </h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  // Comment the refactor because its important to understand the request we need to make, differing the server and the browser environments
  /*   if (typeof window === "undefined") {
    // We are on the server !!
    // Request should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser
    const { data } = await axios.get(
      // Look at the ingress We also have to add the ingress-srv.yaml: it has a certain array of rules to decide the domain the request will be redirected to. in our case, that rule, that domain, is ticketing.dev
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
      {
        // rules:
        // - host: ticketing.dev //Inside ingress-srv-yaml -> In the request theres no clut about what domain to used so ingress nginx has no clue where to apply those rolues
        headers: {
          ...context.req.headers,
          Host: "ticketing.dev", // This is included in the req object
        },
      }
    );
    return data;
  } else {
    // We are on the browser !!
    // Request should be made with a base url of ''
    const { data } = await axios.get("/api/users/currentuser");
    return data;
  } */

  console.log("Landing page");
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentuser");

  return data;
};

export default LandingPage;
