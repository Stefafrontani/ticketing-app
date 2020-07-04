import buildClient from "../api/build-client";
import Header from "../components/header";
import "bootstrap/dist/css/bootstrap.css";

// When defining an app.js component, next will wrap the page component we visit (home, index or banana) and return it
// This is because if we ever wanted to give global css, only in this _app.js, when we go to /banana, index.js cs files modules will not be loaded, this is the reason behing wrapping the component to show inside this app component, to enable global modules to all pages
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  );
};

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

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  // We sure have components that does not have getInitialProps to call
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Called manually the getInitialProps function from Component
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, cliet, data.currentUser);
  }

  return {
    pageProps,
    ...data, // For the currentUser Prop - We can receive it as a currentUser prop inside AppComponent
  };
};

export default AppComponent;
