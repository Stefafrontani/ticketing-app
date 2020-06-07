import "bootstrap/dist/css/bootstrap.css";

// When defining an app.js component, next will wrap the page component we visit (home, index or banana) and return it
// This is because if we ever wanted to give global css, only in this _app.js, when we go to /banana, index.js cs files modules will not be loaded, this is the reason behing wrapping the component to show inside this app component, to enable global modules to all pages

export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
