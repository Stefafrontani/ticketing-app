const LandingPage = ({ color }) => {
  console.log("I'm on the server: color", color);
  return <h1>Home page</h1>;
};

LandingPage.getInitialProps = () => {
  console.log("I'm on the server");

  return { color: "red" };
};

export default LandingPage;
