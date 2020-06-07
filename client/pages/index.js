const LandingPage = ({ currentUser }) => {
  console.log(currentUser);

  return <h1>Home page</h1>;
};

LandingPage.getInitialProps = () => {
  const response = await axios.get('/api/users/currentuser')

  return response.data;
};

export default LandingPage;
