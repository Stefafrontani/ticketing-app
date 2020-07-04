import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import userRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = userRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => console.log(payment)
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft(); // REnder time left in the first render
    const timerId = setInterval(findTimeLeft, 1000) // Update that time left every second

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  };

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51H0vjFJOyDKpgw80IWOsRiw7MjWSBqPaAcUCcaQcI8zyypEs0q7NCF5uL1vfiPgV8p1p1SNNDcN6CPsMIm2zXnQ000zvjh11sj"
        amount={order.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}

export default OrderShow;