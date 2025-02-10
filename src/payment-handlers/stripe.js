import Stripe from "stripe";

export const createCheckoutSession = async ({ customer_email, metadata, discounts, lineItems }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata, //optional
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    discounts,
    lineItems,
  });

  return paymentData;
};

// lineItems: [
//     {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: "T-shirt",
//         },
//         unit_amount: 2000, //base price of the product
//       },
//       quantity: 1,
//     },
//   ],
