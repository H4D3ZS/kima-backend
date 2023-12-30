
import express from "express";
import stripe from "stripe";
import {  updateMemberType } from "./member.model";
import {STRIPE} from "config"

const stripeSecretKey = "sk_test_51NkM0pFcfThzV7D63Dgh7KZTqlNXCBgWhU2RttBUdp1Y6cOcdtSQRzg3Ibsgzzn1uVDpm91DGM0ndbKpHx2HJ8zm00SNaEqrCE";
const stripeClient = new stripe(stripeSecretKey);

export const webhookRouter = express.Router();

webhookRouter.post("/stripe-webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = STRIPE.STRIPE_END_POINT_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const sessionId = event.data.object.id;
      const checkoutSession = await stripeClient.checkout.sessions.retrieve(sessionId);

      const {userId,type} = checkoutSession.metadata
   
      if (checkoutSession.payment_status === "paid") {
       const user = await updateMemberType(type, userId);
        console.log(`User ${user.email} created successfully after payment`);
      } else {
        console.log("Payment was not successful");
      }
    }
  } catch (error) {
    console.error("Error handling webhook event:", error.message);
    return res.status(500).send("Internal Server Error");
  }

  res.status(200).end();
});
